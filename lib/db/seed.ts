import { connectDb } from './connect'
import Location from './models/Location'
import Banner from './models/Banner'
import Country from './models/evisa/Country'
import FormElement from './models/evisa/FormElement'

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

// Starter form questions. Field set is grounded in real evidence, not
// invented: app/Http/Controllers/Traits/SendsTelegramNotification.php in the
// original Laravel app hardcodes references like $d['input_20'] (first name),
// $d['input_21'] (last name), $d['input_23'] (occupation), $d['input_25']
// (phone), $d['input_26'] (address), $d['input_28'] (passport expiry),
// $d['input_35'] (stay in AZ) -- proof these fields exist in production,
// even though their exact admin-configured order/wording isn't recoverable.
const opt = (value: string, en: string) => ({ value, label: { en, es: en, ar: en } })

const STARTER_FORM_ELEMENTS = [
  {
    fieldKey: 'first_name', type: 'text', orderNum: 1,
    label: { en: 'First Name', es: 'Nombre', ar: 'الاسم الأول' },
    placeholder: { en: 'As shown on your passport', es: '', ar: '' },
    required: true, isNewPerson: true,
  },
  {
    fieldKey: 'last_name', type: 'text', orderNum: 2,
    label: { en: 'Last Name', es: 'Apellido', ar: 'اسم العائلة' },
    placeholder: { en: 'As shown on your passport', es: '', ar: '' },
    required: true, isNewPerson: true,
  },
  {
    fieldKey: 'email', type: 'email', orderNum: 3,
    label: { en: 'Email Address', es: 'Correo electrónico', ar: 'البريد الإلكتروني' },
    placeholder: { en: 'you@example.com', es: '', ar: '' },
    required: true, isNewPerson: false, // asked once for the whole party
  },
  {
    fieldKey: 'phone', type: 'text', orderNum: 4,
    label: { en: 'Phone Number', es: 'Número de teléfono', ar: 'رقم الهاتف' },
    placeholder: { en: '+1 555 123 4567', es: '', ar: '' },
    required: true, isNewPerson: false, // asked once for the whole party
  },
  {
    fieldKey: 'occupation', type: 'text', orderNum: 5,
    label: { en: 'Occupation', es: 'Ocupación', ar: 'المهنة' },
    required: true, isNewPerson: true,
  },
  {
    fieldKey: 'address', type: 'text', orderNum: 6,
    label: { en: 'Home Address', es: 'Dirección', ar: 'العنوان' },
    required: true, isNewPerson: false, // asked once for the whole party
  },
  {
    fieldKey: 'passport_number', type: 'text', orderNum: 7,
    label: { en: 'Passport Number', es: 'Número de pasaporte', ar: 'رقم جواز السفر' },
    placeholder: { en: 'e.g. A1234567', es: '', ar: '' },
    required: true, isNewPerson: true,
  },
  {
    fieldKey: 'passport_expiry', type: 'date', orderNum: 8,
    label: { en: 'Passport Expiry Date', es: 'Fecha de caducidad del pasaporte', ar: 'تاريخ انتهاء جواز السفر' },
    required: true, isNewPerson: true,
  },
  {
    fieldKey: 'travel_document', type: 'select', orderNum: 9,
    label: { en: 'Travel Document', es: 'Documento de viaje', ar: 'وثيقة السفر' },
    placeholder: { en: 'Travel document type', es: '', ar: '' },
    required: true, isNewPerson: true,
    options: { options: [opt('ordinary', 'Ordinary Passport'), opt('diplomatic', 'Diplomatic Passport'), opt('service', 'Service Passport')] },
  },
  {
    fieldKey: 'purpose_of_visit', type: 'select', orderNum: 10,
    label: { en: 'Purpose of Visit', es: 'Motivo de la visita', ar: 'الغرض من الزيارة' },
    placeholder: { en: 'Purpose of visit', es: '', ar: '' },
    required: true, isNewPerson: true,
    options: { options: [opt('tourism', 'Tourism'), opt('business', 'Business'), opt('transit', 'Transit'), opt('other', 'Other')] },
  },
  {
    fieldKey: 'travel_date', type: 'visa_date', orderNum: 11,
    label: { en: 'Date', es: 'Fecha', ar: 'التاريخ' },
    description: {
      en: 'Your e-Visa is valid from [start_date] to [finish_date] for a total period of ([validity_day] days). You can enter Azerbaijan any date during the validity period ([validity_day] days) of your e-visa. However, your stay cannot exceed [stay_day] days.',
      es: '', ar: '',
    },
    required: true, isNewPerson: true,
    options: { defaultProc: 'today', validityDays: 90, stayDays: 30 },
  },
  {
    fieldKey: 'stay_in_az', type: 'number', orderNum: 12,
    label: { en: 'Length of Stay (days)', es: 'Duración de la estancia (días)', ar: 'مدة الإقامة (أيام)' },
    placeholder: { en: 'e.g. 14', es: '', ar: '' },
    required: true, isNewPerson: true,
    min: 1, max: 30,
  },
  {
    fieldKey: 'passport_photo', type: 'image', orderNum: 13,
    label: { en: 'Passport Photo Page', es: 'Página de foto del pasaporte', ar: 'صفحة صورة جواز السفر' },
    required: true, isNewPerson: true,
    options: { maxFileSizeKb: 4096 },
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
        pricing: [
          { key: 'standard', label: { en: 'Standard', es: 'Estándar', ar: 'قياسي' }, price: 69 },
          { key: 'urgent',   label: { en: 'Urgent',   es: 'Urgente',  ar: 'عاجل' },   price: 99 },
        ],
        conditions: [],
      })),
    )
    console.log('Countries seeded successfully (dev starter set -- confirm real pricing/eligibility before going live)')

    await FormElement.deleteMany({})
    await FormElement.insertMany(STARTER_FORM_ELEMENTS.map(el => ({ ...el, conditions: [] })))
    console.log('Form elements seeded successfully')

    process.exit(0)

}

 seed();
  