import { connectDb } from './connect'
import Location from './models/Location'
import Banner from './models/Banner'
import Country from './models/evisa/Country'
import FormElement from './models/evisa/FormElement'
import Settings from './models/Settings'

// NOTE: this is a development starter set, not verified official ASAN e-Visa
// data. The real eligible-country list + pricing lived only in the old
// Laravel app's live MySQL database (never available in code). These 24
// countries + the $69/$99 base prices are pulled from evisa-next's own real
// SEO copy (the only grounded source available) -- confirm real eligibility
// and pricing with the business before this goes live for real applicants.
const STARTER_COUNTRIES = [
  ['EG', '🇪🇬', 'Egypt'],
  ['SA', '🇸🇦', 'Saudi Arabia'],
  ['PK', '🇵🇰', 'Pakistan'],
  ['MY', '🇲🇾', 'Malaysia'],
  ['CN', '🇨🇳', 'China'],
  ['IR', '🇮🇷', 'Iran'],
  ['AE', '🇦🇪', 'United Arab Emirates'],
  ['IN', '🇮🇳', 'India'],
  ['TR', '🇹🇷', 'Turkey'],
  ['US', '🇺🇸', 'United States'],
  ['GB', '🇬🇧', 'United Kingdom'],
  ['DE', '🇩🇪', 'Germany'],
  ['FR', '🇫🇷', 'France'],
  ['IT', '🇮🇹', 'Italy'],
  ['ES', '🇪🇸', 'Spain'],
  ['CA', '🇨🇦', 'Canada'],
  ['AU', '🇦🇺', 'Australia'],
  ['JP', '🇯🇵', 'Japan'],
  ['KR', '🇰🇷', 'South Korea'],
  ['ID', '🇮🇩', 'Indonesia'],
  ['PH', '🇵🇭', 'Philippines'],
  ['KW', '🇰🇼', 'Kuwait'],
  ['QA', '🇶🇦', 'Qatar'],
  ['BD', '🇧🇩', 'Bangladesh'],
] as const

// Starter form questions. Field set is copied directly from the live site
// (apply.azerbaijan-evisa.com), walked step-by-step via browser automation
// on 2026-08-03 -- not reconstructed from code guesses. Labels, option
// lists, and step groupings all verified against the actual rendered form.
const opt = (value: string, en: string) => ({ value, label: { en, es: en, ar: en } })

const OCCUPATIONS = [
  'Agriculture', 'Artist', 'Communications', 'Computer science', 'Culinary/Food Services',
  'Driver', 'Education', 'Engineering', 'Finance/Banking', 'Government', 'Healthcare',
  'Law-enforcement agencies', 'Media representative', 'Military', 'Mining', 'Natural sciences',
  'Non-governmental organizations', 'Pensioner', 'Physics', 'Private sector', 'Religious figure',
  'Researcher', 'Schooler/Student', 'Social sciences', 'Sports', 'Translator/Interpreter',
  'Unemployed', 'Other',
].map(label => opt(label.toLowerCase().replace(/[^a-z]+/g, '_'), label))

