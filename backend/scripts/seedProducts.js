// Seeds the store with a starter catalogue.
//   npm run seed              upload images to Cloudinary and insert products
//   npm run seed -- --preview write the illustration images to scripts/preview/ only
//   npm run seed -- --photos  switch existing seeded products to the real photos
// New products use the real photos from productPhotos.js; illustrations are the fallback.
// Products that already exist (same name) are skipped, so it is safe to re-run.
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import { v2 as cloudinary } from 'cloudinary'
import productModel from '../models/productModel.js'
import { drawProduct } from './productArt.js'
import { photosFor } from './productPhotos.js'
import { extraProducts } from './catalogExtra.js'
import { lifestyleProducts, recipientsByName } from './catalogLifestyle.js'
import { accessoryProducts } from './catalogAccessories.js'
import { kitchenProducts } from './catalogKitchen.js'
import { fashionProducts } from './catalogFashion.js'
import { styleProducts } from './catalogStyle.js'

const berry = '#A3214F', berryDark = '#7E1A3D', gold = '#C9973B', blush = '#F3D9DE', cream = '#F5E6CC', lilac = '#E8E0EE', sage = '#E2ECE3', ink = '#2B1B24'

// Frames take the customer's photo
const photoGift = { name: true, message: true, ribbon: true, wrap: true, addOns: true, photo: true }

