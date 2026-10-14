import crypto from 'crypto'
import orderModel from '../models/orderModel.js'
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import messageModel from '../models/messageModel.js'
import chatModel from '../models/chatModel.js'
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { currency, deliveryCharge, orderStatuses, frontendUrl } from '../config/store.js'
import { notifyOrder } from '../utils/notify.js'
import { cleanCustomization, customizationOf, priceForSize } from '../config/customization.js'
import { priceBox } from '../utils/box.js'
import { reserveStock, releaseStock, unitCostOf } from '../utils/stock.js'
import { runningOffers, salePrice, evaluateCoupon, reserveCoupon, releaseCoupon } from '../utils/promo.js'
import brandModel from '../models/brandModel.js'
import reviewModel from '../models/reviewModel.js'


//Gate way Initialization (lazy, so the server still starts when a key is missing)
let stripe = null
const getStripe = () => {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe is not configured')
    if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    return stripe
}

let razorpay = null
const getRazorpay = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw new Error('Razorpay is not configured')
    if (!razorpay) razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
    return razorpay
}

const toMinorUnits = (value) => Math.round(Number(value) * 100)

const requiredAddressFields = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipcode', 'country', 'phone']

// Price cart lines from the database (with running offers), never from client prices
export const priceItems = async (items) => {
    if (!Array.isArray(items) || items.length === 0) throw new Error('Your cart is empty')
    const offers = await runningOffers()
    const products = await productModel.find({ _id: { $in: items.map(item => item._id) } })
    const orderItems = await Promise.all(items.map(async item => {
        const product = products.find(p => String(p._id) === String(item._id))
        const quantity = Math.floor(Number(item.quantity))
        if (!product) throw new Error('A product in your cart is no longer available')
        if (!quantity || quantity < 1) throw new Error('Invalid quantity for ' + product.name)
        if (product.sizes.length && !product.sizes.includes(item.size)) throw new Error('Invalid size for ' + product.name)
        let { custom, extras } = cleanCustomization(item.custom, product)
        // Surprise boxes add the price of every gift packed inside
        if (customizationOf(product).box) {
            const boxed = await priceBox(custom, item.size, offers)
            custom = boxed.custom
            extras += boxed.extras
        }
        const { customization, sizePrices, costPrice, stock, lowStock, trackStock, ...productData } = product.toObject()
        const sale = salePrice(product, item.size, offers)
        const basePrice = sale.price
        // What this line costs us, including the gifts inside a box (for profit reports)
        const unitCost = unitCostOf(product, sale.listPrice) + (custom?.boxItems || []).reduce((sum, b) => sum + (b.unitCost || 0) * b.quantity, 0)
        const offer = sale.offerName ? { listPrice: sale.listPrice + extras, offerName: sale.offerName } : {}
        return { ...productData, basePrice, extras, price: basePrice + extras, ...offer, custom, size: item.size, quantity, unitCost }
    }))
    return orderItems
}

// Build the order from the database, never from client prices
const buildOrder = async ({ userId, items, address, couponCode }, paymentMethod) => {
    if (!address || requiredAddressFields.some(field => !String(address[field] ?? '').trim())) {
        throw new Error('Please fill in all delivery details')
    }
    const orderItems = await priceItems(items)

    // Keep only known address fields; the gift note is optional
    const cleanAddress = Object.fromEntries(requiredAddressFields.map(field => [field, String(address[field]).trim()]))
    if (address.giftNote) cleanAddress.giftNote = String(address.giftNote).trim().slice(0, 300)

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const coupon = await evaluateCoupon(couponCode, userId, orderItems, deliveryCharge)
    const discount = coupon?.discount || 0
    const deliveryFee = coupon ? coupon.deliveryFee : deliveryCharge

    return {
        userId,
        items: orderItems,
        address: cleanAddress,
        subtotal, discount, deliveryFee,
        ...(coupon ? { couponCode: coupon.code } : {}),
        amount: subtotal - discount + deliveryFee,
        paymentMethod,
        payment: false,
        status: 'Order Placed',
        statusHistory: [{ status: 'Order Placed', date: Date.now() }],
        date: Date.now()
    }
}

