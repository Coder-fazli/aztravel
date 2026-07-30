'use client'

import { useMemo, useState } from 'react'
import { evaluateForm } from '@/lib/evisa/rulesEngine'
import { submitApplication, type ApplicantDraft } from '@/lib/actions/evisa'
import DynamicField from './DynamicField'
import styles from '../../app/[locale]/apply/apply.module.css'

type Locale = 'en' | 'es' | 'ar'
type WizardStep = 'visaType' | 'details' | 'confirmation'

export default function ApplyWizard({
  formElements,
  countries,
  visaTypes,
  locale,
  initialVisaType,
}: {
  formElements: any[]
  countries: any[]
  visaTypes: { key: string; label: any; fromPrice: number }[]
  locale: Locale
  initialVisaType?: string
}) {
  const [step, setStep] = useState<WizardStep>('visaType')
  const [visaType, setVisaType] = useState<string>(
    (initialVisaType && visaTypes.some(v => v.key === initialVisaType)) ? initialVisaType : (visaTypes[0]?.key ?? ''),
  )
  const [applicants, setApplicants] = useState<ApplicantDraft[]>([])
  const [country, setCountry] = useState<string>('')
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ applicationNumber: string; totalPrice: number } | null>(null)

  const personIndex = applicants.length + 1
  const isFirstPerson = personIndex === 1

  const selectedCountry = useMemo(() => countries.find(c => c.code === country) ?? null, [countries, country])

  const visibleElements = useMemo(
    () => formElements.filter(el => isFirstPerson || el.isNewPerson),
    [formElements, isFirstPerson],
  )

  const evaluation = useMemo(
    () => evaluateForm(formElements as any, selectedCountry as any, visaType, answers),
    [formElements, selectedCountry, visaType, answers],
  )

  const currentPrice = evaluation.price

  function setAnswer(fieldKey: string, value: any) {
    setAnswers(prev => ({ ...prev, [fieldKey]: value }))
    setErrors(prev => { const next = { ...prev }; delete next[fieldKey]; return next })
  }

  function validateDetails(): boolean {
    const nextErrors: Record<string, string> = {}
    if (!country) nextErrors.country = 'Please select your country'

    for (const el of visibleElements) {
      if (!el.required || !evaluation.visibleFields.has(el.fieldKey)) continue
      const v = answers[el.fieldKey]
      const empty = v === undefined || v === '' || (Array.isArray(v) && v.length === 0)
      if (empty) nextErrors[el.fieldKey] = `"${el.label?.[locale] || el.label?.en}" is required`
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function resetForNextPerson() {
    setAnswers({})
    setErrors({})
    // country carries over as a sensible default — families usually share it, still editable
  }

  function handleAddPerson() {
    if (!validateDetails()) return
    setApplicants(prev => [...prev, { country, visaType, answers }])
    resetForNextPerson()
  }

  async function handleSubmit() {
    if (!validateDetails()) return
    setSubmitting(true)
    try {
      const finalApplicants = [...applicants, { country, visaType, answers }]
      const res = await submitApplication(finalApplicants)
      setResult(res)
      setStep('confirmation')
    } catch (e) {
      alert('Something went wrong submitting your application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {step !== 'confirmation' && (
          <>
            <div className={styles.crumb}><a href="#">Home</a><span>›</span><span className={styles.cur}>e-Visa Application</span></div>

            <div className={styles.stepper}>
              <div className={styles.stepNode}>
                <div className={`${styles.bubble} ${step === 'visaType' ? styles.bubbleActive : styles.bubbleDone}`}>
                  {step === 'visaType' ? '1' : '✓'}
                </div>
                <div className={`${styles.stepLbl} ${step === 'visaType' ? styles.stepLblActive : styles.stepLblDone}`}>Visa Type</div>
              </div>
              <div className={`${styles.stepLine} ${step === 'details' ? styles.stepLineDone : ''}`} />
              <div className={styles.stepNode}>
                <div className={`${styles.bubble} ${step === 'details' ? styles.bubbleActive : ''}`}>2</div>
                <div className={`${styles.stepLbl} ${step === 'details' ? styles.stepLblActive : ''}`}>
                  {isFirstPerson ? 'Your Details' : `Applicant ${personIndex}`}
                </div>
              </div>
            </div>
            <div className={styles.progressTxt}>Step {step === 'visaType' ? 1 : 2} of 2</div>
          </>
        )}

        {/* ═══ STEP 1: VISA TYPE ═══ */}
        {step === 'visaType' && (
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardIcon}>🛂</div>
                <div>
                  <div className={styles.cardTag}>STEP 01</div>
                  <div className={styles.cardTitle}>Visa Type</div>
                  <div className={styles.cardSub}>Fill in all required fields to continue</div>
                </div>
              </div>

              <div className={styles.inputArea}>
                <label className={styles.fLabel}>Processing Type<span className={styles.req}>*</span></label>
                <div className={styles.visaGrid}>
                  {visaTypes.map(vt => (
                    <label
                      key={vt.key}
                      className={`${styles.visaCard} ${visaType === vt.key ? styles.visaCardSelected : ''}`}
                      onClick={() => setVisaType(vt.key)}
                    >
                      <div className={styles.visaInner}>
                        <div className={styles.visaIconWrap}>{vt.key === 'urgent' ? '⚡' : '⏱'}</div>
                        <div className={styles.visaName}>{vt.label?.[locale] || vt.label?.en || vt.key}</div>
                        <div className={styles.visaPrice}>from ${vt.fromPrice}</div>
                      </div>
                      <div className={styles.visaCheck}>✓</div>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.nav}>
                <button className={`${styles.btnBack} ${styles.btnBackHidden}`}>← Back</button>
                <div className={styles.navRight}>
                  <button className={styles.btnNext} disabled={!visaType} onClick={() => setStep('details')}>
                    Continue <span className={styles.arr}>→</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.sidebar}>
              <div className={styles.warnBox}>
                <h5>⚠ Before you start</h5>
                <p>Have your passport, a digital photo, and a valid email address ready.</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: COUNTRY + DETAILS ═══ */}
        {step === 'details' && (
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardIcon}>📝</div>
                <div>
                  <div className={styles.cardTag}>STEP 02</div>
                  <div className={styles.cardTitle}>{isFirstPerson ? 'Your Details' : `Applicant ${personIndex}`}</div>
                  <div className={styles.cardSub}>Fill in all required fields to continue</div>
                </div>
                <div className={styles.priceChip}>
                  <div className={styles.priceChipLbl}>Price</div>
                  <div className={styles.priceChipVal}>${currentPrice}</div>
                </div>
              </div>

              <div className={styles.inputArea}>
                <label className={styles.fLabel}>Your country<span className={styles.req}>*</span></label>
                <select className={styles.inputText} value={country} onChange={e => setCountry(e.target.value)}>
                  <option value="">Select country of your travel document</option>
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>{c.name?.[locale] || c.name?.en || c.code}</option>
                  ))}
                </select>
                {errors.country && <div className={styles.errMsg}>{errors.country}</div>}
              </div>

              {visibleElements
                .filter(el => evaluation.visibleFields.has(el.fieldKey))
                .map(el => (
                  <DynamicField
                    key={el.fieldKey}
                    element={el}
                    value={answers[el.fieldKey]}
                    onChange={v => setAnswer(el.fieldKey, v)}
                    locale={locale}
                    countries={countries}
                    dateInfo={evaluation.dateInfoByField[el.fieldKey]}
                    error={errors[el.fieldKey]}
                  />
                ))}

              <div className={styles.nav}>
                <button className={styles.btnBack} onClick={() => setStep('visaType')}>← Back</button>
                <div className={styles.navRight}>
                  <button className={styles.btnAddPerson} onClick={handleAddPerson} disabled={submitting}>
                    + Add Another Person
                  </button>
                  <button className={styles.btnNext} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit Application'} <span className={styles.arr}>✈</span>
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.sidebar}>
              <div className={styles.priceCard}>
                <h5>{isFirstPerson ? 'Price' : `Applicant ${personIndex}`}</h5>
                <h3>${currentPrice}</h3>
              </div>
              {applicants.length > 0 && (
                <div className={styles.warnBox}>
                  <h5>👥 Party so far</h5>
                  <p>{applicants.length} applicant{applicants.length !== 1 ? 's' : ''} added. Complete this person to submit the whole application.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ CONFIRMATION ═══ */}
        {step === 'confirmation' && result && (
          <div className={styles.grid}>
            <div>
              <div className={styles.successBanner}>
                <div className={styles.successIcon}>✅</div>
                <div>
                  <div className={styles.successTitle}>Application Submitted</div>
                  <div className={styles.successSub}>Save your reference number — you'll need it to check status and pay</div>
                </div>
                <div className={styles.confRefBadge}>Ref <strong>#{result.applicationNumber}</strong></div>
              </div>

              <div className={styles.priceRow}>
                <div>
                  <div className={styles.priceRowLbl}>Total Price</div>
                </div>
                <div className={styles.priceRowVal}>${result.totalPrice}</div>
              </div>

              <button className={styles.payBtn} disabled title="Payment integration is coming soon">
                💳 Proceed to Payment (coming soon)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
