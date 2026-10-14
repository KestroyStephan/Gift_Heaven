// Gift personalisation options shared by every product.
// Prices are in Sri Lankan rupees (LKR) and are always recalculated on the server.

export const wrapOptions = [
    { id: 'classic', name: 'Classic blush wrap', price: 0 },
    { id: 'kraft', name: 'Rustic kraft paper', price: 0 },
    { id: 'festive', name: 'Festive red & gold', price: 600 },
    { id: 'luxe', name: 'Luxe black & gold box', price: 1200 },
]

export const ribbonColors = [
    { id: 'berry', name: 'Berry', hex: '#A3214F' },
    { id: 'gold', name: 'Gold', hex: '#C9973B' },
    { id: 'red', name: 'Red', hex: '#C21F3A' },
    { id: 'blush', name: 'Blush', hex: '#F2A7BC' },
    { id: 'lilac', name: 'Lilac', hex: '#8E6BB8' },
    { id: 'green', name: 'Leaf green', hex: '#2F6B4F' },
    { id: 'ivory', name: 'Ivory', hex: '#F7F1EA' },
]

export const addOns = [
    { id: 'card', name: 'Premium greeting card', price: 900 },
    { id: 'candle', name: 'Scented candle', price: 2100 },
    { id: 'chocolates', name: 'Extra box of chocolates', price: 2400 },
    { id: 'balloon', name: 'Helium heart balloon', price: 1800 },
    { id: 'teddy', name: 'Mini teddy bear', price: 3000 },
]

// Printed products (mugs, T-shirts, cushions, frame art)
export const printColours = [
    { id: 'white', name: 'White', hex: '#FFFFFF' },
    { id: 'black', name: 'Black', hex: '#1F1A1D' },
    { id: 'navy', name: 'Navy', hex: '#22304F' },
    { id: 'red', name: 'Red', hex: '#B3202E' },
    { id: 'pink', name: 'Pink', hex: '#F2A7BC' },
    { id: 'yellow', name: 'Sunshine', hex: '#F5C342' },
]

// Cakes
export const cakeOptions = {
    flavours: [
        { id: 'chocolate', name: 'Rich chocolate', price: 0 },
        { id: 'vanilla', name: 'Vanilla sponge', price: 0 },
        { id: 'butter', name: 'Butter cake', price: 0 },
        { id: 'ribbon', name: 'Sri Lankan ribbon cake', price: 0 },
        { id: 'redvelvet', name: 'Red velvet', price: 900 },
        { id: 'blackforest', name: 'Black forest', price: 900 },
        { id: 'chocolatebiscuit', name: 'Chocolate biscuit pudding', price: 600 },
    ],
    eggless: { name: 'Eggless', price: 900 },
    photoPrint: { name: 'Edible photo print', price: 1500 },
    messageLimit: 40,
    leadDays: 2,
    timeSlots: ['9 am – 12 pm', '12 pm – 3 pm', '3 pm – 6 pm', '6 pm – 9 pm'],
}

export const limits = { name: 40, message: 200, printText: 60, albumTitle: 60, albumQuotes: 500, albumPhotos: 40 }

// Build-your-own surprise box: style -> how many gifts fit inside (the cake travels alongside)
export const boxStyles = { 'Classic Kraft Box': 6, 'Luxe Heart Box': 8, 'Wooden Hamper Crate': 14 }
export const boxLeadDays = 2
// Handmade photo albums need an extra day for printing and paper-cutting
export const albumLeadDays = 3

// What a product offers when the admin hasn't chosen
export const defaultCustomization = { name: true, message: true, ribbon: true, wrap: true, addOns: true, photo: false, print: false, cake: false, engrave: false, album: false, box: false }

export const recipientOptions = ['kids', 'teens', 'her', 'him', 'couples', 'elders', 'baby']

export const customizationOf = (product) => ({ ...defaultCustomization, ...(product.customization || {}) })

