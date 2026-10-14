import express from 'express'

import {placeOrder, placeOrderStripe, placeOrderRazorpay, verifyRazorpay, cancelPendingOrder, allOrders, userOrders, singleOrder, updateStatus, verifyStripe, orderStats} from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'



const orderRouter = express.Router()


// admin Features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)
orderRouter.post('/stats', adminAuth, orderStats)

// Payment Features
orderRouter.post('/place',authUser, placeOrder)
orderRouter.post('/stripe',authUser, placeOrderStripe)
orderRouter.post('/razorpay',authUser, placeOrderRazorpay)
orderRouter.post('/cancel',authUser, cancelPendingOrder)

//User Features
orderRouter.post('/userorders', authUser, userOrders)
orderRouter.post('/single', authUser, singleOrder)

//verify Payments
orderRouter.post('/verifyStripe',authUser, verifyStripe)
orderRouter.post('/verifyRazorpay',authUser, verifyRazorpay)

export default orderRouter
