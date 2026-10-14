import productModel from '../models/productModel.js'
import stockMoveModel from '../models/stockMoveModel.js'

// Units of each product an order takes, including the gifts packed inside surprise boxes
export const stockNeeds = (items) => {
    const needs = new Map()
    const add = (id, qty) => needs.set(String(id), (needs.get(String(id)) || 0) + qty)
    for (const item of items) {
        add(item._id, item.quantity)
        for (const inner of item.custom?.boxItems || []) add(inner._id, inner.quantity * item.quantity)
    }
    return needs
}

const log = (product, change, reason, orderId, note = '') => stockMoveModel.create({
    productId: String(product._id), productName: product.name, change, stockAfter: product.stock, reason, orderId, note,
})

// Take the stock an order needs. All or nothing: if one gift has run out, nothing is taken.
export const reserveStock = async (order) => {
    if (order.stockReserved) return
    const taken = []
    try {
        for (const [id, qty] of stockNeeds(order.items)) {
            const product = await productModel.findOneAndUpdate(
                { _id: id, trackStock: true, stock: { $gte: qty } },
                { $inc: { stock: -qty } },
                { new: true }
            )
            if (product) { taken.push([product, qty]); continue }
            // Not reserved: either the gift is made to order, or there isn't enough left
            const current = await productModel.findById(id).select('name stock trackStock')
            if (current?.trackStock) {
                throw new Error(current.stock > 0 ? `Sorry, only ${current.stock} left of ${current.name}` : `Sorry, ${current.name} is out of stock`)
            }
        }
    } catch (error) {
        for (const [product, qty] of taken) await productModel.updateOne({ _id: product._id }, { $inc: { stock: qty } })
        throw error
    }
    await Promise.all(taken.map(([product, qty]) => log(product, -qty, 'order', String(order._id))))
    order.stockReserved = true
}

// Put an order's stock back (cancelled or unpaid orders)
export const releaseStock = async (order, note = '') => {
    if (!order?.stockReserved) return
    for (const [id, qty] of stockNeeds(order.items)) {
        const product = await productModel.findOneAndUpdate({ _id: id, trackStock: true }, { $inc: { stock: qty } }, { new: true })
        if (product) await log(product, qty, 'cancel', String(order._id), note)
    }
    order.stockReserved = false
}

// Manual change from the admin inventory page
export const adjustStock = async (product, { mode, quantity, note }) => {
    const qty = Math.floor(Number(quantity))
    if (!Number.isFinite(qty) || qty < 0 || qty > 100000) throw new Error('Please enter a valid quantity')
    const before = product.stock || 0
    let after = before
    if (mode === 'restock') after = before + qty
    else if (mode === 'damaged') after = before - qty
    else if (mode === 'set') after = qty
    else throw new Error('Unknown stock change')
    if (after < 0) throw new Error(`Only ${before} in stock`)
    if (after === before) return product

    product.stock = after
    await product.save()
    await log(product, after - before, mode === 'set' ? 'adjust' : mode, undefined, String(note || '').slice(0, 200))
    return product
}

// Cost of one unit in a size: the cost price scales with the size's selling price
export const unitCostOf = (product, sellingPrice) => {
    if (!product.costPrice) return 0
    if (!product.price) return product.costPrice
    return Math.round(product.costPrice * (sellingPrice / product.price))
}
