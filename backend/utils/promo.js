import { couponModel, offerModel } from '../models/promoModels.js'
import orderModel from '../models/orderModel.js'
import { priceForSize } from '../config/customization.js'

const live = (doc, now = Date.now()) => doc.active && (!doc.startsAt || doc.startsAt <= now) && (!doc.endsAt || doc.endsAt > now)

export const runningOffers = async () => (await offerModel.find({ active: true }).lean()).filter(o => live(o))

const offerCovers = (offer, product) =>
    offer.scope === 'all' ||
    (offer.scope === 'category' && offer.targets.includes(product.category)) ||
    (offer.scope === 'brand' && offer.targets.includes(product.brand)) ||
    (offer.scope === 'products' && offer.targets.includes(String(product._id)))

const cut = (offer, price) => Math.min(price, Math.round(offer.type === 'percent' ? price * offer.value / 100 : offer.value))

// The best running offer for a product at a price, if any
export const bestOffer = (product, price, offers) => {
    let best = null, saving = 0
    for (const offer of offers) {
        if (!offerCovers(offer, product)) continue
        const s = cut(offer, price)
        if (s > saving) { best = offer; saving = s }
    }
    return best ? { offer: best, saving } : null
}

// Price of a size after offers: { listPrice, price, offerName }
export const salePrice = (product, size, offers) => {
    const listPrice = priceForSize(product, size)
    const deal = bestOffer(product, listPrice, offers)
    return { listPrice, price: listPrice - (deal?.saving || 0), offerName: deal?.offer.badge || deal?.offer.name || '' }
}

// Work out a coupon for priced order lines. Throws a customer-friendly message when it can't be used.
export const evaluateCoupon = async (rawCode, userId, items, deliveryCharge) => {
    const code = String(rawCode || '').trim().toUpperCase()
    if (!code) return null
    const coupon = await couponModel.findOne({ code })
    if (!coupon || !coupon.active) throw new Error(`"${code}" isn't a valid coupon`)
    const now = Date.now()
    if (coupon.startsAt && coupon.startsAt > now) throw new Error(`${code} starts on ${new Date(coupon.startsAt).toLocaleDateString('en-LK')}`)
    if (coupon.endsAt && coupon.endsAt <= now) throw new Error(`${code} has expired`)
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new Error(`${code} has been fully used`)

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
    if (coupon.minOrder && subtotal < coupon.minOrder) throw new Error(`${code} needs an order of at least Rs. ${coupon.minOrder.toLocaleString('en-LK')}`)

    if (userId && (coupon.perUserLimit || coupon.firstOrderOnly)) {
        const mine = { userId: String(userId), status: { $ne: 'Cancelled' }, $or: [{ paymentMethod: 'COD' }, { payment: true }] }
        if (coupon.firstOrderOnly && await orderModel.exists(mine)) throw new Error(`${code} is for your first order only`)
        if (coupon.perUserLimit && await orderModel.countDocuments({ ...mine, couponCode: code }) >= coupon.perUserLimit) throw new Error(`You've already used ${code}`)
    }

    // Only the gifts the coupon covers count towards a percent or fixed discount
    const eligible = items.filter(i =>
        (!coupon.categories.length || coupon.categories.includes(i.category)) &&
        (!coupon.brands.length || coupon.brands.includes(i.brand)))
    const eligibleTotal = eligible.reduce((s, i) => s + i.price * i.quantity, 0)

    let discount = 0, freeDelivery = false
    if (coupon.type === 'delivery') freeDelivery = true
    else {
        if (!eligibleTotal) throw new Error(`${code} doesn't apply to the gifts in your bag`)
        discount = coupon.type === 'percent' ? Math.round(eligibleTotal * coupon.value / 100) : coupon.value
        if (coupon.type === 'percent' && coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
        discount = Math.min(discount, eligibleTotal)
    }
    return {
        coupon, code, discount, freeDelivery,
        deliveryFee: freeDelivery ? 0 : deliveryCharge,
        label: coupon.description || code,
    }
}

// Count a use when the order is placed (respecting the total limit); give it back if the order is cancelled
export const reserveCoupon = async (order, { force = false } = {}) => {
    if (!order.couponCode || order.couponCounted) return
    const filter = { code: order.couponCode }
    if (!force) filter.$or = [{ usageLimit: 0 }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }]
    const updated = await couponModel.findOneAndUpdate(filter, { $inc: { usedCount: 1 } })
    if (!updated && !force) throw new Error(`${order.couponCode} has just been fully used`)
    order.couponCounted = true
}

export const releaseCoupon = async (order) => {
    if (!order?.couponCode || !order.couponCounted) return
    await couponModel.updateOne({ code: order.couponCode, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } })
    order.couponCounted = false
}

export const isLive = live
