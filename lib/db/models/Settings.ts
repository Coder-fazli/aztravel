import mongoose, { Schema } from "mongoose";

const SettingsSchema = new Schema (
    {
        key: { type: String, default: 'site', unique: true },
        metaTitle: { type: Schema.Types.Mixed, default: {} },
        metaDescription: { type: Schema.Types.Mixed, default:
        {} },
        logo: { type: String, default: '' },
        favicon: { type: String, default: '' },
        // array of { image, title:{en,es,ar}, buttonText:{...}, buttonLink:{...} }
        heroSlides:     { type: Schema.Types.Mixed, default: [] },
        // home-page robots / canonical
        robotsNoindex:  { type: Boolean, default: false },
        robotsNofollow: { type: Boolean, default: false },
        canonicalUrl:   { type: String,  default: '' },
        // navigation menu items: [{ label, href, visible }]
        navItems: { type: Schema.Types.Mixed, default: [] },
    },
    { timestamps: true }
)

export default mongoose.models.Settings ??
mongoose.model('Settings', SettingsSchema)