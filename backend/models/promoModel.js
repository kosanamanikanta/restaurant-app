import mongoose from "mongoose"

const promoSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true },
    type: { type: String, enum: ['percent', 'flat'], default: 'percent' }
})

const promoModel = mongoose.models.promo || mongoose.model("promo", promoSchema)
export default promoModel
