import crypto from 'crypto'
import orderModel from '../models/orderModel.js'
import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import { currency, deliveryCharge, orderStatuses, frontendUrl } from '../config/store.js'
import { notifyOrder } from '../utils/notify.js'
import { cleanCustomization, priceForSize } from '../config/customization.js'


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

// Build the order from the database, never from client prices
const buildOrder = async ({ userId, items, address }, paymentMethod) => {
    if (!Array.isArray(items) || items.length === 0) throw new Error('Your cart is empty')
    if (!address || requiredAddressFields.some(field => !String(address[field] ?? '').trim())) {
        throw new Error('Please fill in all delivery details')
    }

    const products = await productModel.find({ _id: { $in: items.map(item => item._id) } })
    const orderItems = items.map(item => {
        const product = products.find(p => String(p._id) === String(item._id))
        const quantity = Math.floor(Number(item.quantity))
        if (!product) throw new Error('A product in your cart is no longer available')
        if (!quantity || quantity < 1) throw new Error('Invalid quantity for ' + product.name)
        if (product.sizes.length && !product.sizes.includes(item.size)) throw new Error('Invalid size for ' + product.name)
        const { custom, extras } = cleanCustomization(item.custom, product)
        const { customization, sizePrices, ...productData } = product.toObject()
        const basePrice = priceForSize(product, item.size)
        return { ...productData, basePrice, extras, price: basePrice + extras, custom, size: item.size, quantity }
    })

    // Keep only known address fields; the gift note is optional
    const cleanAddress = Object.fromEntries(requiredAddressFields.map(field => [field, String(address[field]).trim()]))
    if (address.giftNote) cleanAddress.giftNote = String(address.giftNote).trim().slice(0, 300)

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return {
        userId,
        items: orderItems,
        address: cleanAddress,
        amount: subtotal + deliveryCharge,
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
        await newOrder.save()

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
        await newOrder.save()

        const line_items = newOrder.items.map((item) => ({
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
                unit_amount: toMinorUnits(deliveryCharge)
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
            customer_email: newOrder.address.email,
            metadata: { orderId: String(newOrder._id) }
        })

        newOrder.stripeSessionId = session.id
        await newOrder.save()

        res.json({ success: true, session_url: session.url })


    } catch (error) {
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
        await orderModel.deleteOne({ _id: orderId, userId, payment: false, paymentMethod: { $ne: 'COD' } })
        res.json({ success: true })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
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
        res.json({ success: true, orders })



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
        res.json({ success: true, order })
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

        res.json({
            success: true,
            stats: { totalOrders: orders.length, revenue, pendingPayments, totalProducts, totalUsers, byStatus, byMethod },
            recentOrders: orders.sort((a, b) => b.date - a.date).slice(0, 5)
        })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { verifyStripe, placeOrder, placeOrderStripe, placeOrderRazorpay, verifyRazorpay, cancelPendingOrder, allOrders, userOrders, singleOrder, updateStatus, orderStats }
