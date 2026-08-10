'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { evaluateForm } from '@/lib/evisa/rulesEngine'
import { submitApplication, type ApplicantDraft } from '@/lib/actions/evisa'
import DynamicField from './DynamicField'
import styles from '../../app/[locale]/apply/apply.module.css'

type Locale = 'en' | 'es' | 'ar'
type WizardStep = 'visaType' | 'trip' | 'personal' | 'documents' | 'confirmation'

// Real 4-step breakdown, ported from apply.blade.php's STEPS/STEP_ENDS
// (Step 01 Visa Type / Step 02 Trip Details / Step 03 Personal Information /
// Step 04 Documents) rather than one long form. Fields are assigned to a
// step by fieldKey, matching the original's field groupings.
const STEP_META: Record<Exclude<WizardStep, 'confirmation'>, { tag: string; title: string }> = {
  visaType: { tag: 'STEP 01', title: 'Visa Type' },
  trip: { tag: 'STEP 02', title: 'Trip Details' },
  personal: { tag: 'STEP 03', title: 'Personal Information' },
  documents: { tag: 'STEP 04', title: 'Documents' },
}
const STEP_ORDER: Exclude<WizardStep, 'confirmation'>[] = ['visaType', 'trip', 'personal', 'documents']

// Provisional reference shown before submission, matching the original's
// $app_ref = 'AZ-' . strtoupper(substr(md5(...), 0, 8)) — a client-side
// placeholder only; the real applicationNumber is assigned server-side on submit.
function generateProvisionalRef() {
  const hex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  return `AZ-${hex.toUpperCase()}`
}

const TRIP_FIELDS = new Set(['travel_document', 'purpose_of_visit', 'travel_date'])
const PERSONAL_FIELDS = new Set(['surname', 'given_names', 'occupation', 'email', 'phone', 'permanent_address', 'place_of_stay'])
const DOCUMENT_FIELDS = new Set(['passport_expiry', 'passport_image', 'terms'])

function stepForField(fieldKey: string): Exclude<WizardStep, 'confirmation' | 'visaType'> {
  if (TRIP_FIELDS.has(fieldKey)) return 'trip'
  if (DOCUMENT_FIELDS.has(fieldKey)) return 'documents'
  return 'personal' // PERSONAL_FIELDS + any admin-added field defaults here
}

// Inline icons matching the site's own style (see BookingWidget.tsx's
// CalendarIcon/GuestsIcon/CheckIcon) — plain strokes, no emoji.
function PassportIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2" width="13" height="15" rx="2" />
      <circle cx="9.5" cy="7.5" r="2" />
      <path d="M6.5 13c0-1.7 1.3-3 3-3s3 1.3 3 3" />
    </svg>
  )
}
function GlobeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9.5" cy="9.5" r="7.5" />
      <path d="M2 9.5h15M9.5 2c2.2 2 3.3 4.7 3.3 7.5s-1.1 5.5-3.3 7.5c-2.2-2-3.3-4.7-3.3-7.5S7.3 4 9.5 2Z" />
    </svg>
  )
}
function UserIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9.5" cy="6" r="3.2" />
      <path d="M3 17c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" />
    </svg>
  )
}
function DocumentsIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3h8l3 3v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M6.5 9h6M6.5 12h6M6.5 6h3" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.5V8l2.5 1.5" />
    </svg>
  )
}
function BoltIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1.5 3 9.5h4l-1 5 6-8H8l1-5Z" />
    </svg>
  )
}

const STEP_ICON: Record<Exclude<WizardStep, 'confirmation'>, ReactNode> = {
  visaType: <PassportIcon />,
  trip: <GlobeIcon />,
  personal: <UserIcon />,
  documents: <DocumentsIcon />,
}