const markPaid = async (order, paymentId) => {
    order.payment = true
    if (paymentId) order.paymentId = paymentId
    await order.save()
    await userModel.findByIdAndUpdate(order.userId, { cartData: {}, cartCustoms: {} })
    notifyOrder(order, 'paid')
}


// Placing orders using COD Method
const placeOrder = async (req, res) => {

    try {

        const newOrder = new orderModel(await buildOrder(req.body, 'COD'))
        await reserveStock(newOrder)
        await reserveCoupon(newOrder).catch(async (error) => { await releaseStock(newOrder); throw error })
        await newOrder.save().catch(async (error) => { await releaseStock(newOrder); await releaseCoupon(newOrder); throw error })

        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {}, cartCustoms: {} })
        notifyOrder(newOrder, 'placed')

        res.json({ success: true, message: "Order Placed", orderId: newOrder._id })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}


// Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
    let newOrder
    try {

        const stripe = getStripe()
        const origin = req.headers.origin || frontendUrl

        newOrder = new orderModel(await buildOrder(req.body, 'Stripe'))
        await reserveStock(newOrder)
        await reserveCoupon(newOrder)
        await newOrder.save()

        // With a coupon, Stripe gets one line for the discounted total
        const line_items = newOrder.discount > 0 ? [{
            price_data: { currency, product_data: { name: `Surprise Heaven order (${newOrder.items.length} gift${newOrder.items.length === 1 ? '' : 's'}, coupon ${newOrder.couponCode})` }, unit_amount: toMinorUnits(newOrder.amount - newOrder.deliveryFee) },
            quantity: 1,
        }] : newOrder.items.map((item) => ({
            price_data: {
                currency: currency,
                product_data: {
                    name: `${item.name} (${item.size})`
                },
                unit_amount: toMinorUnits(item.price)
            },
            quantity: item.quantity

        }))
        line_items.push({
            price_data: {
                currency: currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: toMinorUnits(newOrder.deliveryFee)
            },
            quantity: 1
        })
        if (!newOrder.deliveryFee) line_items.pop()

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
            customer_email: newOrder.address.email,
            metadata: { orderId: String(newOrder._id) },
            // unpaid sessions expire so their stock goes back on sale
            expires_at: Math.floor(Date.now() / 1000) + 60 * 60
        })

        newOrder.stripeSessionId = session.id
        await newOrder.save()

        res.json({ success: true, session_url: session.url })


    } catch (error) {
        await releaseStock(newOrder).catch(() => {})
        await releaseCoupon(newOrder).catch(() => {})
        if (newOrder?._id) await orderModel.findByIdAndDelete(newOrder._id).catch(() => {})
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

//verify Stripe - asks Stripe whether the session was actually paid
const verifyStripe = async (req, res) => {
    const { orderId, success, userId } = req.body
    try {
        const order = await orderModel.findOne({ _id: orderId, userId })
        if (!order) return res.json({ success: false, message: 'Order not found' })
        if (order.payment) return res.json({ success: true, orderId })

        if (success === "true" && order.stripeSessionId) {
            const session = await getStripe().checkout.sessions.retrieve(order.stripeSessionId)
            if (session.payment_status === 'paid') {
                await markPaid(order, session.payment_intent)
                return res.json({ success: true, orderId });
            }
        }

        await releaseStock(order, 'Payment not completed')
        await releaseCoupon(order)
        await orderModel.findByIdAndDelete(orderId)
        res.json({ success: false, message: 'Payment was not completed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }
}

// Placing orders using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
    let newOrder
    try {

        const razorpay = getRazorpay()

        newOrder = new orderModel(await buildOrder(req.body, 'Razorpay'))
        await reserveStock(newOrder)
        await reserveCoupon(newOrder)
        await newOrder.save()

        const razorpayOrder = await razorpay.orders.create({
            amount: toMinorUnits(newOrder.amount),
            currency: currency.toUpperCase(),
            receipt: String(newOrder._id)
        })

        newOrder.razorpayOrderId = razorpayOrder.id
        await newOrder.save()

        res.json({ success: true, order: razorpayOrder, key: process.env.RAZORPAY_KEY_ID, orderId: newOrder._id })

    } catch (error) {
        await releaseStock(newOrder).catch(() => {})
        await releaseCoupon(newOrder).catch(() => {})
        if (newOrder?._id) await orderModel.findByIdAndDelete(newOrder._id).catch(() => {})
        console.log(error)
        res.json({ success: false, message: error.error?.description || error.message })
    }
}

// verify Razorpay - checks the payment signature with our secret
const verifyRazorpay = async (req, res) => {
    try {

        const { userId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

        const order = await orderModel.findOne({ razorpayOrderId: razorpay_order_id, userId })
        if (!order) return res.json({ success: false, message: 'Order not found' })
        if (order.payment) return res.json({ success: true, orderId: order._id })

        const expected = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex')

        const valid = typeof razorpay_signature === 'string' && razorpay_signature.length === expected.length &&
            crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature))

        if (!valid) return res.json({ success: false, message: 'Payment verification failed' })

        await markPaid(order, razorpay_payment_id)
        res.json({ success: true, message: 'Payment Successful', orderId: order._id })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Remove an online order the customer abandoned before paying
const cancelPendingOrder = async (req, res) => {
    try {
        const { orderId, userId } = req.body
        const order = await orderModel.findOne({ _id: orderId, userId, payment: false, paymentMethod: { $ne: 'COD' } })
        if (order) {
            await releaseStock(order, 'Checkout cancelled')
            await releaseCoupon(order)
            await orderModel.deleteOne({ _id: order._id })
        }
        res.json({ success: true })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Customers never see what a gift costs us
const forCustomer = (order) => {
    const data = order.toObject()
    data.items = data.items.map(({ unitCost, ...item }) => ({
        ...item,
        custom: item.custom?.boxItems ? { ...item.custom, boxItems: item.custom.boxItems.map(({ unitCost, ...inner }) => inner) } : item.custom,
    }))
    delete data.stockReserved
    delete data.couponCounted
    return data
}

// Online orders abandoned at the payment page give their stock back after 2 hours
export const sweepAbandonedOrders = async () => {
    try {
        const stale = await orderModel.find({ payment: false, paymentMethod: { $ne: 'COD' }, date: { $lt: Date.now() - 2 * 60 * 60 * 1000 } })
        for (const order of stale) {
            await releaseStock(order, 'Payment never completed')
            await releaseCoupon(order)
            await orderModel.deleteOne({ _id: order._id })
        }
        if (stale.length) console.log(`Removed ${stale.length} unpaid online order(s)`)
    } catch (error) {
        console.log('Order sweep failed:', error.message)
    }
}

// Online orders that were never paid are not real orders
const visibleOrdersFilter = { $or: [{ paymentMethod: 'COD' }, { payment: true }] }

// All Orders data for Admin
const allOrders = async (req, res) => {

    try {

        const orders = await orderModel.find(visibleOrdersFilter).sort({ date: -1 })
        res.json({ success: true, orders })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// User Order Data
const userOrders = async (req, res) => {
    try {

        const { userId } = req.body;
        const orders = await orderModel.find({ userId, ...visibleOrdersFilter }).sort({ date: -1 })
        res.json({ success: true, orders: orders.map(forCustomer) })



    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Single order for the confirmation / tracking page
const singleOrder = async (req, res) => {
    try {
        const { userId, orderId } = req.body
        const order = await orderModel.findOne({ _id: orderId, userId })
        if (!order) return res.json({ success: false, message: 'Order not found' })
        res.json({ success: true, order: forCustomer(order) })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Update Order Status
const updateStatus = async (req, res) => {
    try {

        const { orderId, status } = req.body
        if (!orderStatuses.includes(status)) return res.json({ success: false, message: 'Invalid status' })

        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })

        // Cancelling puts the stock back; reopening a cancelled order takes it again
        if (status === 'Cancelled' && order.status !== 'Cancelled') { await releaseStock(order, 'Order cancelled'); await releaseCoupon(order) }
        if (status !== 'Cancelled' && order.status === 'Cancelled') { await reserveStock(order); await reserveCoupon(order, { force: true }) }

        order.status = status
        order.statusHistory = [...(order.statusHistory || []), { status, date: Date.now() }]
        // Cash on delivery is collected when the parcel is delivered
        if (status === 'Delivered' && order.paymentMethod === 'COD') order.payment = true
        await order.save()

        notifyOrder(order, 'status')
        res.json({ success: true, message: "Status has been Updated" })



    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Dashboard numbers for Admin
const orderStats = async (req, res) => {
    try {
        const orders = await orderModel.find(visibleOrdersFilter)
        const [totalProducts, totalUsers] = await Promise.all([productModel.countDocuments(), userModel.countDocuments()])

        const byStatus = Object.fromEntries(orderStatuses.map(status => [status, 0]))
        const byMethod = {}
        let revenue = 0
        let pendingPayments = 0
        for (const order of orders) {
            byStatus[order.status] = (byStatus[order.status] || 0) + 1
            byMethod[order.paymentMethod] = (byMethod[order.paymentMethod] || 0) + 1
            if (order.payment) revenue += order.amount
            else if (order.status !== 'Cancelled') pendingPayments += order.amount
        }

        // Sales for each of the last 30 days, best sellers and categories (cancelled orders don't count)
        const DAY = 24 * 60 * 60 * 1000
        const today = new Date(); today.setHours(0, 0, 0, 0)
        const start = today.getTime() - 29 * DAY
        const daily = Array.from({ length: 30 }, (_, i) => ({ day: new Date(start + i * DAY).toISOString().slice(0, 10), sales: 0, orders: 0 }))
        const products = {}, byCategory = {}
        for (const order of orders) {
            if (order.status === 'Cancelled') continue
            const index = Math.floor((order.date - start) / DAY)
            if (index >= 0 && index < 30) { daily[index].sales += order.amount; daily[index].orders += 1 }
            for (const item of order.items) {
                const key = String(item._id)
                products[key] = products[key] || { _id: key, name: item.name, image: item.image?.[0] || '', category: item.category, quantity: 0, sales: 0 }
                products[key].quantity += item.quantity
                products[key].sales += item.price * item.quantity
                byCategory[item.category] = (byCategory[item.category] || 0) + item.price * item.quantity
            }
        }
        const topProducts = Object.values(products).sort((a, b) => b.sales - a.sales).slice(0, 5)

        const [unreadMessages, unreadChats, lowStockItems, reviewsToAnswer, wished] = await Promise.all([
            messageModel.countDocuments({ read: false }),
            chatModel.countDocuments({ status: 'open', unreadAdmin: { $gt: 0 } }),
            productModel.find({ trackStock: true, $expr: { $lte: ['$stock', '$lowStock'] } }).select('name image stock lowStock').sort({ stock: 1 }).lean(),
            reviewModel.countDocuments({ status: 'published', rating: { $lte: 3 }, 'reply.text': { $exists: false } }),
            userModel.aggregate([{ $unwind: '$wishlist' }, { $group: { _id: '$wishlist', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
        ])
        const wishedProducts = await productModel.find({ _id: { $in: wished.map(w => w._id) } }).select('name image stock trackStock').lean()
        const mostWished = wished.map(w => { const p = wishedProducts.find(x => String(x._id) === w._id); return p && { _id: w._id, name: p.name, image: p.image?.[0] || '', count: w.count, stock: p.trackStock ? p.stock : null } }).filter(Boolean)
        const lowStock = lowStockItems.map(p => ({ _id: p._id, name: p.name, image: p.image?.[0] || '', stock: p.stock, lowStock: p.lowStock }))

        res.json({
            success: true,
            stats: { totalOrders: orders.length, revenue, pendingPayments, totalProducts, totalUsers, byStatus, byMethod, daily, topProducts, byCategory, unreadMessages, unreadChats, lowStock: lowStock.slice(0, 6), stockAlerts: lowStock.length, outOfStock: lowStock.filter(p => p.stock <= 0).length, reviewsToAnswer, mostWished },
            recentOrders: orders.sort((a, b) => b.date - a.date).slice(0, 5)
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Sales, income and profit between two dates, compared with the period before
const salesReport = async (req, res) => {
    try {
        const DAY = 24 * 60 * 60 * 1000
        const to = Number(req.body.to) || Date.now()
        const from = Number(req.body.from) || to - 30 * DAY
        if (from >= to || to - from > 400 * DAY) return res.json({ success: false, message: 'Please choose a range of up to 400 days' })
        const length = to - from

        const orders = await orderModel.find({ ...visibleOrdersFilter, date: { $gte: from - length, $lt: to } }).lean()
        const brands = await brandModel.find({}).select('slug name').lean()
        const brandName = Object.fromEntries(brands.map(b => [b.slug, b.name]))

        const summarise = (list) => {
            const live = list.filter(o => o.status !== 'Cancelled')
            const cancelled = list.filter(o => o.status === 'Cancelled')
            const sales = live.reduce((s, o) => s + o.amount, 0)
            const delivery = live.reduce((s, o) => s + (o.deliveryFee ?? deliveryCharge), 0)
            const discounts = live.reduce((s, o) => s + (o.discount || 0), 0)
            const offerSavings = live.reduce((s, o) => s + o.items.reduce((t, i) => t + ((i.listPrice || i.price) - i.price) * i.quantity, 0), 0)
            const cost = live.reduce((s, o) => s + o.items.reduce((t, i) => t + (i.unitCost || 0) * i.quantity, 0), 0)
            const income = live.filter(o => o.payment).reduce((s, o) => s + o.amount, 0)
            const units = live.reduce((s, o) => s + o.items.reduce((t, i) => t + i.quantity, 0), 0)
            const productSales = sales - delivery
            return {
                discounts, offerSavings, couponOrders: live.filter(o => o.couponCode).length,
                orders: live.length, sales, income, outstanding: sales - income, delivery, productSales, cost,
                profit: productSales - cost, margin: productSales ? Math.round(((productSales - cost) / productSales) * 1000) / 10 : 0,
                units, averageOrder: live.length ? Math.round(sales / live.length) : 0,
                cancelledOrders: cancelled.length, cancelledValue: cancelled.reduce((s, o) => s + o.amount, 0),
            }
        }

        const current = orders.filter(o => o.date >= from)
        const previous = orders.filter(o => o.date < from)

        // Day by day
        const start = new Date(from); start.setHours(0, 0, 0, 0)
        const days = Math.min(400, Math.ceil((to - start.getTime()) / DAY))
        const daily = Array.from({ length: days }, (_, i) => ({ day: new Date(start.getTime() + i * DAY).toISOString().slice(0, 10), sales: 0, income: 0, profit: 0, orders: 0 }))
        const byCategory = {}, byBrand = {}, byPayment = {}, products = {}
        for (const order of current) {
            if (order.status === 'Cancelled') continue
            const row = daily[Math.floor((order.date - start.getTime()) / DAY)]
            const orderCost = order.items.reduce((t, i) => t + (i.unitCost || 0) * i.quantity, 0)
            if (row) {
                row.sales += order.amount; row.orders += 1
                if (order.payment) row.income += order.amount
                row.profit += order.amount - (order.deliveryFee ?? deliveryCharge) - orderCost
            }
            const method = byPayment[order.paymentMethod] = byPayment[order.paymentMethod] || { orders: 0, sales: 0 }
            method.orders += 1; method.sales += order.amount
            for (const item of order.items) {
                const revenue = item.price * item.quantity, cost = (item.unitCost || 0) * item.quantity
                byCategory[item.category] = byCategory[item.category] || { sales: 0, units: 0, profit: 0 }
                byCategory[item.category].sales += revenue; byCategory[item.category].units += item.quantity; byCategory[item.category].profit += revenue - cost
                const brand = brandName[item.brand] || 'No brand'
                byBrand[brand] = byBrand[brand] || { sales: 0, units: 0, profit: 0 }
                byBrand[brand].sales += revenue; byBrand[brand].units += item.quantity; byBrand[brand].profit += revenue - cost
                const key = String(item._id)
                products[key] = products[key] || { _id: key, name: item.name, image: item.image?.[0] || '', category: item.category, units: 0, sales: 0, cost: 0 }
                products[key].units += item.quantity; products[key].sales += revenue; products[key].cost += cost
            }
        }
        const rows = (obj) => Object.entries(obj).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.sales - a.sales)

        res.json({
            success: true,
            range: { from, to },
            summary: summarise(current),
            previous: summarise(previous),
            daily,
            byCategory: rows(byCategory),
            byBrand: rows(byBrand),
            byPayment: rows(byPayment),
            products: Object.values(products).map(p => ({ ...p, profit: p.sales - p.cost })).sort((a, b) => b.sales - a.sales),
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { salesReport, verifyStripe, placeOrder, placeOrderStripe, placeOrderRazorpay, verifyRazorpay, cancelPendingOrder, allOrders, userOrders, singleOrder, updateStatus, orderStats }
