import express from 'express'
import { startChat, getChat, sendChat, uploadChatImage, canUpload, adminList, adminGet, adminReply, adminStatus } from '../controllers/chatController.js'
import adminAuth from '../middleware/adminAuth.js'
import upload from '../middleware/multer.js'

const chatRouter = express.Router()

// Customers (guests use the conversation key, logged-in customers their token)
chatRouter.post('/start', startChat)
chatRouter.post('/get', getChat)
chatRouter.post('/send', sendChat)
chatRouter.post('/upload', canUpload, upload.single('image'), uploadChatImage)

// Admin
chatRouter.post('/admin/list', adminAuth, adminList)
chatRouter.post('/admin/get', adminAuth, adminGet)
chatRouter.post('/admin/reply', adminAuth, adminReply)
chatRouter.post('/admin/status', adminAuth, adminStatus)
chatRouter.post('/admin/upload', adminAuth, upload.single('image'), uploadChatImage)

export default chatRouter
