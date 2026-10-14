import { v2 as cloudinary } from 'cloudinary'
import brandModel from '../models/brandModel.js'
import productModel from '../models/productModel.js'

export const slugify = (name) => String(name || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const isColour = (value) => /^#[0-9a-f]{6}$/i.test(String(value || ''))

const uploadLogo = async (file) => {
    if (!file) return undefined
    const result = await cloudinary.uploader.upload(file.path, {
        folder: 'surprise-heaven/brands', resource_type: 'image',
        transformation: [{ width: 600, height: 600, crop: 'limit' }],
    })
    return result.secure_url
}

// All brands with how many products each has
const listBrands = async (req, res) => {
    try {
        const [brands, counts] = await Promise.all([
            brandModel.find({}).sort({ featured: -1, name: 1 }).lean(),
            productModel.aggregate([{ $match: { brand: { $nin: [null, ''] } } }, { $group: { _id: '$brand', count: { $sum: 1 } } }]),
        ])
        const countOf = Object.fromEntries(counts.map(c => [c._id, c.count]))
        res.json({ success: true, brands: brands.map(b => ({ ...b, productCount: countOf[b.slug] || 0 })) })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const addBrand = async (req, res) => {
    try {
        const { name, tagline, description, colour, featured } = req.body
        if (!name?.trim()) return res.json({ success: false, message: 'Please enter a brand name' })
        const slug = slugify(name)
        if (await brandModel.exists({ $or: [{ slug }, { name: name.trim() }] })) return res.json({ success: false, message: 'A brand with this name already exists' })

        await brandModel.create({
            name: name.trim(), slug,
            tagline: String(tagline || '').slice(0, 120),
            description: String(description || '').slice(0, 1000),
            colour: isColour(colour) ? colour : '#A3214F',
            featured: featured === 'true' || featured === true,
            logo: await uploadLogo(req.file) || '',
        })
        res.json({ success: true, message: 'Brand added' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// The slug stays the same on rename, so products keep their brand
const updateBrand = async (req, res) => {
    try {
        const { id, name, tagline, description, colour, featured, removeLogo } = req.body
        const brand = await brandModel.findById(id)
        if (!brand) return res.json({ success: false, message: 'Brand not found' })

        if (name?.trim() && name.trim() !== brand.name) {
            if (await brandModel.exists({ name: name.trim(), _id: { $ne: brand._id } })) return res.json({ success: false, message: 'A brand with this name already exists' })
            brand.name = name.trim()
        }
        if (tagline !== undefined) brand.tagline = String(tagline).slice(0, 120)
        if (description !== undefined) brand.description = String(description).slice(0, 1000)
        if (isColour(colour)) brand.colour = colour
        if (featured !== undefined) brand.featured = featured === 'true' || featured === true
        if (removeLogo === 'true') brand.logo = ''
        const logo = await uploadLogo(req.file)
        if (logo) brand.logo = logo

        await brand.save()
        res.json({ success: true, message: 'Brand updated' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Removing a brand keeps its products, they just have no brand
const removeBrand = async (req, res) => {
    try {
        const brand = await brandModel.findByIdAndDelete(req.body.id)
        if (!brand) return res.json({ success: false, message: 'Brand not found' })
        const { modifiedCount } = await productModel.updateMany({ brand: brand.slug }, { $set: { brand: '' } })
        res.json({ success: true, message: `Brand removed${modifiedCount ? ` (${modifiedCount} product${modifiedCount === 1 ? "" : "s"} now ${modifiedCount === 1 ? "has" : "have"} no brand)` : ''}` })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { listBrands, addBrand, updateBrand, removeBrand }
