'use server'

import Settings from '../db/models/Settings'
import { connectDb } from '../db/connect'
import { revalidatePath } from 'next/cache'

const DEFAULT_SETTINGS = {
    key: 'site',
    metaTitle: {},
    metaDescription: {},
    logo: '',
    favicon: '',
    heroSlides: [],
}

// Read-only: never writes during a read (avoids E11000 races when many pages
// prerender in parallel). The doc is created on first save via updateSettings().
export async function getSettings() {
    await connectDb()
    const doc = await Settings.findOne({ key: 'site' }).lean()
    return doc ? JSON.parse(JSON.stringify(doc)) : DEFAULT_SETTINGS
}

export async function updateSettings(data: any) {
    await connectDb()
    const doc = await Settings.findOneAndUpdate({ key: 'site' }, data, {
        new: true,
        upsert: true,
    })
    revalidatePath('/', 'layout')
    return JSON.parse(JSON.stringify(doc))
}