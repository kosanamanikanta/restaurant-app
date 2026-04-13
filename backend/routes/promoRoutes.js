import express from "express"
import { addPromo, listPromos, listUserPromos, removePromo, applyPromo } from "../controller/promoController.js"
import authMiddleware from "../middleware/auth.js"

const promoRouter = express.Router()

promoRouter.post("/add", addPromo)
promoRouter.get("/list", listPromos)
promoRouter.post("/user-promos", (req, res, next) => {
    const { token } = req.headers
    if (!token) return next()
    import('../middleware/auth.js').then(m => m.default(req, res, next))
}, listUserPromos)
promoRouter.post("/remove", removePromo)
promoRouter.post("/apply", authMiddleware, applyPromo)

export default promoRouter