// Price for the chosen size (size-based prices override the base price)
export const priceForSize = (product, size) => {
    const sized = product.sizePrices?.[size]
    return typeof sized === 'number' && sized >= 0 ? sized : product.price
}

const isoDay = (date) => date.toISOString().slice(0, 10)

export const earliestDay = (days) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return isoDay(d)
}

// Only files uploaded through our own Cloudinary account
export const isOwnUpload = (url) => typeof url === 'string' && url.startsWith(`https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/`)

// Validate a customer's choices against what the product allows.
// Returns { custom, extras } with only known values, or throws.
export const cleanCustomization = (input, product) => {
    const allowed = customizationOf(product)

    // Cakes must always carry a flavour and a delivery date
    if (allowed.cake && (!input || !input.cakeFlavour || !input.deliveryDate)) {
        throw new Error(`Please choose a flavour and delivery date for ${product.name}`)
    }
    if (!input || typeof input !== 'object') return { custom: null, extras: 0 }

    const custom = {}
    let extras = 0

    if (allowed.name && input.name) custom.name = String(input.name).trim().slice(0, limits.name)
    if (allowed.message && input.message) custom.message = String(input.message).trim().slice(0, limits.message)

    if (allowed.ribbon && input.ribbon) {
        const ribbon = ribbonColors.find(r => r.id === input.ribbon)
        if (!ribbon) throw new Error('Unknown ribbon colour')
        custom.ribbon = ribbon.id
    }

    if (allowed.wrap && input.wrap) {
        const wrap = wrapOptions.find(w => w.id === input.wrap)
        if (!wrap) throw new Error('Unknown wrapping option')
        custom.wrap = wrap.id
        extras += wrap.price
    }

    if (allowed.addOns && Array.isArray(input.addOns) && input.addOns.length) {
        custom.addOns = []
        for (const id of [...new Set(input.addOns)]) {
            const addOn = addOns.find(a => a.id === id)
            if (!addOn) throw new Error('Unknown add-on')
            custom.addOns.push(addOn.id)
            extras += addOn.price
        }
    }

    // Engraving (pens, key tags, jewellery) shares the print-text field
    if (allowed.engrave && !allowed.print && input.printText) custom.printText = String(input.printText).trim().slice(0, limits.printText)

    if (allowed.print) {
        if (input.printText) custom.printText = String(input.printText).trim().slice(0, limits.printText)
        if (input.printColour) {
            const colour = printColours.find(c => c.id === input.printColour)
            if (!colour) throw new Error('Unknown product colour')
            custom.printColour = colour.id
        }
    }

    if (allowed.cake) {
        const flavour = cakeOptions.flavours.find(f => f.id === input.cakeFlavour)
        if (!flavour) throw new Error('Unknown cake flavour')
        custom.cakeFlavour = flavour.id
        extras += flavour.price

        if (input.eggless) { custom.eggless = true; extras += cakeOptions.eggless.price }
        if (input.cakeMessage) custom.cakeMessage = String(input.cakeMessage).trim().slice(0, cakeOptions.messageLimit)

        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(input.deliveryDate)) || input.deliveryDate < earliestDay(cakeOptions.leadDays)) {
            throw new Error(`Cakes need at least ${cakeOptions.leadDays} days' notice — please pick a later delivery date`)
        }
        custom.deliveryDate = input.deliveryDate
        if (input.timeSlot) {
            if (!cakeOptions.timeSlots.includes(input.timeSlot)) throw new Error('Unknown delivery time')
            custom.timeSlot = input.timeSlot
        }
    }

    // Handmade photo album: customer photos, a title and love quotes to paper-cut
    if (allowed.album) {
        const photos = Array.isArray(input.photos) ? input.photos.filter(Boolean) : []
        if (photos.length === 0) throw new Error(`Please upload at least one photo for the ${product.name}`)
        if (photos.length > limits.albumPhotos) throw new Error(`Up to ${limits.albumPhotos} photos per album`)
        if (!photos.every(isOwnUpload)) throw new Error('Invalid album photo')
        custom.photos = photos
        if (input.albumTitle) custom.albumTitle = String(input.albumTitle).trim().slice(0, limits.albumTitle)
        if (input.albumQuotes) custom.albumQuotes = String(input.albumQuotes).trim().slice(0, limits.albumQuotes)
    }

    // Surprise box: delivery details here; the gifts inside are priced in utils/box.js
    if (allowed.box) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(input.deliveryDate)) || input.deliveryDate < earliestDay(boxLeadDays)) {
            throw new Error(`Surprise boxes need at least ${boxLeadDays} days' notice — please pick a later delivery date`)
        }
        custom.deliveryDate = input.deliveryDate
        if (input.timeSlot) {
            if (!cakeOptions.timeSlots.includes(input.timeSlot)) throw new Error('Unknown delivery time')
            custom.timeSlot = input.timeSlot
        }
        if (input.surprise) custom.surprise = true
        if (!Array.isArray(input.boxItems) || input.boxItems.length === 0) throw new Error('Please add at least one gift to the box')
        custom.boxItems = input.boxItems
    }

    if (allowed.photo && input.photo) {
        // Only photos uploaded through our own Cloudinary account
        if (!isOwnUpload(input.photo)) throw new Error('Invalid photo')
        custom.photo = input.photo
        if (allowed.cake) extras += cakeOptions.photoPrint.price
    }

    return Object.keys(custom).length ? { custom, extras } : { custom: null, extras: 0 }
}

