'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { evaluateForm } from '@/lib/evisa/rulesEngine'
import { submitApplication, type ApplicantDraft } from '@/lib/actions/evisa'
import DynamicField from './DynamicField'
import PayButton from './PayButton'
import styles from '../../app/[locale]/apply/apply.module.css'

type Locale = 'en' | 'es' | 'ar'
type WizardStep = 'visaType' | 'trip' | 'personal' | 'documents' | 'confirmation'

// Real 4-step breakdown, ported from apply.blade.php's STEPS/STEP_ENDS
// (Step 01 Visa Type / Step 02 Trip Details / Step 03 Personal Information /
// Step 04 Documents) rather than one long form. Fields are assigned to a
// step by fieldKey, matching the original's field groupings.
const STEP_ORDER: Exclude<WizardStep, 'confirmation'>[] = ['visaType', 'trip', 'personal', 'documents']

// Provisional reference shown before submission, matching the original's
// $app_ref = 'AZ-' . strtoupper(substr(md5(...), 0, 8)) — a client-side
// placeholder only; the real applicationNumber is assigned server-side on submit.
function generateProvisionalRef() {
  const hex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  return `AZ-${hex.toUpperCase()}`
}

const TRIP_FIELDS = new Set(['travel_document', 'purpose_of_visit', 'travel_date'])
const DOCUMENT_FIELDS = new Set(['passport_expiry', 'passport_image', 'terms'])