export default function ApplyWizard({
  formElements,
  countries,
  visaTypes,
  locale,
  initialVisaType,
}: {
  formElements: any[]
  countries: any[]
  visaTypes: { key: string; label: any; surcharge: number }[]
  locale: Locale
  initialVisaType?: string
}) {
  // generateProvisionalRef() is random -- calling it in the initializer ran
  // it once during SSR and again on client hydration, producing two
  // different strings for the same text node (React hydration error #418).
  // Render nothing until after mount, then generate it client-side only.
  const [provisionalRef, setProvisionalRef] = useState('')
  useEffect(() => { setProvisionalRef(generateProvisionalRef()) }, [])
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

  // Without this, the browser keeps whatever scroll position the user was
  // at on the previous (usually taller) step -- landing on a short new step
  // already scrolled past its content, looking like it "jumped to the bottom".
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const personIndex = applicants.length + 1
  const isFirstPerson = personIndex === 1

  const selectedCountry = useMemo(() => countries.find(c => c.code === country) ?? null, [countries, country])

  const visibleElements = useMemo(
    () => formElements.filter(el => isFirstPerson || el.isNewPerson),
    [formElements, isFirstPerson],
  )

  const visaTypeSurcharge = useMemo(
    () => visaTypes.find(v => v.key === visaType)?.surcharge ?? 0,
    [visaTypes, visaType],
  )

  const evaluation = useMemo(
    () => evaluateForm(formElements as any, selectedCountry as any, visaTypeSurcharge, answers),
    [formElements, selectedCountry, visaTypeSurcharge, answers],
  )

  const currentPrice = evaluation.price

  // Running total for the whole party — sums every already-added applicant's
  // own price plus whoever's currently being filled in. Recomputed per
  // applicant (not just summed once) since each person can have a different
  // country/answers and therefore a different price.
  const partyTotal = useMemo(() => {
    const priorTotal = applicants.reduce((sum, a) => {
      const c = countries.find(cc => cc.code === a.country) ?? null
      // whole party shares one visaType (chosen once in Step 1), so the same surcharge applies
      return sum + evaluateForm(formElements as any, c as any, visaTypeSurcharge, a.answers).price
    }, 0)
    return priorTotal + currentPrice
  }, [applicants, countries, formElements, visaTypeSurcharge, currentPrice])

  const fieldsByStep = useMemo(() => {
    const groups: Record<'trip' | 'personal' | 'documents', any[]> = { trip: [], personal: [], documents: [] }
    for (const el of visibleElements) {
      if (!evaluation.visibleFields.has(el.fieldKey)) continue
      groups[stepForField(el.fieldKey)].push(el)
    }
    return groups
  }, [visibleElements, evaluation.visibleFields])

  const stepIndex = STEP_ORDER.indexOf(step === 'confirmation' ? 'visaType' : step)

  function setAnswer(fieldKey: string, value: any) {
    setAnswers(prev => ({ ...prev, [fieldKey]: value }))
    setErrors(prev => { const next = { ...prev }; delete next[fieldKey]; return next })
  }

  // Country only needs validating once, on the first content step (Trip Details).
  function validateStep(stepFields: any[], includeCountry: boolean): boolean {
    const nextErrors: Record<string, string> = {}
    const orderedKeys: string[] = []
    if (includeCountry) orderedKeys.push('country')
    for (const el of stepFields) orderedKeys.push(el.fieldKey)

    if (includeCountry && !country) nextErrors.country = 'Please select your country'

    for (const el of stepFields) {
      if (!el.required) continue
      const v = answers[el.fieldKey]
      const empty = v === undefined || v === '' || (Array.isArray(v) && v.length === 0)
      if (empty) nextErrors[el.fieldKey] = `"${el.label?.[locale] || el.label?.en}" is required`
    }

    setErrors(prev => ({ ...prev, ...nextErrors }))

    // Errors alone are easy to miss if they land off-screen (especially with
    // the redirect-to-top-of-step scroll on every step change) -- jump the
    // user straight to the first thing that's actually wrong.
    const firstErrorKey = orderedKeys.find(k => nextErrors[k])
    if (firstErrorKey) {
      requestAnimationFrame(() => {
        document.getElementById(`field-${firstErrorKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }

    return Object.keys(nextErrors).length === 0
  }

  function goNext() {
    if (step === 'visaType') { setStep('trip'); return }
    if (step === 'trip') { if (validateStep(fieldsByStep.trip, true)) setStep('personal'); return }
    if (step === 'personal') { if (validateStep(fieldsByStep.personal, false)) setStep('documents'); return }
  }

  function goBack() {
    if (step === 'trip') setStep('visaType')
    else if (step === 'personal') setStep('trip')
    else if (step === 'documents') setStep('personal')
  }

  function resetForNextPerson() {
    setAnswers({})
    setErrors({})
    setStep('trip')
    // country carries over as a sensible default — families usually share it, still editable
  }

  function handleAddPerson() {
    if (!validateStep(fieldsByStep.documents, false)) return
    setApplicants(prev => [...prev, { country, visaType, answers }])
    resetForNextPerson()
  }

  async function handleSubmit() {
    if (!validateStep(fieldsByStep.documents, false)) return
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

  function renderFields(fields: any[]) {
    return fields.map(el => (
      <div id={`field-${el.fieldKey}`} key={el.fieldKey}>
        <DynamicField
          element={el}
          value={answers[el.fieldKey]}
          onChange={v => setAnswer(el.fieldKey, v)}
          locale={locale}
          countries={countries}
          dateInfo={evaluation.dateInfoByField[el.fieldKey]}
          error={errors[el.fieldKey]}
        />
      </div>
    ))
  }

  // Person 2+ get no other visual cue that they're filling in a new applicant
  // (fields just go blank again) -- the step title is the only signal, so it
  // has to say so explicitly instead of repeating the generic step name.
  const currentTitle = step === 'confirmation'
    ? ''
    : (!isFirstPerson && step !== 'visaType')
      ? `Applicant ${personIndex} — ${STEP_META[step].title}`
      : STEP_META[step].title

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {step !== 'confirmation' && (
          <>
            <div className={styles.crumb}><a href="#">Home</a><span>›</span><span className={styles.cur}>e-Visa Application</span></div>

            <div className={styles.refBadge}>
              Provisional ref <strong>{provisionalRef}</strong>&nbsp;<span style={{ color: '#9ca3af' }}>(confirmed after submission)</span>
            </div>

            <div className={styles.stepper}>
              {STEP_ORDER.map((s, i) => (
                <div key={s} style={{ display: 'contents' }}>
                  <div className={styles.stepNode}>
                    <div className={`${styles.bubble} ${i === stepIndex ? styles.bubbleActive : i < stepIndex ? styles.bubbleDone : ''}`}>
                      {i < stepIndex ? '✓' : i + 1}
                    </div>
                    <div className={`${styles.stepLbl} ${i === stepIndex ? styles.stepLblActive : i < stepIndex ? styles.stepLblDone : ''}`}>
                      {STEP_META[s].title}
                    </div>
                  </div>
                  {i < STEP_ORDER.length - 1 && <div className={`${styles.stepLine} ${i < stepIndex ? styles.stepLineDone : ''}`} />}
                </div>
              ))}
            </div>
            <div className={styles.progressTxt}>Step {stepIndex + 1} of {STEP_ORDER.length}</div>
          </>
        )}

        {/* ═══ STEP 1: VISA TYPE ═══ */}
        {step === 'visaType' && (
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardIcon}>{STEP_ICON.visaType}</div>
                <div>
                  <div className={styles.cardTag}>{STEP_META.visaType.tag}</div>
                  <div className={styles.cardTitle}>{STEP_META.visaType.title}</div>
                  <div className={styles.cardSub}>Fill in all required fields to continue</div>
                </div>
              </div>

              <div className={styles.inputArea}>
                <label className={styles.fLabel}>Processing Type<span className={styles.req}>*</span></label>
                {visaTypes.length === 0 && (
                  <div className={styles.warnBox}>
                    <h5>No visa types available yet</h5>
                    <p>An admin needs to add at least one visa type in Admin → E-visa → Visa Types before applicants can apply.</p>
                  </div>
                )}
                <div className={styles.visaGrid}>
                  {visaTypes.map(vt => (
                    <label
                      key={vt.key}
                      className={`${styles.visaCard} ${visaType === vt.key ? styles.visaCardSelected : ''}`}
                      onClick={() => setVisaType(vt.key)}
                    >
                      <div className={styles.visaInner}>
                        <div className={styles.visaIconWrap}>{vt.key === 'urgent' ? <BoltIcon /> : <ClockIcon />}</div>
                        <div className={styles.visaName}>{vt.label?.[locale] || vt.label?.en || vt.key}</div>
                        <div className={styles.visaPrice}>+${vt.surcharge}</div>
                      </div>
                      <div className={styles.visaCheck}>✓</div>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.nav}>
                <button className={`${styles.btnBack} ${styles.btnBackHidden}`}>Back</button>
                <div className={styles.navRight}>
                  <button className={styles.btnNext} disabled={!visaType} onClick={goNext}>
                    Continue
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.sidebar}>
              <div className={styles.warnBox}>
                <h5>Before you start</h5>
                <p>Have your passport, a digital photo, and a valid email address ready.</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: TRIP DETAILS (country + travel document + purpose + date) ═══ */}
        {step === 'trip' && (
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardIcon}>{STEP_ICON.trip}</div>
                <div>
                  <div className={styles.cardTag}>{STEP_META.trip.tag}</div>
                  <div className={styles.cardTitle}>{currentTitle}</div>
                  <div className={styles.cardSub}>Fill in all required fields to continue</div>
                </div>
                <div className={styles.priceChip}>
                  <div className={styles.priceChipLbl}>Total price</div>
                  <div className={styles.priceChipVal}>${partyTotal}</div>
                </div>
              </div>

              <div className={styles.inputArea} id="field-country">
                <label className={styles.fLabel}>Your country<span className={styles.req}>*</span></label>
                <select className={styles.inputText} value={country} onChange={e => setCountry(e.target.value)}>
                  <option value="">Select country of your travel document</option>
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>{c.name?.[locale] || c.name?.en || c.code}</option>
                  ))}
                </select>
                {errors.country && <div className={styles.errMsg}>{errors.country}</div>}
              </div>

              {renderFields(fieldsByStep.trip)}

              <div className={styles.nav}>
                <button className={styles.btnBack} onClick={goBack}>Back</button>
                <div className={styles.navRight}>
                  <button className={styles.btnNext} onClick={goNext}>Continue</button>
                </div>
              </div>
            </div>

            <div className={styles.sidebar}>
              <div className={styles.priceCard}><h5>Total price</h5><h3>${partyTotal}</h3></div>
              {applicants.length > 0 && (
                <div className={styles.warnBox}>
                  <h5>Party so far</h5>
                  <p>{applicants.length} applicant{applicants.length !== 1 ? 's' : ''} added. Now filling in the next person.</p>
                </div>
              )}
              <div className={styles.warnBox}>
                <h5>PAY ATTENTION!</h5>
                <p>
                  Visa issuance periods are determined according to the selected visa type. A standard visa is
                  issued within 1-3 business days, while an urgent visa is issued within 4 hours. When obtaining
                  a visa, the passport must be valid for at least 6 months from the start date of the visa. When
                  uploading the passport photo, ensure that the image is clear and all information is legible.
                  Please accurately verify the correctness of the information provided. If you have any question
                  about form filling feel free to ask our professional support team.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: PERSONAL INFORMATION ═══ */}
        {step === 'personal' && (
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardIcon}>{STEP_ICON.personal}</div>
                <div>
                  <div className={styles.cardTag}>{STEP_META.personal.tag}</div>
                  <div className={styles.cardTitle}>{currentTitle}</div>
                  <div className={styles.cardSub}>Fill in all required fields to continue</div>
                </div>
                <div className={styles.priceChip}>
                  <div className={styles.priceChipLbl}>Total price</div>
                  <div className={styles.priceChipVal}>${partyTotal}</div>
                </div>
              </div>

              {renderFields(fieldsByStep.personal)}

              <div className={styles.nav}>
                <button className={styles.btnBack} onClick={goBack}>Back</button>
                <div className={styles.navRight}>
                  <button className={styles.btnNext} onClick={goNext}>Continue</button>
                </div>
              </div>
            </div>

            <div className={styles.sidebar}>
              <div className={styles.priceCard}><h5>Total price</h5><h3>${partyTotal}</h3></div>
              {applicants.length > 0 && (
                <div className={styles.warnBox}>
                  <h5>Party so far</h5>
                  <p>{applicants.length} applicant{applicants.length !== 1 ? 's' : ''} added.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ STEP 4: DOCUMENTS ═══ */}
        {step === 'documents' && (
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardIcon}>{STEP_ICON.documents}</div>
                <div>
                  <div className={styles.cardTag}>{STEP_META.documents.tag}</div>
                  <div className={styles.cardTitle}>{currentTitle}</div>
                  <div className={styles.cardSub}>Fill in all required fields to continue</div>
                </div>
                <div className={styles.priceChip}>
                  <div className={styles.priceChipLbl}>Total price</div>
                  <div className={styles.priceChipVal}>${partyTotal}</div>
                </div>
              </div>

              {renderFields(fieldsByStep.documents)}

              <div className={styles.nav}>
                <button className={styles.btnBack} onClick={goBack}>Back</button>
                <div className={styles.navRight}>
                  <button className={styles.btnAddPerson} onClick={handleAddPerson} disabled={submitting}>
                    + Add Another Person
                  </button>
                  <button className={styles.btnNext} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit Application'}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.sidebar}>
              <div className={styles.priceCard}><h5>Total price</h5><h3>${partyTotal}</h3></div>
              {applicants.length > 0 && (
                <div className={styles.warnBox}>
                  <h5>Party so far</h5>
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
                <div className={styles.successIcon}>✓</div>
                <div>
                  <div className={styles.successTitle}>Application Submitted</div>
                  <div className={styles.successSub}>Save your reference number — you'll need it to check status and pay</div>
                </div>
                <div className={styles.confRefBadge}>#{result.applicationNumber}</div>
              </div>

              <div className={styles.priceRow}>
                <div>
                  <div className={styles.priceRowLbl}>Total Price</div>
                </div>
                <div className={styles.priceRowVal}>${result.totalPrice}</div>
              </div>

              <button className={styles.payBtn} disabled title="Payment integration is coming soon">
                Proceed to Payment (coming soon)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