const products = [
    // ---- Chocolate buckets
    {
        name: 'Kit Kat Cameo', category: 'ChocolateBucket', subCategory: 'BirthdayGift', price: 7500, sizes: ['S', 'M', 'L'], bestseller: true,
        description: 'A cheerful bucket packed with Kit Kat bars, finished with a satin bow and a hand-lettered gift tag. The go-to birthday surprise for chocolate lovers.',
        art: { kind: 'bucket', bg: cream, primary: berry, secondary: berryDark, ribbon: gold, choc1: '#D7262E', choc2: '#B81F27', accent: berry },
    },
    {
        name: 'Ferrero Gold Bucket', category: 'ChocolateBucket', subCategory: 'AnniversaryGift', price: 13500, sizes: ['S', 'M', 'L'], bestseller: true,
        description: 'Golden Ferrero Rocher pralines arranged in a keepsake bucket — an elegant way to say happy anniversary.',
        art: { kind: 'bucket', bg: '#F4E9D8', primary: ink, secondary: '#4A3340', ribbon: gold, choc1: gold, balls: true },
    },
    {
        name: 'Dairy Milk Delight', category: 'ChocolateBucket', subCategory: 'SurpriseGift', price: 6600, sizes: ['S', 'M', 'L'],
        description: 'Classic Cadbury Dairy Milk bars in a pastel bucket. Small, sweet and perfect for a just-because surprise.',
        art: { kind: 'bucket', bg: lilac, primary: '#5B3A8C', secondary: '#45296E', ribbon: gold, choc1: '#5B2C83', choc2: '#4A2370' },
    },
    {
        name: 'Valentine Hearts Bucket', category: 'ChocolateBucket', subCategory: 'ValentineGift', price: 10500, sizes: ['S', 'M', 'L'],
        description: 'Chocolate bars and heart-shaped treats tucked into a red bucket, with a satin bow and room for your love note.',
        art: { kind: 'bucket', bg: blush, primary: '#C2185B', secondary: berryDark, ribbon: '#FFFFFF', choc1: '#7A3E1D', choc2: '#5C2D14', accent: '#E0457B', hearts: true },
    },

    // ---- Bouquets
    {
        name: 'Blush Rose Bouquet', category: 'Bouquet', subCategory: 'AnniversaryGift', price: 12000, sizes: ['S', 'M', 'L'], bestseller: true,
        description: 'Soft blush roses wrapped in layered paper and tied with a ribbon. Timeless, romantic and made for anniversaries.',
        art: { kind: 'bouquet', bg: blush, primary: '#FFFFFF', secondary: '#F6DEE4', ribbon: berry, flower: '#F2A7BC', flower2: '#E98AA6', center: '#D9667F', leaf: '#6E9B6F' },
    },
    {
        name: 'Red Velvet Roses', category: 'Bouquet', subCategory: 'ValentineGift', price: 16500, sizes: ['S', 'M', 'L'],
        description: 'Deep red roses in a dark wrap with gold ribbon — the classic Valentine’s statement.',
        art: { kind: 'bouquet', bg: '#F6E3E6', primary: ink, secondary: '#4A3340', ribbon: gold, flower: '#C21F3A', flower2: '#A3182F', center: '#7E1226', leaf: '#4F7A52' },
    },
    {
        name: 'Sunshine Birthday Bouquet', category: 'Bouquet', subCategory: 'BirthdayGift', price: 9600, sizes: ['S', 'M', 'L'],
        description: 'Bright yellow and peach blooms that look like a birthday party in a bouquet.',
        art: { kind: 'bouquet', bg: cream, primary: '#FFFFFF', secondary: '#F8E7C9', ribbon: '#E07A2E', flower: '#F5C342', flower2: '#F3A26B', center: '#C9822B', leaf: '#6E9B6F' },
    },
    {
        name: 'Rose & Chocolate Duo', category: 'Bouquet', subCategory: 'SurpriseGift', price: 14400, sizes: ['M', 'L'], bestseller: true,
        description: 'Pink roses paired with golden pralines in one wrap — flowers and chocolate, no need to choose.',
        art: { kind: 'bouquet', bg: '#F9EDEF', primary: berry, secondary: berryDark, ribbon: gold, flower: '#F2A7BC', flower2: '#FFFFFF', center: '#D9667F', leaf: '#6E9B6F', chocolates: true },
    },

    // ---- Gift hampers
    {
        name: 'Celebration Hamper', category: 'GiftHamper', subCategory: 'BirthdayGift', price: 19500, sizes: ['M', 'L'], bestseller: true,
        description: 'A woven basket filled with sparkling juice, chocolates and sweet treats, wrapped with a bow. Made for big birthdays.',
        art: { kind: 'hamper', bg: cream, primary: '#B9844A', secondary: '#8E6334', ribbon: berry, bottle: '#2E5E4E', box: berry, accent: '#F2A7BC' },
    },
    {
        name: 'Thank You Treat Hamper', category: 'GiftHamper', subCategory: 'ThankYouGift', price: 11400, sizes: ['S', 'M'],
        description: 'Cookies, chocolates and a little bottle of something nice — a warm way to say thank you.',
        art: { kind: 'hamper', bg: sage, primary: '#C49A63', secondary: '#9A7341', ribbon: '#2F6B4F', bottle: '#7E1A3D', box: '#2F6B4F', accent: gold },
    },
    {
        name: 'Wedding Wishes Hamper', category: 'GiftHamper', subCategory: 'WeddingGift', price: 25500, sizes: ['M', 'L'],
        description: 'An ivory-and-gold hamper with fine chocolates, sparkling juice and fresh blooms for the happy couple.',
        art: { kind: 'hamper', bg: '#F7F1EA', primary: '#D8C3A5', secondary: '#B39B78', ribbon: gold, bottle: ink, box: '#FFFFFF', accent: '#F2A7BC', flowers: true },
    },

    // ---- Teddy & plush
    {
        name: 'Cuddle Bear with Heart', category: 'Teddy', subCategory: 'ValentineGift', price: 8400, sizes: ['S', 'M', 'L'],
        description: 'A soft, huggable teddy holding a velvet heart. Pair it with chocolates for the sweetest Valentine’s gift.',
        art: { kind: 'teddy', bg: blush, fur: '#B07A55', light: '#E3C2A4', heart: '#C2185B' },
    },
    {
        name: 'Birthday Teddy & Balloon', category: 'Teddy', subCategory: 'BirthdayGift', price: 9000, sizes: ['S', 'M'],
        description: 'A cheerful teddy with a bow and a balloon — an instant birthday smile.',
        art: { kind: 'teddy', bg: cream, fur: '#C8A27A', light: '#F0DCC4', heart: berry, balloon: '#E0457B', bow: gold },
    },

    // ---- Love boxes
    {
        name: 'Anniversary Love Box', category: 'LoveFocil', subCategory: 'AnniversaryGift', price: 12600, sizes: ['M', 'L'],
        description: 'A keepsake box filled with chocolates, a mini bouquet and a love note — every year together deserves one.',
        art: { kind: 'box', bg: lilac, primary: '#5B3A8C', secondary: '#45296E', ribbon: gold, accent: '#E0457B' },
    },
    {
        name: 'Surprise Heart Box', category: 'LoveFocil', subCategory: 'SurpriseGift', price: 10800, sizes: ['S', 'M'], bestseller: true,
        description: 'Open the lid and hearts pop out — a box of treats and a personal message for an unforgettable surprise.',
        art: { kind: 'box', bg: blush, primary: berry, secondary: berryDark, ribbon: '#FFFFFF', accent: '#E0457B' },
    },

    // ---- Personalised
    {
        name: 'Forever Yours Photo Frame', category: 'Personalised', subCategory: 'AnniversaryGift', price: 9000, sizes: ['S', 'M'], customization: photoGift,
        description: 'A personalised frame with your favourite photo and names. Add the details in your gift note at checkout.',
        art: { kind: 'frame', bg: blush, primary: berryDark, photo: '#F6DEE4', accent: berry, text: ink },
    },
    {
        name: 'Mr & Mrs Keepsake Frame', category: 'Personalised', subCategory: 'WeddingGift', price: 10200, sizes: ['M'], customization: photoGift,
        description: 'An elegant keepsake frame for newlyweds, personalised with their names and wedding date.',
        art: { kind: 'frame', bg: '#F7F1EA', primary: gold, photo: '#FFFFFF', accent: gold, text: ink, rings: true },
    },
]

