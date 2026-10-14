import productModel from '../models/productModel.js'
import { boxStyles, albumLeadDays, cleanCustomization, customizationOf, earliestDay, priceForSize } from '../config/customization.js'

const MAX_LINES = 40

// Price and validate the gifts inside a build-your-own surprise box.
// Every gift is looked up in the database, so the customer can't change prices.
// Returns the box customisation with clean contents and the total of the gifts inside.
export const priceBox = async (custom, boxSize) => {
    const capacity = boxStyles[boxSize]
    if (!capacity) throw new Error('Unknown box style')

    const raw = custom.boxItems
    if (!Array.isArray(raw) || raw.length === 0) throw new Error('Please add at least one gift to the box')
    if (raw.length > MAX_LINES) throw new Error('Too many different gifts in one box')

    const ids = raw.map(line => String(line?._id || ''))
    if (ids.some(id => !/^[a-f0-9]{24}$/i.test(id))) throw new Error('Invalid gift in the box')
    const products = await productModel.find({ _id: { $in: ids } })

    let total = 0, giftCount = 0, cakes = 0, hasAlbum = false
    const items = []

    for (const line of raw) {
        const product = products.find(p => String(p._id) === String(line._id))
        if (!product) throw new Error('A gift in your box is no longer available')

        const allowed = customizationOf(product)
        if (allowed.box) throw new Error("A box can't contain another box")

        const quantity = Math.floor(Number(line.quantity))
        if (!quantity || quantity < 1 || quantity > 10) throw new Error(`Invalid quantity for ${product.name}`)
        if (product.sizes.length && !product.sizes.includes(line.size)) throw new Error(`Invalid size for ${product.name}`)

        let input = line.custom && typeof line.custom === 'object' ? { ...line.custom } : null
        // The cake is delivered with the box, on the box's date and time
        if (allowed.cake) {
            cakes += quantity
            input = { ...(input || {}), deliveryDate: custom.deliveryDate, timeSlot: custom.timeSlot }
        }
        const { custom: itemCustom, extras } = cleanCustomization(input, product)

        if (allowed.album) hasAlbum = true
        if (!allowed.cake) giftCount += quantity

        const unitPrice = priceForSize(product, line.size) + extras
        total += unitPrice * quantity
        items.push({
            _id: String(product._id), name: product.name, image: product.image?.[0] || '', category: product.category,
            size: line.size, quantity, unitPrice, custom: itemCustom,
        })
    }

    if (cakes > 1) throw new Error('One cake per surprise box, please')
    if (giftCount === 0) throw new Error('Please add at least one gift to the box')
    if (giftCount > capacity) throw new Error(`The ${boxSize} holds up to ${capacity} gifts — choose a bigger box or remove some`)
    if (hasAlbum && custom.deliveryDate < earliestDay(albumLeadDays)) {
        throw new Error(`Handmade photo albums need ${albumLeadDays} days — please pick a later delivery date`)
    }

    return { custom: { ...custom, boxItems: items }, extras: total }
}
