import mongoose from 'mongoose'

// A customer's rating and review of a gift they received
const reviewSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },          // shown as "Amaya P."
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '' },
    comment: { type: String, default: '' },
    photos: { type: [String], default: [] },
    verified: { type: Boolean, default: false },     // bought and delivered
    orderId: { type: String },
    status: { type: String, enum: ['published', 'hidden'], default: 'published' },
    reply: { text: { type: String }, date: { type: Number } },
    helpful: { type: [String], default: [] },        // user ids who found it helpful
    date: { type: Number, default: Date.now },
    updatedAt: { type: Number },
})

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true })
reviewSchema.index({ productId: 1, status: 1, date: -1 })
reviewSchema.index({ status: 1, date: -1 })

const reviewModel = mongoose.models.giftreview || mongoose.model('giftreview', reviewSchema)

export default reviewModel
