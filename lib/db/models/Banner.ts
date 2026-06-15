import mongoose, { Schema } from "mongoose";

const i18n = {
    en: { type: String, required: true },
    es: { type: String, default: '' },
    ar: { type: String, default: '' },
}
const i18nOpt = {            // for optional text (subtitle)
    en: { type: String, default: '' },
    es: { type: String, default: '' },
    ar: { type: String, default: '' },
  }

  const BannerSchema = new Schema({
     key: { type: String, required: true, unique: true },
     title: i18n,
     subtitle: i18nOpt,
     variant: { type: String, enum: ['blue', 'orange'],
                default: 'blue' },
     backgroundImage: String,
     backgroundColor: String,
     buttons: [{
      label: i18n,
      href:  { type: String, default: '#' },
    }],
     status:   { type: String, enum: ['active', 'inactive'],
  default: 'active' },
  },
 { timestamps: true }
)

BannerSchema.index({ key: 1 })

export default mongoose.models.Banner ?? mongoose.model('Banner', BannerSchema)