import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import { v2 as cloudinary } from 'cloudinary'
import chatModel from '../models/chatModel.js'
import { sendEmail } from '../utils/notify.js'
import { storeName, frontendUrl } from '../config/store.js'

const MAX_TEXT = 2000
const hash = (value) => crypto.createHash('sha256').update(String(value)).digest('hex')
const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

// Logged-in customer id from the optional token header
const userIdFrom = (req) => {
    try {
        return req.headers.token ? jwt.verify(req.headers.token, process.env.JWT_SECRET)?.id || '' : ''
    } catch {
        return ''
    }
}

// A customer may open a chat with its key, or as the logged-in owner
const findCustomerChat = async (req) => {
    const { conversationId, key } = req.body || {}
    if (!conversationId || !/^[a-f0-9]{24}$/i.test(String(conversationId))) return null
    const chat = await chatModel.findById(conversationId)
    if (!chat) return null
    const userId = userIdFrom(req)
    if (key && chat.keyHash === hash(key)) return chat
    if (userId && chat.userId === userId) return chat
    return null
}

const publicChat = (chat) => ({
    _id: chat._id, name: chat.name, topic: chat.topic, status: chat.status,
    messages: chat.messages, unreadCustomer: chat.unreadCustomer, lastMessageAt: chat.lastMessageAt
})

const cleanImage = (image) => {
    if (!image) return ''
    const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/`
    if (typeof image !== 'string' || !image.startsWith(prefix)) throw new Error('Invalid image')
    return image
}

// Customer: start a conversation
const startChat = async (req, res) => {
    try {
        const { name, email, phone, topic, text, image } = req.body || {}
        if (!String(name || '').trim()) return res.json({ success: false, message: 'Please enter your name' })
        if (!validator.isEmail(String(email || ''))) return res.json({ success: false, message: 'Please enter a valid email' })
        if (!String(text || '').trim() && !image) return res.json({ success: false, message: 'Please write a message' })

        const key = crypto.randomBytes(24).toString('hex')
        const now = Date.now()
        const chat = await chatModel.create({
            name: String(name).trim().slice(0, 80),
            email: String(email).trim().toLowerCase(),
            phone: String(phone || '').trim().slice(0, 30),
            topic: String(topic || 'General').slice(0, 60),
            userId: userIdFrom(req),
            keyHash: hash(key),
            messages: [{ from: 'customer', text: String(text || '').trim().slice(0, MAX_TEXT), image: cleanImage(image), date: now }],
            unreadAdmin: 1,
            lastMessageAt: now
        })

        if (process.env.ADMIN_EMAIL) {
            sendEmail({
                to: process.env.ADMIN_EMAIL,
                subject: `${storeName} chat: ${chat.topic} — ${chat.name}`,
                html: `<p><b>${escapeHtml(chat.name)}</b> (${escapeHtml(chat.email)}) started a chat about <b>${escapeHtml(chat.topic)}</b>.</p><p style="white-space:pre-line">${escapeHtml(text)}</p><p>Reply from the admin panel › Chats.</p>`
            })
        }

        res.json({ success: true, conversationId: chat._id, key, chat: publicChat(chat) })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Customer: read a conversation (marks admin replies as read)
const getChat = async (req, res) => {
    try {
        let chat = await findCustomerChat(req)
        // Logged-in customers can pick up their latest chat on any device
        if (!chat && !req.body?.conversationId) {
            const userId = userIdFrom(req)
            if (userId) chat = await chatModel.findOne({ userId }).sort({ lastMessageAt: -1 })
        }
        if (!chat) return res.json({ success: false, message: 'Conversation not found' })

        if (chat.unreadCustomer && req.body?.markRead) {
            chat.unreadCustomer = 0
            await chat.save()
        }
        res.json({ success: true, chat: publicChat(chat) })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Customer: send a message
const sendChat = async (req, res) => {
    try {
        const chat = await findCustomerChat(req)
        if (!chat) return res.json({ success: false, message: 'Conversation not found' })
        const text = String(req.body.text || '').trim().slice(0, MAX_TEXT)
        const image = cleanImage(req.body.image)
        if (!text && !image) return res.json({ success: false, message: 'Please write a message' })

        chat.messages.push({ from: 'customer', text, image, date: Date.now() })
        chat.unreadAdmin += 1
        chat.status = 'open'
        chat.lastMessageAt = Date.now()
        await chat.save()
        res.json({ success: true, chat: publicChat(chat) })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Customer or admin: upload a reference photo for the chat
const uploadChatImage = async (req, res) => {
    try {
        if (!req.file) return res.json({ success: false, message: 'Please choose an image' })
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'surprise-heaven/chat',
            resource_type: 'image',
            transformation: [{ width: 1600, height: 1600, crop: 'limit' }]
        })
        res.json({ success: true, url: result.secure_url })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Only customers with an existing chat (or logged in) may upload
const canUpload = async (req, res, next) => {
    if (userIdFrom(req)) return next()
    const conversationId = req.headers.conversationid
    const key = req.headers.chatkey
    if (conversationId && key) {
        const chat = await chatModel.findById(conversationId).catch(() => null)
        if (chat && chat.keyHash === hash(key)) return next()
    }
    res.json({ success: false, message: 'Start the chat first, then attach photos' })
}

// Admin: all conversations, newest activity first
const adminList = async (req, res) => {
    try {
        const chats = await chatModel.find({}).sort({ lastMessageAt: -1 }).select('-keyHash').lean()
        res.json({
            success: true,
            chats: chats.map(c => ({ ...c, preview: c.messages[c.messages.length - 1], messages: undefined, messageCount: c.messages.length }))
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: one conversation (marks customer messages as read)
const adminGet = async (req, res) => {
    try {
        const chat = await chatModel.findById(req.body.id).select('-keyHash')
        if (!chat) return res.json({ success: false, message: 'Conversation not found' })
        if (chat.unreadAdmin) {
            chat.unreadAdmin = 0
            await chat.save()
        }
        res.json({ success: true, chat })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: reply (the customer is also emailed)
const adminReply = async (req, res) => {
    try {
        const chat = await chatModel.findById(req.body.id)
        if (!chat) return res.json({ success: false, message: 'Conversation not found' })
        const text = String(req.body.text || '').trim().slice(0, MAX_TEXT)
        const image = cleanImage(req.body.image)
        if (!text && !image) return res.json({ success: false, message: 'Please write a reply' })

        chat.messages.push({ from: 'admin', text, image, date: Date.now() })
        chat.unreadCustomer += 1
        chat.unreadAdmin = 0
        chat.lastMessageAt = Date.now()
        await chat.save()

        sendEmail({
            to: chat.email,
            subject: `${storeName} replied to your message`,
            html: `<p>Hi ${escapeHtml(chat.name)},</p><p style="white-space:pre-line">${escapeHtml(text)}</p>${image ? `<p><img src="${escapeHtml(image)}" style="max-width:320px;border-radius:12px"></p>` : ''}<p><a href="${frontendUrl}">Continue the chat on our website</a></p>`
        })

        const { keyHash, ...safe } = chat.toObject()
        res.json({ success: true, chat: safe })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const adminStatus = async (req, res) => {
    try {
        const status = req.body.status === 'closed' ? 'closed' : 'open'
        await chatModel.findByIdAndUpdate(req.body.id, { status })
        res.json({ success: true })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { startChat, getChat, sendChat, uploadChatImage, canUpload, adminList, adminGet, adminReply, adminStatus }
