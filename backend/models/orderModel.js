import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "Food Processing" },
    date: { type: Date, default: Date.now },
    deliveredAt: { type: Date, default: null },
    payment: { type: Boolean, default: false },
    paymentMethod: { type: String, default: 'cod' },
    archived: { type: Boolean, default: false },
    rating: { type: Number, default: null },
    review: { type: String, default: '' },
    assignedTo: { type: String, default: '' },
    deliveryBoyLat: { type: Number, default: null },
    deliveryBoyLng: { type: Number, default: null },
    deliveryBoyName: { type: String, default: '' },
    deliveryConfirmed: { type: Boolean, default: false },
    customerConfirmed: { type: Boolean, default: false }
})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema)
export default orderModel
