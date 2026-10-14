import express from 'express'
import { productReviews, myReview, saveReview, deleteMyReview, toggleHelpful, toReview, adminList, adminUpdate, adminDelete, highlights } from '../controllers/reviewController.js'
import authUser from '../middleware/auth.js'
import adminAuth from '../middleware/adminAuth.js'

const reviewRouter = express.Router()

reviewRouter.get('/product/:id', productReviews)
reviewRouter.get('/highlights', highlights)
reviewRouter.post('/mine', authUser, myReview)
reviewRouter.post('/save', authUser, saveReview)
reviewRouter.post('/delete', authUser, deleteMyReview)
reviewRouter.post('/helpful', authUser, toggleHelpful)
reviewRouter.post('/to-review', authUser, toReview)

reviewRouter.post('/admin/list', adminAuth, adminList)
reviewRouter.post('/admin/update', adminAuth, adminUpdate)
reviewRouter.post('/admin/delete', adminAuth, adminDelete)

export default reviewRouter
