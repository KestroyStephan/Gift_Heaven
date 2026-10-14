import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    topic: { type: String, default: 'General' },
    orderNumber: { type: String, default: '' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    date: { type: Number, required: true }
})

messageSchema.index({ read: 1, date: -1 })

const messageModel = mongoose.models.message || mongoose.model('contactmessage', messageSchema)

export default messageModel
