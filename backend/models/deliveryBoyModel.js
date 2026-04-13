import mongoose from "mongoose"

const deliveryBoySchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, default: '' },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    approved: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    currentOrderId: { type: String, default: null }
}, { timestamps: true })

const deliveryBoyModel = mongoose.models.deliveryboy || mongoose.model("deliveryboy", deliveryBoySchema)
export default deliveryBoyModel
