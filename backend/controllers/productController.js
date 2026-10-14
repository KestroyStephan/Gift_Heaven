import mongoose from "mongoose"
import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import brandModel from "../models/brandModel.js"
import stockMoveModel from "../models/stockMoveModel.js"
import { adjustStock } from "../utils/stock.js"
import { wrapOptions, ribbonColors, addOns, limits, defaultCustomization, printColours, cakeOptions, recipientOptions, boxStyles, boxLeadDays, albumLeadDays } from "../config/customization.js"

// Keep only the known on/off switches
const parseCustomization = (value) => {
    if (!value) return { ...defaultCustomization }
    const input = typeof value === 'string' ? JSON.parse(value) : value
    return Object.fromEntries(Object.keys(defaultCustomization).map(key => [key, !!input[key]]))
}

// { size: price } with only the product's sizes and valid numbers
const parseSizePrices = (value, sizes) => {
    if (!value) return undefined
    const input = typeof value === 'string' ? JSON.parse(value) : value
    const out = {}
    for (const size of sizes) {
        const n = Number(input[size])
        if (input[size] !== '' && input[size] !== undefined && Number.isFinite(n) && n >= 0) out[size] = n
    }
    return Object.keys(out).length ? out : undefined
}

// Only known recipient groups
const parseRecipients = (value) => {
    if (!value) return []
    const input = typeof value === 'string' ? JSON.parse(value) : value
    return [...new Set((Array.isArray(input) ? input : []).filter(r => recipientOptions.includes(r)))]
}

// A brand slug that exists, or '' for no brand
const parseBrand = async (value) => {
    const slug = String(value || '').trim()
    if (!slug) return ''
    if (!(await brandModel.exists({ slug }))) throw new Error('Unknown brand')
    return slug
}

// Inventory fields from the admin forms
const toCount = (value, fallback) => {
    const n = Math.floor(Number(value))
    return Number.isFinite(n) && n >= 0 ? n : fallback
}
const parseInventory = (body) => {
    const out = {}
    if (body.sku !== undefined) out.sku = String(body.sku).trim().slice(0, 40)
    if (body.trackStock !== undefined) out.trackStock = body.trackStock === 'true' || body.trackStock === true
    if (body.lowStock !== undefined) out.lowStock = toCount(body.lowStock, 5)
    if (body.costPrice !== undefined && body.costPrice !== '') {
        const cost = Number(body.costPrice)
        if (!Number.isFinite(cost) || cost < 0) throw new Error('Please enter a valid cost price')
        out.costPrice = cost
    }
    return out
}

// Customers and the public API never see our cost prices
const PUBLIC_FIELDS = '-costPrice'

// Personalisation options shown on the product page
const customizationOptions = (req, res) => {
    res.json({ success: true, options: { wrapOptions, ribbonColors, addOns, limits, defaultCustomization, printColours, cakeOptions, recipientOptions, boxStyles, boxLeadDays, albumLeadDays } })
}

// Customer photo for a personalised gift
const uploadCustomerPhoto = async (req, res) => {
    try {
        if (!req.file) return res.json({ success: false, message: 'Please choose a photo' })
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'surprise-heaven/customer-photos',
            resource_type: 'image',
            transformation: [{ width: 1600, height: 1600, crop: 'limit' }]
        })
        res.json({ success: true, url: result.secure_url })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// funtion Add product
const addProduct = async (req, res) => {

    try {
        const { name, description, price, category, subCategory, sizes, bestseller, customization, sizePrices, recipients, brand } = req.body

        req.files = req.files || {}
        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item != undefined)
        if (images.length === 0) {
            return res.json({ success: false, message: "Please upload at least one image" })
        }

        const imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
                return result.secure_url
            })
        )
        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: JSON.parse(sizes),
            customization: parseCustomization(customization),
            sizePrices: parseSizePrices(sizePrices, JSON.parse(sizes)),
            recipients: parseRecipients(recipients),
            brand: await parseBrand(brand),
            ...parseInventory(req.body),
            stock: toCount(req.body.stock, 0),
            image: imagesUrl,
            date: Date.now()
        }

        const product = new productModel(productData)
        await product.save()
        if (product.trackStock && product.stock > 0) {
            await stockMoveModel.create({ productId: String(product._id), productName: product.name, change: product.stock, stockAfter: product.stock, reason: 'initial', note: 'Opening stock' })
        }


        res.json({ success: true, message: "Product Added" })



    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }

}

