import mongoose from "mongoose"

const contactSchema = new mongoose.Schema({
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" }
})

const contactModel = mongoose.models.contact || mongoose.model("contact", contactSchema)
export default contactModel
