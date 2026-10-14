import mongoose from 'mongoose'

// One change to a product's stock: a sale, a cancelled order, a delivery from a supplier or a count correction
const stockMoveSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    change: { type: Number, required: true },
    stockAfter: { type: Number, required: true },
    reason: { type: String, enum: ['order', 'cancel', 'restock', 'adjust', 'damaged', 'initial'], required: true },
    orderId: { type: String },
    note: { type: String, default: '' },
    date: { type: Number, default: Date.now },
})

stockMoveSchema.index({ date: -1 })
stockMoveSchema.index({ productId: 1, date: -1 })

const stockMoveModel = mongoose.models.stockmove || mongoose.model('giftstockmove', stockMoveSchema)

export default stockMoveModel