products.push(...extraProducts, ...lifestyleProducts, ...accessoryProducts, ...kitchenProducts, ...fashionProducts, ...styleProducts)

const unsplashUrl = (id) => `https://images.unsplash.com/photo-${id}?w=1000&h=1000&fit=crop&crop=entropy&q=80&auto=format`
const imagesFor = (p) => p.photos ? p.photos.map(unsplashUrl) : photosFor(p.name)

const preview = process.argv.includes('--preview')
const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

if (preview) {
    const dir = path.join(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), 'preview')
    fs.mkdirSync(dir, { recursive: true })
    for (const p of products.filter(p => p.art)) fs.writeFileSync(path.join(dir, slug(p.name) + '.svg'), drawProduct(p.art))
    console.log(`Wrote ${products.length} images to ${dir}`)
    process.exit(0)
}

if (!process.env.CLOUDINARY_NAME || !process.env.MONGODB_URI) {
    console.error('Set MONGODB_URI and the CLOUDINARY_* variables in backend/.env first')
    process.exit(1)
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
})

await mongoose.connect(`${process.env.MONGODB_URI.trim()}/gift-shop`)

if (process.argv.includes('--photos')) {
    for (const p of products) {
        const photos = imagesFor(p)
        if (!photos.length) continue
        const result = await productModel.updateOne({ name: p.name }, { image: photos })
        console.log(result.modifiedCount ? 'photos set:' : 'unchanged:', p.name)
    }
    await mongoose.disconnect()
    process.exit(0)
}

let added = 0
for (const [index, p] of products.entries()) {
    if (await productModel.exists({ name: p.name })) {
        console.log('skip (exists):', p.name)
        continue
    }
    let images = imagesFor(p)
    if (images.length === 0) {
    const svg = drawProduct(p.art)
    const upload = await cloudinary.uploader.upload('data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'), {
        folder: 'surprise-heaven/products',
        public_id: slug(p.name),
        overwrite: true,
        resource_type: 'image',
    })
    // Deliver as PNG so every browser and email client shows it
    images = [upload.secure_url.replace(/\.svg$/, '.png')]
    }

    const { art, photos, ...data } = p
    // Newest first in the store, so give the list order a date order
    await productModel.create({ ...data, bestseller: !!data.bestseller, image: images, date: Date.now() - index * 60000 })
    added++
    console.log('added:', p.name)
}

// Tag who each gift suits (only where not set yet, so admin edits are kept)
for (const [name, recipients] of Object.entries(recipientsByName)) {
    await productModel.updateOne({ name, $or: [{ recipients: { $exists: false } }, { recipients: { $size: 0 } }] }, { recipients })
}

console.log(`Done - ${added} product(s) added`)
await mongoose.disconnect()
