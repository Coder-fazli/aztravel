import { connectDb } from './connect'
import Location from './models/Location'
import Banner from './models/Banner'


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

    process.exit(0)

}

 seed();
  