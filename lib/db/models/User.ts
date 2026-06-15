import mongoose, { Schema } from 'mongoose'

export const UserSchema = new Schema({
   clerkId: { type: String, required: true, unique: true },
   email:   { type: String, required: true, unique: true },
   name:    String,
   avatar:  String,
   phone:   String,
   nationality:   String,
   preferredLang: { type: String, enum: ['en', 'es', 'ar'],
  default: 'en' },

  favorites: 
  {
   tours: [{ type: Schema.Types.ObjectId, ref: 'Tour' }],
   hotels: [{ type: Schema.Types.ObjectId, ref: 'Hotel' }],
   restaurants: [{ type: Schema.Types.ObjectId, ref: 'Restaurant' }],
   events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
   products: [{ type: Schema.Types.ObjectId, ref:'Product' }],
  },

  role: { type: String, enum: ['user', 'operator', 'admin'], default: 'user' },
},
{timestamps: true}
)

UserSchema.index({ clerkId: 1 })
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1 })

export default mongoose.models.User ?? mongoose.model('User', UserSchema)