const STARTER_FORM_ELEMENTS = [
  // ── Trip Details (step 2) ──
  {
    fieldKey: 'travel_document', type: 'select', orderNum: 1,
    label: { en: 'Travel Document', es: 'Documento de viaje', ar: 'وثيقة السفر' },
    placeholder: { en: 'Travel document type', es: '', ar: '' },
    required: true, isNewPerson: true,
    options: { options: [
      opt('ordinary', 'Ordinary Passport'), opt('diplomatic', 'Diplomatic Passport'),
      opt('service', 'Service Passport'), opt('special', 'Special Passport'),
      opt('stateless', 'For Stateless Person'), opt('other', 'Other'),
    ] },
  },
  {
    fieldKey: 'purpose_of_visit', type: 'select', orderNum: 2,
    label: { en: 'Purpose of Visit', es: 'Motivo de la visita', ar: 'الغرض من الزيارة' },
    placeholder: { en: 'Purpose of visit', es: '', ar: '' },
    required: true, isNewPerson: true,
    options: { options: [
      opt('tourism', 'Tourism'), opt('business_trip', 'Business trip'), opt('science', 'Science'),
      opt('education', 'Education'), opt('labor', 'Labor'), opt('culture', 'Culture'),
      opt('sports', 'Sports'), opt('humanitarian', 'Humanitarian'), opt('medical', 'Medical Treatment'),
      opt('personal_trip', 'Personal trip'), opt('official_trip', 'Official trip'),
    ] },
  },
  {
    fieldKey: 'travel_date', type: 'visa_date', orderNum: 3,
    label: { en: 'Date', es: 'Fecha', ar: 'التاريخ' },
    description: {
      en: 'Your e-Visa is valid from [start_date] to [finish_date] for a total period of ([validity_day] days). You can enter Azerbaijan any date during the validity period ([validity_day] days) of your e-visa. However, your stay cannot exceed [stay_day] days.',
      es: '', ar: '',
    },
    required: true, isNewPerson: true,
    options: { defaultProc: 'today', validityDays: 90, stayDays: 30 },
  },

  // ── Personal Information (step 3) ──
  {
    fieldKey: 'surname', type: 'text', orderNum: 4,
    label: { en: 'Surname', es: 'Apellido', ar: 'اسم العائلة' },
    placeholder: { en: 'Enter Surname', es: '', ar: '' },
    required: true, isNewPerson: true,
  },
  {
    fieldKey: 'given_names', type: 'text', orderNum: 5,
    label: { en: 'Other names/Given name(s)', es: 'Nombre(s)', ar: 'الاسم الشخصي' },
    placeholder: { en: 'Other Name', es: '', ar: '' },
    required: true, isNewPerson: true,
  },
  {
    fieldKey: 'occupation', type: 'select', orderNum: 6,
    label: { en: 'Occupations', es: 'Ocupación', ar: 'المهنة' },
    placeholder: { en: 'Select your occupation', es: '', ar: '' },
    required: true, isNewPerson: true,
    options: { options: OCCUPATIONS },
  },
  {
    fieldKey: 'email', type: 'email', orderNum: 7,
    label: { en: 'Email', es: 'Correo electrónico', ar: 'البريد الإلكتروني' },
    placeholder: { en: 'Email Address', es: '', ar: '' },
    required: true, isNewPerson: false, // asked once for the whole party
  },
  {
    fieldKey: 'phone', type: 'text', orderNum: 8,
    label: { en: 'Phone Number', es: 'Número de teléfono', ar: 'رقم الهاتف' },
    placeholder: { en: 'Phone Number', es: '', ar: '' },
    required: true, isNewPerson: false, // asked once for the whole party
  },
  {
    fieldKey: 'permanent_address', type: 'text', orderNum: 9,
    label: { en: 'Permanent residence address', es: 'Dirección de residencia permanente', ar: 'عنوان الإقامة الدائمة' },
    placeholder: { en: 'Permanent address', es: '', ar: '' },
    required: true, isNewPerson: false, // asked once for the whole party
  },
  {
    fieldKey: 'place_of_stay', type: 'text', orderNum: 10,
    label: { en: 'Place of stay in Azerbaijan', es: 'Lugar de estancia en Azerbaiyán', ar: 'مكان الإقامة في أذربيجان' },
    placeholder: { en: 'Place of stay in Azerbaijan', es: '', ar: '' },
    required: true, isNewPerson: true,
  },

  // ── Documents (step 4) ──
  {
    fieldKey: 'passport_expiry', type: 'date', orderNum: 11,
    label: { en: 'Passport expiry date', es: 'Fecha de caducidad del pasaporte', ar: 'تاريخ انتهاء جواز السفر' },
    required: true, isNewPerson: true,
    // matches the live site's "PAY ATTENTION" copy: passport must be valid
    // at least 6 months from the visa start date
    options: { minFutureDays: 180 },
  },
  {
    fieldKey: 'passport_image', type: 'image', orderNum: 12,
    label: { en: 'Passport image', es: 'Imagen del pasaporte', ar: 'صورة جواز السفر' },
    description: {
      en: 'Upload the full passport photo page like the rightmost example. Avoid glare, cropping, and tilting. JPG or PNG only, max 10000KB. Ensure all text on the document is clear and legible.',
      es: '', ar: '',
    },
    required: true, isNewPerson: true,
    options: { maxFileSizeKb: 10000 },
  },
  {
    fieldKey: 'terms', type: 'checkbox', orderNum: 13,
    label: { en: 'Terms and Conditions', es: 'Términos y condiciones', ar: 'الشروط والأحكام' },
    description: {
      en: 'Do you confirm that you meet each and every one of the eVisa requirements, read and understood the Terms and Conditions, Privacy Policy and Refund Policy?',
      es: '', ar: '',
    },
    required: true, isNewPerson: true,
    options: { options: [opt('agree', 'Terms and Conditions, Privacy Policy, and Refund Policy')] },
  },
] as const


