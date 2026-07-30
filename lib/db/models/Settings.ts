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
        // downloadable e-book PDF
        ebookUrl: { type: String, default: '' },
        // eVisa payment config — secret keys (Stripe secret, Skrill password,
        // Telegram bot token) belong in env vars, never here.
        evisaPayment: {
            activeGateway:      { type: String, enum: ['stripe', 'skrill'], default: 'stripe' },
            paymentNoticeEmail: { type: String, default: '' }, // admin email for "new paid application" alerts
        },
    },
    { timestamps: true }
)

export default mongoose.models.Settings ??
mongoose.model('Settings', SettingsSchema)