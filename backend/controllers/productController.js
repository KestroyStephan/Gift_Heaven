import mongoose from "mongoose"
import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"
import brandModel from "../models/brandModel.js"
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
            image: imagesUrl,
            date: Date.now()
        }

        const product = new productModel(productData)
        await product.save()


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
        const products = await productModel.find(filter).sort(sortOption).skip(skip).limit(limit);

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
        const product = await productModel.findById(productId)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { listProduct, addProduct, removeProduct, singleProduct, updateProduct, customizationOptions, uploadCustomerPhoto }