// funtion list product
const listProduct = async (req, res) => {

    try {
        // Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Filters from frontend
        const {category,subCategory,sort} = req.query;
        let filter = {};

        if(category){
            filter.category = category;
        }

        if(subCategory){
            filter.subCategory = subCategory;
        }

        if(req.query.brand){
            filter.brand = String(req.query.brand);
        }

        if(req.query.recipient){
            filter.recipients = String(req.query.recipient);
        }

        // Sorting
        let sortOption = {date:-1};

        if(sort === "low-high"){
            sortOption = {
                price:1
            };
        }

        if(sort === "high-low"){
            sortOption = {
                price:-1
            };
        }

        // Get products
        const products = await productModel.find(filter).select(PUBLIC_FIELDS).sort(sortOption).skip(skip).limit(limit);

        // Count total products
        const totalProducts = await productModel.countDocuments(filter);

        res.json({ success:true, products,currentPage:page,totalPages:Math.ceil(totalProducts / limit),totalProducts});

    } catch(error){
        console.log(error);
        res.json({success:false,message:error.message});

    }
}

// funtion remove product
const removeProduct = async (req, res) => {

    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Product Removed" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }

}

// funtion update product (images are optional: only uploaded slots are replaced)
const updateProduct = async (req, res) => {
    try {
        const { id, name, description, price, category, subCategory, sizes, bestseller, customization, sizePrices, recipients, brand } = req.body

        const product = await productModel.findById(id)
        if (!product) return res.json({ success: false, message: "Product not found" })

        if (name) product.name = name
        if (description) product.description = description
        if (price !== undefined && price !== '') product.price = Number(price)
        if (category) product.category = category
        if (subCategory) product.subCategory = subCategory
        if (sizes) product.sizes = JSON.parse(sizes)
        if (customization) product.customization = parseCustomization(customization)
        if (sizePrices !== undefined) product.sizePrices = parseSizePrices(sizePrices, product.sizes)
        if (recipients !== undefined) product.recipients = parseRecipients(recipients)
        if (brand !== undefined) product.brand = await parseBrand(brand)
        Object.assign(product, parseInventory(req.body))
        if (bestseller !== undefined) product.bestseller = bestseller === "true" || bestseller === true

        const images = [...product.image]
        for (let i = 0; i < 4; i++) {
            const file = req.files?.[`image${i + 1}`]?.[0]
            if (file) {
                const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' })
                images[i] = result.secure_url
            }
        }
        product.image = images.filter(Boolean)

        await product.save()
        res.json({ success: true, message: "Product Updated" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// funtion singleProduct product
const singleProduct = async (req, res) => {
    try {
        
        const {productId} = req.body
        const product = await productModel.findById(productId).select(PUBLIC_FIELDS)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: every product with stock, cost and value, plus recent stock changes
const inventory = async (req, res) => {
    try {
        const [products, moves] = await Promise.all([
            productModel.find({}).select('name image category brand sku trackStock stock lowStock costPrice price sizePrices').sort({ name: 1 }).lean(),
            stockMoveModel.find({}).sort({ date: -1 }).limit(60).lean(),
        ])
        const tracked = products.filter(p => p.trackStock)
        const summary = {
            products: products.length,
            tracked: tracked.length,
            madeToOrder: products.length - tracked.length,
            units: tracked.reduce((s, p) => s + p.stock, 0),
            costValue: tracked.reduce((s, p) => s + p.stock * (p.costPrice || 0), 0),
            retailValue: tracked.reduce((s, p) => s + p.stock * p.price, 0),
            low: tracked.filter(p => p.stock > 0 && p.stock <= p.lowStock).length,
            out: tracked.filter(p => p.stock <= 0).length,
            missingCost: products.filter(p => !p.costPrice).length,
        }
        res.json({ success: true, products, moves, summary })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: receive stock, write off damaged units or correct the count; also edit SKU, alert level and cost
const updateStock = async (req, res) => {
    try {
        const product = await productModel.findById(req.body.id)
        if (!product) return res.json({ success: false, message: 'Product not found' })
        Object.assign(product, parseInventory(req.body))
        await product.save()
        if (req.body.mode && Number(req.body.quantity) > 0 || req.body.mode === 'set') await adjustStock(product, req.body)
        res.json({ success: true, message: 'Stock updated', product: { _id: product._id, stock: product.stock, trackStock: product.trackStock, lowStock: product.lowStock, costPrice: product.costPrice, sku: product.sku } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin: stock history of one product
const stockHistory = async (req, res) => {
    try {
        const moves = await stockMoveModel.find({ productId: String(req.body.id) }).sort({ date: -1 }).limit(100).lean()
        res.json({ success: true, moves })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export { inventory, updateStock, stockHistory, listProduct, addProduct, removeProduct, singleProduct, updateProduct, customizationOptions, uploadCustomerPhoto }