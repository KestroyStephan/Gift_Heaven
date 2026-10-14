import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    // personalisation details for cart lines, keyed by line id
    cartCustoms: { type: Object, default: {} },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Number }
}, { minimize: false })

const userModel = mongoose.models.user || mongoose.model('user',userSchema)

export default userModel
