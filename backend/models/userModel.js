import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    phone: { type: String, default: '' },
    savedAddresses: { type: Array, default: [] },
    resetOtp: { type: String, default: null },
    resetOtpExpiry: { type: Date, default: null },
    usedPromos: { type: [String], default: [] }
}, { minimize: false })

const userModel = mongoose.models.user || mongoose.model("user", userSchema)
export default userModel
