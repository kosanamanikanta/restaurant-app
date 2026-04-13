import express from "express"
import { registerDeliveryBoy, loginDeliveryBoy, getAvailableOrders, acceptOrder, completeDelivery, listDeliveryBoys, approveDeliveryBoy, deleteDeliveryBoy, toggleDeliveryBoy } from "../controller/deliveryBoyController.js"
import jwt from "jsonwebtoken"

const deliveryBoyRouter = express.Router()

// auth middleware
const deliveryAuth = (req, res, next) => {
    const { token } = req.headers
    if (!token) return res.json({ success: false, message: "Not authorized" })
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123")
        req.body.deliveryBoyId = decoded.id
        next()
    } catch {
        res.json({ success: false, message: "Invalid token" })
    }
}

// public
deliveryBoyRouter.post("/register", registerDeliveryBoy)
deliveryBoyRouter.post("/login", loginDeliveryBoy)

// delivery boy protected
deliveryBoyRouter.post("/available-orders", deliveryAuth, getAvailableOrders)
deliveryBoyRouter.post("/accept", deliveryAuth, acceptOrder)
deliveryBoyRouter.post("/complete", deliveryAuth, completeDelivery)

// admin
deliveryBoyRouter.get("/list", listDeliveryBoys)
deliveryBoyRouter.post("/approve/:id", approveDeliveryBoy)
deliveryBoyRouter.delete("/:id", deleteDeliveryBoy)
deliveryBoyRouter.post("/toggle/:id", toggleDeliveryBoy)

export default deliveryBoyRouter
