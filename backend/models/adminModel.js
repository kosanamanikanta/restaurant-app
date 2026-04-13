import mongoose from "mongoose"

const adminSchema = new mongoose.Schema({
    name: { type: String, default: "Admin" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    role: { type: String, default: "Administrator" },
    username: { type: String, default: "admin" },
    password: { type: String, default: "admin123" },
    resetOtp: { type: String, default: null },
    resetOtpExpiry: { type: Date, default: null }
})

const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema)
export default adminModel
