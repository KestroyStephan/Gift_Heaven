import crypto from 'crypto'
import mongoose from 'mongoose'
import userModel from '../models/userModel.js'
import productModel from '../models/productModel.js'

const MAX = 200
const fail = (res, error) => { console.log(error.message); res.json({ success: false, message: error.message }) }
const validIds = (ids) => [...new Set((Array.isArray(ids) ? ids : []).map(String).filter(id => mongoose.isValidObjectId(id)))]

// Only keep ids of products that still exist
const existing = async (ids) => {
    const found = await productModel.find({ _id: { $in: ids } }).select('_id').lean()
    const keep = new Set(found.map(p => String(p._id)))
    return ids.filter(id => keep.has(id))
}

const payload = (user) => ({ success: true, wishlist: user.wishlist || [], shared: !!user.wishlistShared, shareId: user.wishlistShared ? user.wishlistShareId : null })

const getWishlist = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId).select('wishlist wishlistShared wishlistShareId')
        if (!user) return res.json({ success: false, message: 'Account not found' })
        res.json(payload(user))
    } catch (error) { fail(res, error) }
}

// Add or remove one gift
const toggleWishlist = async (req, res) => {
    try {
        const [id] = validIds([req.body.productId])
        if (!id || !(await productModel.exists({ _id: id }))) return res.json({ success: false, message: 'Product not found' })
        const user = await userModel.findById(req.body.userId).select('wishlist wishlistShared wishlistShareId')
        const list = user.wishlist || []
        const added = !list.includes(id)
        if (added && list.length >= MAX) return res.json({ success: false, message: `Your wishlist can hold up to ${MAX} gifts` })
        user.wishlist = added ? [id, ...list] : list.filter(x => x !== id)
        await user.save()
        res.json({ ...payload(user), added })
    } catch (error) { fail(res, error) }
}

// Merge the hearts a guest added before logging in
const mergeWishlist = async (req, res) => {
    try {
        const incoming = await existing(validIds(req.body.ids))
        const user = await userModel.findById(req.body.userId).select('wishlist wishlistShared wishlistShareId')
        user.wishlist = [...new Set([...incoming, ...(user.wishlist || [])])].slice(0, MAX)
        await user.save()
        res.json(payload(user))
    } catch (error) { fail(res, error) }
}

// Turn the public share link on or off
const shareWishlist = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId).select('wishlist wishlistShared wishlistShareId')
        user.wishlistShared = !!req.body.shared
        if (user.wishlistShared && !user.wishlistShareId) user.wishlistShareId = crypto.randomBytes(9).toString('base64url')
        await user.save()
        res.json(payload(user))
    } catch (error) { fail(res, error) }
}

// Public: a shared wishlist (first name only, no account details)
const sharedWishlist = async (req, res) => {
    try {
        const shareId = String(req.params.shareId || '')
        if (!/^[A-Za-z0-9_-]{8,30}$/.test(shareId)) return res.json({ success: false, message: 'Wishlist not found' })
        const user = await userModel.findOne({ wishlistShareId: shareId, wishlistShared: true }).select('name wishlist').lean()
        if (!user) return res.json({ success: false, message: 'This wishlist is private or no longer shared' })
        res.json({ success: true, name: String(user.name || '').trim().split(/\s+/)[0], productIds: await existing(user.wishlist || []) })
    } catch (error) { fail(res, error) }
}

export { getWishlist, toggleWishlist, mergeWishlist, shareWishlist, sharedWishlist }