function stepForField(fieldKey: string): Exclude<WizardStep, 'confirmation' | 'visaType'> {
  if (TRIP_FIELDS.has(fieldKey)) return 'trip'
  if (DOCUMENT_FIELDS.has(fieldKey)) return 'documents'
  return 'personal' // any admin-added field not listed above defaults here
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
  const t = useTranslations('apply')
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  const stepTitle = (s: Exclude<WizardStep, 'confirmation'>) => t(`steps.${s}`)
  const stepTag = (i: number) => `${t('stepLabel')} 0${i + 1}`

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

    if (includeCountry && !country) nextErrors.country = t('trip.countryRequired')

    for (const el of stepFields) {
      if (!el.required) continue
      const v = answers[el.fieldKey]
      const empty = v === undefined || v === '' || (Array.isArray(v) && v.length === 0)
      if (empty) nextErrors[el.fieldKey] = t('fieldRequired', { label: el.label?.[locale] || el.label?.en })
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
      alert(t('submitError'))
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
      ? t('applicantStepTitle', { n: personIndex, step: stepTitle(step) })
      : stepTitle(step)

  return (
    <div className={styles.page} dir={dir}>
      <div className={styles.container}>

        {step !== 'confirmation' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div className={styles.crumb}><a href="#">{t('breadcrumb.home')}</a><span>{dir === 'rtl' ? '‹' : '›'}</span><span className={styles.cur}>{t('breadcrumb.current')}</span></div>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['en', 'es', 'ar'] as const).map(l => (
                  <a
                    key={l}
                    href={`?lang=${l}`}
                    style={{
                      fontSize: 12, fontWeight: 700, padding: '4px 9px', borderRadius: 9999,
                      textDecoration: 'none',
                      border: l === locale ? '1.5px solid var(--primary-13)' : '1.5px solid var(--base-5)',
                      color: l === locale ? 'var(--primary-13)' : 'var(--base-8)',
                    }}
                  >
                    {l.toUpperCase()}
                  </a>
                ))}
              </div>
            </div>

            <div className={styles.refBadge}>
              {t('provisionalRef')} <strong>{provisionalRef}</strong>&nbsp;<span style={{ color: '#9ca3af' }}>{t('provisionalRefNote')}</span>
            </div>

            <div className={styles.stepper}>
              {STEP_ORDER.map((s, i) => (
                <div key={s} style={{ display: 'contents' }}>
                  <div className={styles.stepNode}>
                    <div className={`${styles.bubble} ${i === stepIndex ? styles.bubbleActive : i < stepIndex ? styles.bubbleDone : ''}`}>
                      {i < stepIndex ? '✓' : i + 1}
                    </div>
                    <div className={`${styles.stepLbl} ${i === stepIndex ? styles.stepLblActive : i < stepIndex ? styles.stepLblDone : ''}`}>
                      {stepTitle(s)}
                    </div>
                  </div>
                  {i < STEP_ORDER.length - 1 && <div className={`${styles.stepLine} ${i < stepIndex ? styles.stepLineDone : ''}`} />}
                </div>
              ))}
            </div>
            <div className={styles.progressTxt}>{t('stepOf', { current: stepIndex + 1, total: STEP_ORDER.length })}</div>
          </>
        )}

        {/* ═══ STEP 1: VISA TYPE ═══ */}
        {step === 'visaType' && (
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardIcon}>{STEP_ICON.visaType}</div>
                <div>
                  <div className={styles.cardTag}>{stepTag(0)}</div>
                  <div className={styles.cardTitle}>{stepTitle('visaType')}</div>
                  <div className={styles.cardSub}>{t('fillRequired')}</div>
                </div>
              </div>

              <div className={styles.inputArea}>
                <label className={styles.fLabel}>{t('visaType.processingType')}<span className={styles.req}>*</span></label>
                {visaTypes.length === 0 && (
                  <div className={styles.warnBox}>
                    <h5>{t('visaType.noneAvailableTitle')}</h5>
                    <p>{t('visaType.noneAvailableBody')}</p>
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
                <button className={`${styles.btnBack} ${styles.btnBackHidden}`}>{t('back')}</button>
                <div className={styles.navRight}>
                  <button className={styles.btnNext} disabled={!visaType} onClick={goNext}>
                    {t('continue')}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.sidebar}>
              <div className={styles.warnBox}>
                <h5>{t('visaType.beforeYouStartTitle')}</h5>
                <p>{t('visaType.beforeYouStartBody')}</p>
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
                  <div className={styles.cardTag}>{stepTag(1)}</div>
                  <div className={styles.cardTitle}>{currentTitle}</div>
                  <div className={styles.cardSub}>{t('fillRequired')}</div>
                </div>
                <div className={styles.priceChip}>
                  <div className={styles.priceChipLbl}>{t('totalPrice')}</div>
                  <div className={styles.priceChipVal}>${partyTotal}</div>
                </div>
              </div>

              <div className={styles.inputArea} id="field-country">
                <label className={styles.fLabel}>{t('trip.yourCountry')}<span className={styles.req}>*</span></label>
                <select className={styles.inputText} value={country} onChange={e => setCountry(e.target.value)}>
                  <option value="">{t('trip.selectCountryPlaceholder')}</option>
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>{c.name?.[locale] || c.name?.en || c.code}</option>
                  ))}
                </select>
                {errors.country && <div className={styles.errMsg}>{errors.country}</div>}
              </div>

              {renderFields(fieldsByStep.trip)}

              <div className={styles.nav}>
                <button className={styles.btnBack} onClick={goBack}>{t('back')}</button>
                <div className={styles.navRight}>
                  <button className={styles.btnNext} onClick={goNext}>{t('continue')}</button>
                </div>
              </div>
            </div>

            <div className={styles.sidebar}>
              <div className={styles.priceCard}><h5>{t('totalPrice')}</h5><h3>${partyTotal}</h3></div>
              {applicants.length > 0 && (
                <div className={styles.warnBox}>
                  <h5>{t('trip.partySoFarTitle')}</h5>
                  <p>{t('trip.partySoFarTrip', { count: applicants.length })}</p>
                </div>
              )}
              <div className={styles.warnBox}>
                <h5>{t('trip.payAttentionTitle')}</h5>
                <p>{t('trip.payAttentionBody')}</p>
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
                  <div className={styles.cardTag}>{stepTag(2)}</div>
                  <div className={styles.cardTitle}>{currentTitle}</div>
                  <div className={styles.cardSub}>{t('fillRequired')}</div>
                </div>
                <div className={styles.priceChip}>
                  <div className={styles.priceChipLbl}>{t('totalPrice')}</div>
                  <div className={styles.priceChipVal}>${partyTotal}</div>
                </div>
              </div>

              {renderFields(fieldsByStep.personal)}

              <div className={styles.nav}>
                <button className={styles.btnBack} onClick={goBack}>{t('back')}</button>
                <div className={styles.navRight}>
                  <button className={styles.btnNext} onClick={goNext}>{t('continue')}</button>
                </div>
              </div>
            </div>

            <div className={styles.sidebar}>
              <div className={styles.priceCard}><h5>{t('totalPrice')}</h5><h3>${partyTotal}</h3></div>
              {applicants.length > 0 && (
                <div className={styles.warnBox}>
                  <h5>{t('trip.partySoFarTitle')}</h5>
                  <p>{t('trip.partySoFarPersonal', { count: applicants.length })}</p>
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
                  <div className={styles.cardTag}>{stepTag(3)}</div>
                  <div className={styles.cardTitle}>{currentTitle}</div>
                  <div className={styles.cardSub}>{t('fillRequired')}</div>
                </div>
                <div className={styles.priceChip}>
                  <div className={styles.priceChipLbl}>{t('totalPrice')}</div>
                  <div className={styles.priceChipVal}>${partyTotal}</div>
                </div>
              </div>

              {renderFields(fieldsByStep.documents)}

              <div className={styles.nav}>
                <button className={styles.btnBack} onClick={goBack}>{t('back')}</button>
                <div className={styles.navRight}>
                  <button className={styles.btnAddPerson} onClick={handleAddPerson} disabled={submitting}>
                    {t('documents.addAnotherPerson')}
                  </button>
                  <button className={styles.btnNext} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? t('documents.submitting') : t('documents.submitApplication')}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.sidebar}>
              <div className={styles.priceCard}><h5>{t('totalPrice')}</h5><h3>${partyTotal}</h3></div>
              {applicants.length > 0 && (
                <div className={styles.warnBox}>
                  <h5>{t('trip.partySoFarTitle')}</h5>
                  <p>{t('trip.partySoFarDocuments', { count: applicants.length })}</p>
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
                  <div className={styles.successTitle}>{t('confirmation.title')}</div>
                  <div className={styles.successSub}>{t('confirmation.subtitle')}</div>
                </div>
                <div className={styles.confRefBadge}>#{result.applicationNumber}</div>
              </div>

              <div className={styles.priceRow}>
                <div>
                  <div className={styles.priceRowLbl}>{t('confirmation.totalPrice')}</div>
                </div>
                <div className={styles.priceRowVal}>${result.totalPrice}</div>
              </div>

              <PayButton applicationNumber={result.applicationNumber} locale={locale} />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
