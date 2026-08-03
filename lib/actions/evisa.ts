'use server'

import { connectDb } from '@/lib/db/connect'
import FormElement from '@/lib/db/models/evisa/FormElement'
import Country from '@/lib/db/models/evisa/Country'
import Evisa from '@/lib/db/models/evisa/Evisa'
import Settings from '@/lib/db/models/Settings'
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

// Visa types (Standard/Urgent/...) are global — a flat surcharge on top of
// whichever country's baseFee, same surcharge for every country. Configured
// once in Settings, not per-country.
export async function getVisaTypes(): Promise<{ key: string; label: any; surcharge: number }[]> {
  await connectDb()
  const settings = await Settings.findOne({ key: 'site' }).lean() as any
  return settings?.evisaVisaTypes ?? []
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

  const [formElements, countries, visaTypes] = await Promise.all([
    FormElement.find({}).lean(),
    Country.find({}).lean(),
    getVisaTypes(),
  ])

  const applicationNumber = generateApplicationNumber()
  let totalPrice = 0

  const docs = applicants.map((applicant, i) => {
    const country = countries.find((c: any) => c.code === applicant.country) ?? null
    const surcharge = visaTypes.find((v) => v.key === applicant.visaType)?.surcharge ?? 0
    const { price } = evaluateForm(formElements as any, country as any, surcharge, applicant.answers)
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
