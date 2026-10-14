import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    // personalisation details for cart lines, keyed by line id
    cartCustoms: { type: Object, default: {} },
    // saved gifts (product ids, newest first) and an optional public share link
    wishlist: { type: [String], default: [] },
    wishlistShared: { type: Boolean, default: false },
    wishlistShareId: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Number }
}, { minimize: false })

userSchema.index({ wishlistShareId: 1 }, { sparse: true })
userSchema.index({ wishlist: 1 })

const userModel = mongoose.models.user || mongoose.model('user',userSchema)

export default userModel
