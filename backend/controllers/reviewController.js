import mongoose from 'mongoose'
import reviewModel from '../models/reviewModel.js'
import productModel from '../models/productModel.js'
import orderModel from '../models/orderModel.js'
import userModel from '../models/userModel.js'

const fail = (res, error) => { console.log(error.message); res.json({ success: false, message: error.message }) }
const isId = (id) => mongoose.isValidObjectId(String(id || ''))
const ownPhoto = (url) => typeof url === 'string' && url.startsWith(`https://res.cloudinary.com/${(process.env.CLOUDINARY_NAME || '').trim()}/`)
const publicName = (name) => { const [first, last] = String(name || 'Customer').trim().split(/\s+/); return last ? `${first} ${last[0].toUpperCase()}.` : first }

// Keep the product's average rating and count in step with its published reviews
export const refreshRating = async (productId) => {
    const [stats] = await reviewModel.aggregate([
        { $match: { productId: String(productId), status: 'published' } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ])
    await productModel.updateOne({ _id: productId }, { ratingAvg: stats ? Math.round(stats.avg * 10) / 10 : 0, ratingCount: stats?.count || 0 })
}

// Delivered orders that contain the product (also inside surprise boxes)
const deliveredOrderWith = (userId, productId) => orderModel.findOne({
    userId: String(userId), status: 'Delivered',
    $or: [{ 'items._id': new mongoose.Types.ObjectId(String(productId)) }, { 'items._id': String(productId) }, { 'items.custom.boxItems._id': String(productId) }],
}).select('_id')

const forPublic = (r, userId) => ({
    _id: r._id, name: r.name, rating: r.rating, title: r.title, comment: r.comment, photos: r.photos,
    verified: r.verified, reply: r.reply?.text ? r.reply : null, date: r.date, edited: !!r.updatedAt,
    helpful: r.helpful.length, markedHelpful: userId ? r.helpful.includes(String(userId)) : false,
})

// Store: published reviews of a product with the rating breakdown
const productReviews = async (req, res) => {
    try {
        const { id } = req.params
        if (!isId(id)) return res.json({ success: false, message: 'Product not found' })
        const reviews = await reviewModel.find({ productId: id, status: 'published' }).sort({ date: -1 }).lean()
        const breakdown = [5, 4, 3, 2, 1].map(stars => ({ stars, count: reviews.filter(r => r.rating === stars).length }))
        const average = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0
        res.json({ success: true, average, count: reviews.length, breakdown, withPhotos: reviews.filter(r => r.photos.length).length, reviews: reviews.map(r => forPublic(r, req.query.viewer)) })
    } catch (error) { fail(res, error) }
}

// Store: can this customer review the product, and their existing review
const myReview = async (req, res) => {
    try {
        const { userId, productId } = req.body
        if (!isId(productId)) return res.json({ success: false, message: 'Product not found' })
        const [review, order] = await Promise.all([
            reviewModel.findOne({ productId, userId }).lean(),
            deliveredOrderWith(userId, productId),
        ])
        res.json({ success: true, canReview: !!order || !!review, review: review ? { ...forPublic(review, userId), status: review.status } : null })
    } catch (error) { fail(res, error) }
}

// Store: write or edit your review (one per product, after delivery)
const saveReview = async (req, res) => {
    try {
        const { userId, productId } = req.body
        if (!isId(productId) || !(await productModel.exists({ _id: productId }))) return res.json({ success: false, message: 'Product not found' })
        const rating = Math.round(Number(req.body.rating))
        if (!(rating >= 1 && rating <= 5)) return res.json({ success: false, message: 'Please choose 1 to 5 stars' })
        const title = String(req.body.title || '').trim().slice(0, 100)
        const comment = String(req.body.comment || '').trim().slice(0, 2000)
        if (comment && comment.length < 10) return res.json({ success: false, message: 'Please write a little more (at least 10 characters)' })
        const photos = (Array.isArray(req.body.photos) ? req.body.photos : []).filter(ownPhoto).slice(0, 4)

        const existing = await reviewModel.findOne({ productId, userId })
        const order = existing ? null : await deliveredOrderWith(userId, productId)
        if (!existing && !order) return res.json({ success: false, message: 'You can review a gift once your order has been delivered' })

        if (existing) {
            Object.assign(existing, { rating, title, comment, photos, updatedAt: Date.now() })
            await existing.save()
        } else {
            const user = await userModel.findById(userId).select('name')
            await reviewModel.create({ productId, userId: String(userId), name: publicName(user?.name), rating, title, comment, photos, verified: true, orderId: String(order._id) })
        }
        await refreshRating(productId)
        res.json({ success: true, message: existing ? 'Your review has been updated' : 'Thank you for your review!' })
    } catch (error) { fail(res, error) }
}

const deleteMyReview = async (req, res) => {
    try {
        const review = await reviewModel.findOneAndDelete({ _id: req.body.id, userId: String(req.body.userId) })
        if (review) await refreshRating(review.productId)
        res.json({ success: true, message: 'Review deleted' })
    } catch (error) { fail(res, error) }
}

// Store: "Helpful" toggle (not on your own review)
const toggleHelpful = async (req, res) => {
    try {
        const { id, userId } = req.body
        const review = await reviewModel.findById(id)
        if (!review || review.status !== 'published') return res.json({ success: false, message: 'Review not found' })
        if (review.userId === String(userId)) return res.json({ success: false, message: "You can't vote on your own review" })
        const uid = String(userId)
        review.helpful = review.helpful.includes(uid) ? review.helpful.filter(u => u !== uid) : [...review.helpful, uid]
        await review.save()
        res.json({ success: true, helpful: review.helpful.length, markedHelpful: review.helpful.includes(uid) })
    } catch (error) { fail(res, error) }
}

// Store: gifts from delivered orders still waiting for a review
const toReview = async (req, res) => {
    try {
        const { userId } = req.body
        const [orders, reviews] = await Promise.all([
            orderModel.find({ userId: String(userId), status: 'Delivered' }).select('items._id').lean(),
            reviewModel.find({ userId: String(userId) }).select('productId').lean(),
        ])
        const done = new Set(reviews.map(r => r.productId))
        const pending = [...new Set(orders.flatMap(o => o.items.map(i => String(i._id))))].filter(id => !done.has(id))
        res.json({ success: true, pending, reviewed: [...done] })
    } catch (error) { fail(res, error) }
}

// Admin: every review with its product
const adminList = async (req, res) => {
    try {
        const reviews = await reviewModel.find({}).sort({ date: -1 }).limit(1000).lean()
        const products = await productModel.find({ _id: { $in: [...new Set(reviews.map(r => r.productId))] } }).select('name image').lean()
        const productOf = Object.fromEntries(products.map(p => [String(p._id), { name: p.name, image: p.image?.[0] || '' }]))
        const published = reviews.filter(r => r.status === 'published')
        res.json({
            success: true,
            reviews: reviews.map(r => ({ ...r, helpful: r.helpful.length, product: productOf[r.productId] || { name: 'Removed product', image: '' } })),
            summary: {
                total: reviews.length,
                average: published.length ? Math.round((published.reduce((s, r) => s + r.rating, 0) / published.length) * 10) / 10 : 0,
                fiveStar: published.filter(r => r.rating === 5).length,
                needsReply: reviews.filter(r => r.rating <= 3 && !r.reply?.text && r.status === 'published').length,
                hidden: reviews.filter(r => r.status === 'hidden').length,
            },
        })
    } catch (error) { fail(res, error) }
}

const adminUpdate = async (req, res) => {
    try {
        const { id, status, reply } = req.body
        const review = await reviewModel.findById(id)
        if (!review) return res.json({ success: false, message: 'Review not found' })
        if (status) {
            if (!['published', 'hidden'].includes(status)) return res.json({ success: false, message: 'Unknown status' })
            review.status = status
        }
        if (reply !== undefined) review.reply = String(reply).trim() ? { text: String(reply).trim().slice(0, 1000), date: Date.now() } : undefined
        await review.save()
        await refreshRating(review.productId)
        res.json({ success: true, message: status ? (status === 'hidden' ? 'Review hidden' : 'Review published') : 'Reply saved' })
    } catch (error) { fail(res, error) }
}

const adminDelete = async (req, res) => {
    try {
        const review = await reviewModel.findByIdAndDelete(req.body.id)
        if (review) await refreshRating(review.productId)
        res.json({ success: true, message: 'Review deleted' })
    } catch (error) { fail(res, error) }
}

// Store home: recent 4–5 star reviews with a comment
const highlights = async (req, res) => {
    try {
        const reviews = await reviewModel.find({ status: 'published', rating: { $gte: 4 }, comment: { $ne: '' } }).sort({ date: -1 }).limit(6).lean()
        const products = await productModel.find({ _id: { $in: reviews.map(r => r.productId) } }).select('name image').lean()
        const productOf = Object.fromEntries(products.map(p => [String(p._id), { _id: String(p._id), name: p.name, image: p.image?.[0] || '' }]))
        res.json({ success: true, reviews: reviews.filter(r => productOf[r.productId]).map(r => ({ ...forPublic(r), product: productOf[r.productId] })) })
    } catch (error) { fail(res, error) }
}

export { productReviews, myReview, saveReview, deleteMyReview, toggleHelpful, toReview, adminList, adminUpdate, adminDelete, highlights }
