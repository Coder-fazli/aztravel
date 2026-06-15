import mongoose, { Schema } from "mongoose"

const i18n = {
    en: { type: String, required: true },
    es: { type: String, default: '' },
    ar: { type: String, default: '' },
}

export const GuideSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    bio: i18n,
    avatar: String,
    languages: [String],                           
    specializations: [String],                           
    experience:  Number,    
    tours: [{ type: Schema.Types.ObjectId, ref: 'Tour' }],
    pricing: {
        hourly:   Number,
        daily:    Number,
        currency: { type: String, default: 'USD' },
    },
    contact: {
        phone: String,
        instagram: String,
        facebook: String,
        twitter: String,
    },   
     // the operator/admin account that manages this guide
      owner: { type: Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ['active', 'inactive'],
  default: 'active' },
},
{ timestamps: true }
)

GuideSchema.index({ slug: 1 })
  GuideSchema.index({ status: 1 })
  GuideSchema.index({ owner: 1 })
  GuideSchema.index({ createdAt: -1 })
  
export default mongoose.models.Guide ?? mongoose.model('Guide', GuideSchema)