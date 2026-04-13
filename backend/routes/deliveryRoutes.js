import express from "express"
import { registerDeliveryBoy, loginDeliveryBoy, getAvailableOrders, getMyOrder, acceptOrder, completeDelivery, listDeliveryBoys, removeDeliveryBoy } from "../controller/deliveryController.js"
import jwt from "jsonwebtoken"

const deliveryRouter = express.Router()

// delivery boy auth middleware
const deliveryAuth = (req, res, next) => {
    const { token } = req.headers
    if (!token) return res.json({ success: false, message: "Not authorized" })
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.body.deliveryBoyId = decoded.id
        next()
    } catch {
        res.json({ success: false, message: "Invalid token" })
    }
}

deliveryRouter.post("/login", loginDeliveryBoy)
deliveryRouter.post("/available-orders", deliveryAuth, getAvailableOrders)
deliveryRouter.post("/my-order", deliveryAuth, getMyOrder)
deliveryRouter.post("/accept", deliveryAuth, acceptOrder)
deliveryRouter.post("/complete", deliveryAuth, completeDelivery)

// admin routes
deliveryRouter.post("/register", registerDeliveryBoy)
deliveryRouter.get("/list", listDeliveryBoys)
deliveryRouter.post("/remove", removeDeliveryBoy)

export default deliveryRouter