async function seed(){
    await connectDb();
    await Location.deleteMany({});
    await Location.insertMany([
        {
        name: { en: 'Baku', es: 'Bakú', ar: 'باكو' },
        slug: 'baku',
        region: 'Absheron',
        type: ['city'],
        coordinates: { lat: 40.4093, lng: 49.8671 },
        description: { en: 'Capital of Azerbaijan', es: 'Capital de Azerbaiyán', ar: 'عاصمة أذربيجان' },
        featured: true
      },
      {
        name: { en: 'Gabala', es: 'Gabala', ar: 'قابالا' },
        slug: 'gabala',
        region: 'Shaki-Zaqatala',
        type: ['city'],
        coordinates: { lat: 40.9949, lng: 47.8492 },
        description: { en: 'A beautiful resort city in northern Azerbaijan', es: 'Una hermosa ciudad de montaña', ar: 'مدينة منتجع جميلة' },
        featured: true
      },
      {
        name: { en: 'Ganja', es: 'Ganja', ar: 'گنجه' },
        slug: 'ganja',
        region: 'Ganja-Gazakh',
        type: ['city'],
        coordinates: { lat: 40.6828, lng: 46.3606 },
        description: { en: 'Second largest city of Azerbaijan', es: 'Segunda ciudad más grande de Azerbaiyán', ar: 'ثاني أكبر مدينة في أذربيجان' },
        featured: true
      },
      {
        name: { en: 'Shahdag', es: 'Shahdag', ar: 'شاهداغ' },
        slug: 'shahdag',
        region: 'Quba-Khachmaz',
        type: ['mountain'],
        coordinates: { lat: 41.2789, lng: 48.1203 },
        description: { en: 'Top ski and summer resort in Azerbaijan', es: 'Principal resort de esquí de Azerbaiyán', ar: 'أفضل منتجع تزلج في أذربيجان' },
        featured: true
      },
      {
        name: { en: 'Shaki', es: 'Shaki', ar: 'شكي' },
        slug: 'shaki',
        region: 'Shaki-Zaqatala',
        type: ['city'],
        coordinates: { lat: 41.1931, lng: 47.1706 },
        description: { en: 'Historic city known for its Palace of the Shaki Khans', es: 'Ciudad histórica con el Palacio de los Khans', ar: 'مدينة تاريخية مشهورة بقصر خانات شكي' },
        featured: false
      },
    ])
    console.log('Locations seeded successfully')

    await Banner.deleteMany({});
    await Banner.insertMany([
      {
        key: 'blog-event-blue',
        title:    { en: 'Join the event now and dont miss your chance!' },
        subtitle: { en: 'Join teeth tent growth staircase sky invested win ladder building. Needle ensure die responsible streamline.' },
        variant: 'blue',
        buttons: [
          { label: { en: 'Join now' },   href: '/events' },
          { label: { en: 'Learn more' }, href: '/about' },
        ],
        status: 'active',
      },
      {
        key: 'blog-event-orange',
        title:    { en: 'Join the event now and dont miss your chance!' },
        subtitle: { en: 'Join teeth tent growth staircase sky invested win ladder building. Needle ensure die responsible streamline.' },
        variant: 'orange',
        buttons: [
          { label: { en: 'Join now' },   href: '/events' },
          { label: { en: 'Learn more' }, href: '/about' },
        ],
        status: 'active',
      },
    ])
    console.log('Banners seeded successfully')

    await Country.deleteMany({})
    await Country.insertMany(
      STARTER_COUNTRIES.map(([code, flag, name], i) => ({
        code,
        flag,
        name: { en: name, es: name, ar: name },
        eligible: true,
        orderNum: i,
        baseFee: 0, // dev placeholder -- confirm real per-country base fees with the business
        conditions: [],
      })),
    )
    console.log('Countries seeded successfully (dev starter set -- confirm real pricing/eligibility before going live)')

    await FormElement.deleteMany({})
    await FormElement.insertMany(STARTER_FORM_ELEMENTS.map(el => ({ ...el, conditions: [] })))
    console.log('Form elements seeded successfully')

    // Global visa type surcharges -- verified against the live site
    // (Standard +$60, Urgent +$120), same surcharge for every country.
    await Settings.findOneAndUpdate(
      { key: 'site' },
      { $set: { evisaVisaTypes: [
        { key: 'standard', label: { en: 'Standard', es: 'Estándar', ar: 'قياسي' }, surcharge: 60 },
        { key: 'urgent',   label: { en: 'Urgent',   es: 'Urgente',  ar: 'عاجل' },   surcharge: 120 },
      ] } },
      { upsert: true },
    )
    console.log('Visa types seeded successfully')

    process.exit(0)

}

 seed();
  