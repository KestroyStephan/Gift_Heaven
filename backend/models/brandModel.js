import mongoose from 'mongoose'

// A brand (or one of our own house labels) that products belong to
const brandSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true },
    tagline: { type: String, default: '' },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    // accent colour for the brand's wordmark and page banner
    colour: { type: String, default: '#A3214F' },
    featured: { type: Boolean, default: false },
    date: { type: Number, default: Date.now },
})

const brandModel = mongoose.models.giftbrand || mongoose.model('giftbrand', brandSchema)

export default brandModel
