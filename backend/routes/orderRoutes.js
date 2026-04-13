import express from "express"
import { placeOrder, verifyOrder, userOrders, cancelOrder, rateOrder, clearOrders, listOrders, archivedOrders, updateStatus, retryPayment, updateDeliveryLocation, assignOrder, unassignOrder, confirmDelivery, confirmReceived } from "../controller/orderController.js"
import authMiddleware from "../middleware/auth.js"

const orderRouter = express.Router()

orderRouter.post("/place", authMiddleware, placeOrder)
orderRouter.post("/verify", verifyOrder)
orderRouter.post("/userorders", authMiddleware, userOrders)
orderRouter.post("/cancel", authMiddleware, cancelOrder)
orderRouter.post("/rate", authMiddleware, rateOrder)
orderRouter.delete("/clear", clearOrders)
orderRouter.get("/list", listOrders)
orderRouter.get("/archived", archivedOrders)
orderRouter.post("/retry-payment", authMiddleware, retryPayment)
orderRouter.post("/assign", assignOrder)
orderRouter.post("/unassign", unassignOrder)
orderRouter.post("/update-location", updateDeliveryLocation)
orderRouter.post("/status", updateStatus)
orderRouter.post("/confirm-delivery", confirmDelivery)
orderRouter.post("/confirm-received", authMiddleware, confirmReceived)

export default orderRouter