// Human-readable lines for emails and admin
export const describeCustomization = (custom) => {
    if (!custom) return []
    const lines = []
    if (custom.name) lines.push(`For: ${custom.name}`)
    if (custom.message) lines.push(`Message: “${custom.message}”`)
    if (custom.printText) lines.push(`Print text: “${custom.printText}”`)
    if (custom.printColour) lines.push(`Colour: ${printColours.find(c => c.id === custom.printColour)?.name || custom.printColour}`)
    if (custom.cakeFlavour) lines.push(`Flavour: ${cakeOptions.flavours.find(f => f.id === custom.cakeFlavour)?.name || custom.cakeFlavour}${custom.eggless ? ' (eggless)' : ''}`)
    if (custom.cakeMessage) lines.push(`On the cake: “${custom.cakeMessage}”`)
    if (custom.deliveryDate) lines.push(`Deliver: ${custom.deliveryDate}${custom.timeSlot ? ', ' + custom.timeSlot : ''}`)
    if (custom.ribbon) lines.push(`Ribbon: ${ribbonColors.find(r => r.id === custom.ribbon)?.name || custom.ribbon}`)
    if (custom.wrap) lines.push(`Wrapping: ${wrapOptions.find(w => w.id === custom.wrap)?.name || custom.wrap}`)
    if (custom.addOns?.length) lines.push(`Add-ons: ${custom.addOns.map(id => addOns.find(a => a.id === id)?.name || id).join(', ')}`)
    if (custom.photo) lines.push('Customer photo attached')
    if (custom.photos?.length) lines.push(`Album: ${custom.photos.length} photos${custom.albumTitle ? ` · “${custom.albumTitle}”` : ''}`)
    if (custom.albumQuotes) lines.push(`Quotes to paper-cut: “${custom.albumQuotes}”`)
    if (custom.boxItems?.length) {
        lines.push(`Box contents (${custom.boxItems.reduce((n, i) => n + i.quantity, 0)} items):`)
        for (const item of custom.boxItems) {
            lines.push(`  • ${item.name} (${item.size}) × ${item.quantity}`)
            for (const sub of describeCustomization(item.custom)) lines.push(`      ${sub}`)
        }
    }
    if (custom.surprise) lines.push('SURPRISE: call the sender, not the recipient')
    return lines
}
