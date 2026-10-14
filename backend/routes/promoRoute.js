import express from 'express'
import { publicPromos, applyCoupon, listPromos, saveCoupon, saveOffer, removePromo } from '../controllers/promoController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const promoRouter = express.Router()

promoRouter.get('/public', publicPromos)
promoRouter.post('/apply', authUser, applyCoupon)

promoRouter.post('/list', adminAuth, listPromos)
promoRouter.post('/coupon', adminAuth, saveCoupon)
promoRouter.post('/offer', adminAuth, saveOffer)
promoRouter.post('/remove', adminAuth, removePromo)

export default promoRouter
