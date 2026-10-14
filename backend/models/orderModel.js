import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, required: true, default:'Order Placed' },
    statusHistory: { type: Array, default: [] },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true, default: false },
    stripeSessionId: { type: String },
    razorpayOrderId: { type: String },
    paymentId: { type: String },
    date :{type:Number, required:true}
})

//indexing the schema to improve performance
orderSchema.index({ userId: 1, date: -1 });
orderSchema.index({ status: 1, date: -1 });
orderSchema.index({ payment: 1, status: 1 });
orderSchema.index({ razorpayOrderId: 1 });

const orderModel = mongoose.models.order || mongoose.model('giftorder', orderSchema)

export default orderModel;
