import validator from 'validator'
import messageModel from '../models/messageModel.js'
import { sendEmail } from '../utils/notify.js'
import { storeName } from '../config/store.js'

const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

// Public: customer sends a message from the Contact page
const sendMessage = async (req, res) => {
    try {
        const { name, email, phone, topic, orderNumber, message } = req.body || {}

        if (!String(name || '').trim()) return res.json({ success: false, message: 'Please enter your name' })
        if (!validator.isEmail(String(email || ''))) return res.json({ success: false, message: 'Please enter a valid email' })
        if (String(message || '').trim().length < 5) return res.json({ success: false, message: 'Please write a short message' })
        if (String(message).length > 5000) return res.json({ success: false, message: 'Message is too long' })

        const saved = await messageModel.create({
            name: String(name).trim().slice(0, 120),
            email: String(email).trim().toLowerCase(),
            phone: String(phone || '').trim().slice(0, 40),
            topic: String(topic || 'General').slice(0, 60),
            orderNumber: String(orderNumber || '').trim().slice(0, 40),
            message: String(message).trim(),
            date: Date.now()
        })

        if (process.env.ADMIN_EMAIL) {
            sendEmail({
                to: process.env.ADMIN_EMAIL,
                subject: `${storeName} contact: ${saved.topic} from ${saved.name}`,
                html: `<p><b>${escapeHtml(saved.name)}</b> (${escapeHtml(saved.email)}${saved.phone ? ', ' + escapeHtml(saved.phone) : ''})</p>
                       ${saved.orderNumber ? `<p>Order: ${escapeHtml(saved.orderNumber)}</p>` : ''}
                       <p style="white-space:pre-line">${escapeHtml(saved.message)}</p>`
            })
        }
        sendEmail({
            to: saved.email,
            subject: `We've received your message — ${storeName}`,
            html: `<p>Hi ${escapeHtml(saved.name)},</p><p>Thanks for getting in touch. Our team will reply to you shortly.</p><p>— ${storeName}</p>`
        })

        res.json({ success: true, message: "Thanks! We'll get back to you shortly." })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: all messages, newest first
const listMessages = async (req, res) => {
    try {
        const messages = await messageModel.find({}).sort({ date: -1 })
        res.json({ success: true, messages })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: mark read / unread
const markMessage = async (req, res) => {
    try {
        const { id, read } = req.body
        await messageModel.findByIdAndUpdate(id, { read: !!read })
        res.json({ success: true })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const deleteMessage = async (req, res) => {
    try {
        await messageModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: 'Message deleted' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { sendMessage, listMessages, markMessage, deleteMessage }
