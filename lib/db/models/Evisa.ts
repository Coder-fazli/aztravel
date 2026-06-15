import mongoose, { Schema } from 'mongoose'

export const EvisaSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    applicant: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: String,
        nationality: { type: String, required: true },
        passportNumber:{ type: String, required: true },
        dateOfBirth: Date,
        photo: String,   
    },

    type: { type: String, enum: ['tourist', 'business'],
     default: 'tourist' },
     applicationNumber: { type: String, required: true,
     unique: true }, // "AZ-2025-00123

     status: {
        type: String,
        enum:['submitted', 'processing', 'approved',
             'rejected'],
        default: 'submitted',  
     },
     documents: [String],

     payment: {
        amount: Number,
        currency: { type: String, default: 'USD' },
        status: { type: String, enum: ['pending',
        'paid', 'refunded'], default: 'pending' },
         transactionId: String,
     },
},
 {timestamps: true}
)

EvisaSchema.index({ applicationNumber: 1 }, { unique: true })
EvisaSchema.index({ status: 1 })
EvisaSchema.index({ 'applicant.email': 1 })
EvisaSchema.index({ user: 1 })
