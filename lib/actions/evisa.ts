'use server'

import { connectDb } from '@/lib/db/connect'
import FormElement from '@/lib/db/models/evisa/FormElement'
import Country from '@/lib/db/models/evisa/Country'
import Evisa from '@/lib/db/models/evisa/Evisa'
import { evaluateForm } from '@/lib/evisa/rulesEngine'
import type { AnswersMap } from '@/lib/evisa/types'

const plain = (d: any) => JSON.parse(JSON.stringify(d))

export async function getPublicFormElements() {
  await connectDb()
  const all = await FormElement.find({}).sort({ orderNum: 1 }).lean()
  return plain(all)
}

export async function getPublicCountries() {
  await connectDb()
  const all = await Country.find({ eligible: true }).sort({ orderNum: 1 }).lean()
  return plain(all)
}

// visa types aren't their own model — they're whatever pricing keys admins
// have attached to countries. Derive the distinct set + a "from $x" price.
export async function getVisaTypes() {
  const countries = await getPublicCountries()
  const byKey = new Map<string, { key: string; label: any; fromPrice: number }>()

  for (const c of countries) {
    for (const p of c.pricing ?? []) {
      const existing = byKey.get(p.key)
      if (!existing || p.price < existing.fromPrice) {
        byKey.set(p.key, { key: p.key, label: p.label, fromPrice: p.price })
      }
    }
  }
  return Array.from(byKey.values())
}

function generateApplicationNumber() {
  const year = new Date().getFullYear()
  const rand = Math.floor(10000 + Math.random() * 90000)
  return `AZ-${year}-${rand}`
}

export type ApplicantDraft = {
  country: string
  visaType: string
  answers: AnswersMap
}

// Recomputes price server-side from the current FormElement/Country rules —
// never trusts whatever price the client had displayed.
export async function submitApplication(applicants: ApplicantDraft[]) {
  await connectDb()

  const [formElements, countries] = await Promise.all([
    FormElement.find({}).lean(),
    Country.find({}).lean(),
  ])

  const applicationNumber = generateApplicationNumber()
  let totalPrice = 0

  const docs = applicants.map((applicant, i) => {
    const country = countries.find((c: any) => c.code === applicant.country) ?? null
    const { price } = evaluateForm(formElements as any, country as any, applicant.visaType, applicant.answers)
    totalPrice += price

    const answers = Object.entries(applicant.answers)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([fieldKey, value]) => ({ fieldKey, value }))

    return {
      applicationNumber,
      applicantIndex: i + 1,
      country: applicant.country,
      visaType: applicant.visaType,
      answers,
      price,
      status: 'submitted',
    }
  })

  await Evisa.insertMany(docs)

  return { applicationNumber, totalPrice }
}
