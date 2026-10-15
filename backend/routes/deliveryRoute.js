import express from 'express'
import { startLive, stopLive, riderView, riderLocation, riderDelivered } from '../controllers/deliveryController.js'
import adminAuth from '../middleware/adminAuth.js'

const deliveryRouter = express.Router()

// Admin assigns a rider and gets the private rider link
deliveryRouter.post('/start', adminAuth, startLive)
deliveryRouter.post('/stop', adminAuth, stopLive)

// Rider's phone (the link token is the key)
deliveryRouter.get('/rider/:token', riderView)
deliveryRouter.post('/rider/:token/location', riderLocation)
deliveryRouter.post('/rider/:token/delivered', riderDelivered)

export default deliveryRouter
