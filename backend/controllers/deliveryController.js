import crypto from 'crypto'
import orderModel from '../models/orderModel.js'
import { notifyOrder } from '../utils/notify.js'

const TRAIL_MAX = 300          // points kept for the route line
const fail = (res, error) => { console.log(error.message); res.json({ success: false, message: error.message }) }
const validToken = (t) => /^[A-Za-z0-9_-]{20,64}$/.test(String(t || ''))
const firstName = (name) => String(name || '').trim().split(/\s+/)[0]

// What customers may see of the live delivery (never the rider link token)
export const publicLive = (live, { withPhone = false } = {}) => {
    if (!live?.riderToken) return null
    return {
        active: !!live.active,
        riderName: firstName(live.riderName),
        ...(withPhone && live.riderPhone ? { riderPhone: live.riderPhone } : {}),
        startedAt: live.startedAt,
        last: live.active ? live.last || null : null,
        trail: live.active ? (live.trail || []).map(p => [p.lat, p.lng]) : [],
    }
}

const addStatus = (order, status, note) => {
    if (order.status === status) return false
    order.status = status
    order.statusHistory = [...(order.statusHistory || []), { status, date: Date.now(), ...(note ? { note } : {}) }]
    return true
}

// Admin: give an order to a rider and get the private link for their phone
const startLive = async (req, res) => {
    try {
        const { orderId } = req.body
        const riderName = String(req.body.riderName || '').trim().slice(0, 60)
        const riderPhone = String(req.body.riderPhone || '').trim().slice(0, 20)
        if (!riderName) return res.json({ success: false, message: "Enter the rider's name" })
        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })
        if (['Delivered', 'Cancelled'].includes(order.status)) return res.json({ success: false, message: `This order is already ${order.status.toLowerCase()}` })

        const previous = order.liveTracking || {}
        order.liveTracking = {
            riderToken: previous.active && previous.riderToken ? previous.riderToken : crypto.randomBytes(18).toString('base64url'),
            riderName, riderPhone, active: true, startedAt: Date.now(), last: null, trail: [],
        }
        const changed = addStatus(order, 'Out for delivery', `With rider ${firstName(riderName)}${riderPhone ? ` · ${riderPhone}` : ''} — follow live on the map`)
        order.markModified('liveTracking')
        await order.save()
        if (changed) notifyOrder(order, 'status')
        res.json({ success: true, message: 'Live tracking started', riderToken: order.liveTracking.riderToken })
    } catch (error) { fail(res, error) }
}

// Admin: stop sharing (e.g. wrong rider); the map disappears for the customer
const stopLive = async (req, res) => {
    try {
        const order = await orderModel.findById(req.body.orderId)
        if (!order?.liveTracking) return res.json({ success: false, message: 'No live tracking on this order' })
        order.liveTracking = { ...order.liveTracking, active: false, trail: [], last: null }
        order.markModified('liveTracking')
        await order.save()
        res.json({ success: true, message: 'Live tracking stopped' })
    } catch (error) { fail(res, error) }
}

const riderOrder = async (token) => validToken(token) ? orderModel.findOne({ 'liveTracking.riderToken': token }) : null

// Rider: the delivery they're carrying (only what they need at the door)
const riderView = async (req, res) => {
    try {
        const order = await riderOrder(req.params.token)
        if (!order) return res.json({ success: false, message: 'This delivery link is not valid' })
        const live = order.liveTracking
        const scheduled = order.items.flatMap(i => [i.custom, ...(i.custom?.boxItems || []).map(b => b.custom)]).find(c => c?.deliveryDate)
        res.json({
            success: true,
            delivery: {
                orderNo: String(order._id).slice(-8).toUpperCase(),
                status: order.status, active: !!live.active, riderName: live.riderName,
                recipient: `${order.address.firstName} ${order.address.lastName}`.trim(),
                address: [order.address.street, order.address.city, order.address.state, order.address.zipcode].filter(Boolean).join(', '),
                phone: order.address.phone,
                giftNote: order.address.giftNote || '',
                items: order.items.map(i => ({ name: i.name, size: i.size, quantity: i.quantity, inBox: (i.custom?.boxItems || []).map(b => `${b.name} × ${b.quantity}`) })),
                cashToCollect: order.paymentMethod === 'COD' && !order.payment ? order.amount : 0,
                surprise: order.items.some(i => i.custom?.surprise),
                scheduled: scheduled ? { date: scheduled.deliveryDate, slot: scheduled.timeSlot } : null,
                lastSentAt: live.last?.at || null,
            },
        })
    } catch (error) { fail(res, error) }
}

// Rider: a GPS position from the phone
const riderLocation = async (req, res) => {
    try {
        const lat = Number(req.body.lat), lng = Number(req.body.lng)
        if (!(lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180)) return res.json({ success: false, message: 'Invalid position' })
        const order = await riderOrder(req.params.token)
        if (!order) return res.json({ success: false, message: 'This delivery link is not valid' })
        if (!order.liveTracking.active || order.status !== 'Out for delivery') return res.json({ success: false, stopped: true, message: 'Live tracking for this delivery has ended' })

        const point = {
            lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6, at: Date.now(),
            accuracy: Number.isFinite(Number(req.body.accuracy)) ? Math.round(Number(req.body.accuracy)) : null,
            heading: Number.isFinite(Number(req.body.heading)) ? Math.round(Number(req.body.heading)) : null,
            speed: Number.isFinite(Number(req.body.speed)) ? Math.round(Number(req.body.speed) * 10) / 10 : null,
        }
        await orderModel.updateOne({ _id: order._id }, {
            $set: { 'liveTracking.last': point },
            $push: { 'liveTracking.trail': { $each: [{ lat: point.lat, lng: point.lng, at: point.at }], $slice: -TRAIL_MAX } },
        })
        res.json({ success: true, at: point.at })
    } catch (error) { fail(res, error) }
}

// Rider: handed over — mark delivered and stop sharing
const riderDelivered = async (req, res) => {
    try {
        const order = await riderOrder(req.params.token)
        if (!order) return res.json({ success: false, message: 'This delivery link is not valid' })
        if (order.status === 'Delivered') return res.json({ success: true, message: 'Already delivered' })
        if (order.status !== 'Out for delivery') return res.json({ success: false, message: `This order is ${order.status.toLowerCase()}` })
        const note = String(req.body.note || '').trim().slice(0, 200)
        addStatus(order, 'Delivered', note || `Delivered by ${firstName(order.liveTracking.riderName)}`)
        if (order.paymentMethod === 'COD') order.payment = true
        // the customer no longer needs the rider's location
        order.liveTracking = { ...order.liveTracking, active: false, trail: [], last: null, deliveredAt: Date.now() }
        order.markModified('liveTracking')
        await order.save()
        notifyOrder(order, 'status')
        res.json({ success: true, message: 'Marked as delivered — thank you!' })
    } catch (error) { fail(res, error) }
}

export { startLive, stopLive, riderView, riderLocation, riderDelivered }
