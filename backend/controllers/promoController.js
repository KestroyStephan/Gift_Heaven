import { couponModel, offerModel } from '../models/promoModels.js'
import orderModel from '../models/orderModel.js'
import productModel from '../models/productModel.js'
import { runningOffers, evaluateCoupon, isLive } from '../utils/promo.js'
import { priceItems } from './orderController.js'
import { deliveryCharge } from '../config/store.js'

const fail = (res, error) => { console.log(error.message); res.json({ success: false, message: error.message }) }
const toNumber = (v, fallback = 0) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : fallback }
const toDate = (v) => v ? new Date(v).getTime() || 0 : 0
const list = (v) => (Array.isArray(v) ? v : []).map(String).filter(Boolean).slice(0, 200)

// Store: running sales and the coupons we advertise
const publicPromos = async (req, res) => {
    try {
        const [offers, coupons] = await Promise.all([
            runningOffers(),
            couponModel.find({ active: true, showOnSite: true }).lean(),
        ])
        res.json({
            success: true,
            offers: offers.map(({ _id, name, badge, type, value, scope, targets, endsAt }) => ({ _id, name, badge, type, value, scope, targets, endsAt })),
            coupons: coupons.filter(c => isLive(c) && (!c.usageLimit || c.usedCount < c.usageLimit))
                .map(({ code, description, type, value, maxDiscount, minOrder, endsAt, firstOrderOnly }) => ({ code, description, type, value, maxDiscount, minOrder, endsAt, firstOrderOnly })),
        })
    } catch (error) { fail(res, error) }
}

// Store: check a coupon against the bag and return the discount
const applyCoupon = async (req, res) => {
    try {
        const items = await priceItems(req.body.items)
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
        const result = await evaluateCoupon(req.body.code, req.body.userId, items, deliveryCharge)
        if (!result) return res.json({ success: false, message: 'Please enter a coupon code' })
        res.json({
            success: true,
            coupon: { code: result.code, label: result.label, type: result.coupon.type },
            subtotal, discount: result.discount, deliveryFee: result.deliveryFee,
            total: subtotal - result.discount + result.deliveryFee,
            message: result.freeDelivery ? 'Free delivery applied' : `You save Rs. ${result.discount.toLocaleString('en-LK')}`,
        })
    } catch (error) { res.json({ success: false, message: error.message }) }
}

// Admin: every coupon and offer with how it's doing
const listPromos = async (req, res) => {
    try {
        const [coupons, offers, usage, products] = await Promise.all([
            couponModel.find({}).sort({ date: -1 }).lean(),
            offerModel.find({}).sort({ date: -1 }).lean(),
            orderModel.aggregate([
                { $match: { couponCode: { $exists: true }, status: { $ne: 'Cancelled' }, $or: [{ paymentMethod: 'COD' }, { payment: true }] } },
                { $group: { _id: '$couponCode', orders: { $sum: 1 }, discount: { $sum: '$discount' }, revenue: { $sum: '$amount' } } },
            ]),
            productModel.find({}).select('category brand').lean(),
        ])
        const usageOf = Object.fromEntries(usage.map(u => [u._id, u]))
        const covered = (o) => o.scope === 'all' ? products.length
            : products.filter(p => o.scope === 'category' ? o.targets.includes(p.category) : o.scope === 'brand' ? o.targets.includes(p.brand) : o.targets.includes(String(p._id))).length
        res.json({
            success: true,
            coupons: coupons.map(c => ({ ...c, orders: usageOf[c.code]?.orders || 0, discountGiven: usageOf[c.code]?.discount || 0, revenue: usageOf[c.code]?.revenue || 0 })),
            offers: offers.map(o => ({ ...o, products: covered(o) })),
        })
    } catch (error) { fail(res, error) }
}

const saveCoupon = async (req, res) => {
    try {
        const b = req.body
        const code = String(b.code || '').trim().toUpperCase().replace(/\s+/g, '')
        if (!/^[A-Z0-9_-]{3,20}$/.test(code)) return res.json({ success: false, message: 'Use 3–20 letters or numbers for the code' })
        if (!['percent', 'fixed', 'delivery'].includes(b.type)) return res.json({ success: false, message: 'Choose a discount type' })
        const value = toNumber(b.value)
        if (b.type === 'percent' && (value <= 0 || value > 90)) return res.json({ success: false, message: 'Percent off must be between 1 and 90' })
        if (b.type === 'fixed' && value <= 0) return res.json({ success: false, message: 'Enter the amount off' })
        const data = {
            code, type: b.type, value: b.type === 'delivery' ? 0 : value,
            description: String(b.description || '').slice(0, 120),
            maxDiscount: toNumber(b.maxDiscount), minOrder: toNumber(b.minOrder),
            categories: list(b.categories), brands: list(b.brands),
            startsAt: toDate(b.startsAt), endsAt: toDate(b.endsAt),
            usageLimit: Math.floor(toNumber(b.usageLimit)), perUserLimit: Math.floor(toNumber(b.perUserLimit, 1)),
            firstOrderOnly: !!b.firstOrderOnly, showOnSite: !!b.showOnSite, active: b.active !== false,
        }
        if (data.endsAt && data.startsAt && data.endsAt <= data.startsAt) return res.json({ success: false, message: 'The end date must be after the start date' })
        const clash = await couponModel.findOne({ code, _id: { $ne: b.id || null } })
        if (clash) return res.json({ success: false, message: `${code} already exists` })
        if (b.id) await couponModel.updateOne({ _id: b.id }, data)
        else await couponModel.create(data)
        res.json({ success: true, message: b.id ? 'Coupon updated' : 'Coupon created' })
    } catch (error) { fail(res, error) }
}

const saveOffer = async (req, res) => {
    try {
        const b = req.body
        if (!String(b.name || '').trim()) return res.json({ success: false, message: 'Give the offer a name' })
        if (!['percent', 'fixed'].includes(b.type)) return res.json({ success: false, message: 'Choose a discount type' })
        const value = toNumber(b.value)
        if (b.type === 'percent' && (value <= 0 || value > 90)) return res.json({ success: false, message: 'Percent off must be between 1 and 90' })
        if (b.type === 'fixed' && value <= 0) return res.json({ success: false, message: 'Enter the amount off' })
        if (!['all', 'category', 'brand', 'products'].includes(b.scope)) return res.json({ success: false, message: 'Choose what the offer applies to' })
        const targets = b.scope === 'all' ? [] : list(b.targets)
        if (b.scope !== 'all' && !targets.length) return res.json({ success: false, message: 'Pick at least one category, brand or product' })
        const data = {
            name: String(b.name).trim().slice(0, 80), badge: String(b.badge || '').trim().slice(0, 24),
            type: b.type, value, scope: b.scope, targets,
            startsAt: toDate(b.startsAt), endsAt: toDate(b.endsAt), active: b.active !== false,
        }
        if (data.endsAt && data.startsAt && data.endsAt <= data.startsAt) return res.json({ success: false, message: 'The end date must be after the start date' })
        if (b.id) await offerModel.updateOne({ _id: b.id }, data)
        else await offerModel.create(data)
        res.json({ success: true, message: b.id ? 'Offer updated' : 'Offer created' })
    } catch (error) { fail(res, error) }
}

const removePromo = async (req, res) => {
    try {
        const model = req.body.kind === 'offer' ? offerModel : couponModel
        await model.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: req.body.kind === 'offer' ? 'Offer deleted' : 'Coupon deleted' })
    } catch (error) { fail(res, error) }
}

export { publicPromos, applyCoupon, listPromos, saveCoupon, saveOffer, removePromo }
