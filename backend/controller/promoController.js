import promoModel from "../models/promoModel.js"
import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"

const addPromo = async (req, res) => {
    try {
        const exists = await promoModel.findOne({ code: req.body.code.toUpperCase() })
        if (exists) return res.json({ success: false, message: "Promo code already exists" })
        const promo = new promoModel({
            code: req.body.code.toUpperCase(),
            discount: req.body.discount,
            type: req.body.type || 'percent'
        })
        await promo.save()
        res.json({ success: true, message: "Promo Added" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const listPromos = async (req, res) => {
    try {
        const promos = await promoModel.find({})
        res.json({ success: true, data: promos })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const listUserPromos = async (req, res) => {
    try {
        const allPromos = await promoModel.find({})
        if (!req.body.userId) return res.json({ success: true, data: allPromos, eligible: true })
        const user = await userModel.findById(req.body.userId)
        const usedPromos = user?.usedPromos || []
        if (usedPromos.length >= 3) return res.json({ success: true, data: [], eligible: false })
        const available = allPromos.filter(p => !usedPromos.map(u => u.trim()).includes(p.code.trim()))
        res.json({ success: true, data: available, eligible: available.length > 0 })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const removePromo = async (req, res) => {
    try {
        await promoModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Promo Removed" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const applyPromo = async (req, res) => {
    try {
        const promo = await promoModel.findOne({ code: req.body.code.toUpperCase() })
        if (!promo) return res.json({ success: false, message: "Invalid promo code" })
        if (req.body.userId) {
            const user = await userModel.findById(req.body.userId)
            const usedPromos = user?.usedPromos || []
            if (usedPromos.length >= 3) return res.json({ success: false, message: "You have used maximum promo codes" })
            if (usedPromos.map(u => u.trim()).includes(promo.code.trim())) return res.json({ success: false, message: "Already used this promo code" })
        }
        res.json({ success: true, discount: promo.discount, type: promo.type })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export { addPromo, listPromos, listUserPromos, removePromo, applyPromo }
