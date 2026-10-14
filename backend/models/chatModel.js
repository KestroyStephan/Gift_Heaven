import mongoose from 'mongoose'

const chatMessageSchema = new mongoose.Schema({
    from: { type: String, enum: ['customer', 'admin'], required: true },
    text: { type: String, default: '' },
    image: { type: String, default: '' },
    date: { type: Number, required: true }
}, { _id: true })

const chatSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    topic: { type: String, default: 'General' },
    userId: { type: String, default: '' },
    keyHash: { type: String, required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    messages: { type: [chatMessageSchema], default: [] },
    unreadAdmin: { type: Number, default: 0 },
    unreadCustomer: { type: Number, default: 0 },
    lastMessageAt: { type: Number, required: true }
})

chatSchema.index({ status: 1, lastMessageAt: -1 })
chatSchema.index({ userId: 1, lastMessageAt: -1 })

const chatModel = mongoose.models.chat || mongoose.model('chat', chatSchema)

export default chatModel
