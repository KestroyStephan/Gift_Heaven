import express from 'express'
import { sendMessage, listMessages, markMessage, deleteMessage } from '../controllers/contactController.js'
import adminAuth from '../middleware/adminAuth.js'

const contactRouter = express.Router()

contactRouter.post('/send', sendMessage)
contactRouter.post('/list', adminAuth, listMessages)
contactRouter.post('/mark', adminAuth, markMessage)
contactRouter.post('/delete', adminAuth, deleteMessage)

export default contactRouter
