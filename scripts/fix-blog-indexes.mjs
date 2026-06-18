// One-off: drop the stale slug indexes left over from the old i18n schema
// (slug.en_1 / slug.es_1 / slug.ar_1). Run once: `node scripts/fix-blog-indexes.mjs`
import mongoose from 'mongoose'
import { readFileSync } from 'fs'

let uri = process.env.MONGODB_URI
if (!uri) {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  const m = env.match(/^MONGODB_URI=(.*)$/m)
  uri = m ? m[1].trim().replace(/^["']|["']$/g, '') : ''
}
if (!uri) {
  console.error('❌ MONGODB_URI not found')
  process.exit(1)
}

await mongoose.connect(uri)
const coll = mongoose.connection.db.collection('blogs')

const before = await coll.indexes()
console.log('Before:', before.map((i) => i.name).join(', '))

for (const name of ['slug.en_1', 'slug.es_1', 'slug.ar_1']) {
  try {
    await coll.dropIndex(name)
    console.log('✅ dropped', name)
  } catch (e) {
    console.log('• skip', name, '—', e.codeName || e.message)
  }
}

const after = await coll.indexes()
console.log('After:', after.map((i) => i.name).join(', '))

await mongoose.disconnect()
console.log('Done.')
