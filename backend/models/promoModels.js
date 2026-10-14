import mongoose from 'mongoose'

// A code the customer types at checkout
const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    // percent: value% off · fixed: Rs. value off · delivery: free delivery
    type: { type: String, enum: ['percent', 'fixed', 'delivery'], required: true },
    value: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },      // cap for percent coupons (0 = no cap)
    minOrder: { type: Number, default: 0 },
    categories: { type: [String], default: [] },    // empty = every category
    brands: { type: [String], default: [] },        // empty = every brand
    startsAt: { type: Number, default: 0 },
    endsAt: { type: Number, default: 0 },           // 0 = no end date
    usageLimit: { type: Number, default: 0 },       // total uses, 0 = unlimited
    perUserLimit: { type: Number, default: 1 },     // 0 = unlimited
    firstOrderOnly: { type: Boolean, default: false },
    showOnSite: { type: Boolean, default: false },  // listed on the Offers page
    active: { type: Boolean, default: true },
    usedCount: { type: Number, default: 0 },
    date: { type: Number, default: Date.now },
})

// An automatic sale: lowers prices in the store without a code
const offerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    badge: { type: String, default: '' },           // short label on product cards, e.g. "Avurudu Sale"
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true },
    // all · category · brand · products
    scope: { type: String, enum: ['all', 'category', 'brand', 'products'], default: 'all' },
    targets: { type: [String], default: [] },
    startsAt: { type: Number, default: 0 },
    endsAt: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    date: { type: Number, default: Date.now },
})

export const couponModel = mongoose.models.giftcoupon || mongoose.model('giftcoupon', couponSchema)
export const offerModel = mongoose.models.giftoffer || mongoose.model('giftoffer', offerSchema)
