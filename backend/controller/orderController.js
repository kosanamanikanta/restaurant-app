import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import { io } from "../server.js"
import Razorpay from "razorpay"
import promoModel from "../models/promoModel.js"
import settingsModel from "../models/settingsModel.js"
import { sendNotification } from "../services/notificationService.js"
import { sendOrderConfirmationToCustomer, sendNewOrderAlertToAdmin } from "../services/emailService.js"
import { sendWhatsAppToCustomer, sendWhatsAppToAdmin, sendOrderStatusWhatsApp } from "../services/whatsappService.js"

const getRazorpay = async () => {
    const settings = await settingsModel.findOne({})
    const keyId = settings?.razorpayKeyId || process.env.RAZORPAY_KEY_ID
    const keySecret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) throw new Error('Razorpay credentials not configured.')
    return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

const placeOrder = async (req, res) => {
    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            paymentMethod: req.body.paymentMethod || 'cod'
        })
        await newOrder.save()
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} })

        // save address
        const user = await userModel.findById(req.body.userId)
        if (user) {
            const addresses = user.savedAddresses || []
            const exists = addresses.find(a => a.street === req.body.address.street && a.phone === req.body.address.phone)
            if (!exists) {
                addresses.unshift(req.body.address)
                if (addresses.length > 5) addresses.pop()
                await userModel.findByIdAndUpdate(req.body.userId, { savedAddresses: addresses })
            }
        }

        if (req.body.promoCode) {
            await userModel.findByIdAndUpdate(req.body.userId, {
                $push: { usedPromos: req.body.promoCode.toUpperCase().trim() }
            })
        }

        if (req.body.paymentMethod === 'cod') {
            await orderModel.findByIdAndUpdate(newOrder._id, { payment: true })
            const user = await userModel.findById(req.body.userId)
            sendOrderConfirmationToCustomer(newOrder, user?.email)
            sendNewOrderAlertToAdmin(newOrder)
            sendWhatsAppToCustomer(newOrder, user?.phone)
            sendWhatsAppToAdmin(newOrder)
            sendNotification({ 
                type: 'new_order', 
                title: '🛒 New Order!',
                message: `₹${req.body.amount} — ${req.body.items.map(i => i.name).join(', ')}`,
                time: Date.now(),
                orderId: String(newOrder._id)
            })
            res.json({ success: true, orderId: newOrder._id, amount: req.body.amount })
        } else {
            const razorpay = await getRazorpay()
            const razorpayOrder = await razorpay.orders.create({
                amount: req.body.amount * 100,
                currency: "INR",
                receipt: String(newOrder._id)
            })
            res.json({ success: true, orderId: newOrder._id, razorpayOrderId: razorpayOrder.id, amount: req.body.amount })
        }
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const listOrders = async (req, res) => {
    try {
        const { deliveryBoyName } = req.query
        const query = {}
        if (deliveryBoyName) {
            query.$or = [{ assignedTo: '' }, { assignedTo: deliveryBoyName }]
        }
        const orders = await orderModel.find(query)
        res.json({ success: true, data: orders })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const archivedOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ archived: true }).sort({ deliveredAt: -1 })
        res.json({ success: true, data: orders })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const updateStatus = async (req, res) => {
    try {
        const update = { status: req.body.status }
        if (req.body.status === 'Delivered') {
            update.deliveredAt = new Date()
            update.archived = true
        }
        await orderModel.findByIdAndUpdate(req.body.orderId, update)
        const updatedOrder = await orderModel.findById(req.body.orderId)
        const orderUser = await userModel.findById(updatedOrder?.userId)
        sendOrderStatusWhatsApp(updatedOrder, orderUser?.phone, req.body.status)
        // notify delivery pool when order is ready for pickup
        if (req.body.status === 'Ready for Pickup' || req.body.status === 'Out for Delivery') {
            io.to('delivery-pool').emit('new-order-available')
        }
        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body
    try {
        if (success) {
            const order = await orderModel.findById(orderId)
            // only send notification for online payments (COD already notified in placeOrder)
            const wasUnpaid = order && !order.payment
            await orderModel.findByIdAndUpdate(orderId, { payment: true })
            if (wasUnpaid) {
                const order2 = await orderModel.findById(orderId)
                const user = await userModel.findById(order2?.userId)
                sendOrderConfirmationToCustomer(order2, user?.email)
                sendNewOrderAlertToAdmin(order2)
                sendWhatsAppToCustomer(order2, user?.phone)
                sendWhatsAppToAdmin(order2)
                sendNotification({
                    type: 'new_order',
                    title: '🛒 New Order!',
                    message: `₹${order.amount} — ${order.items.map(i => i.name).join(', ')}`,
                    time: Date.now(),
                    orderId: String(orderId)
                })
            }
            res.json({ success: true, message: "Payment Successful" })
        } else {
            await orderModel.findByIdAndUpdate(orderId, { payment: false })
            res.json({ success: false, message: "Payment Failed" })
        }
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId })
        res.json({ success: true, data: orders })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const cancelOrder = async (req, res) => {
    try {
        const order = await orderModel.findById(req.body.orderId)
        if (!order) return res.json({ success: false, message: "Order not found" })
        if (order.status !== "Food Processing") return res.json({ success: false, message: "Order cannot be cancelled" })
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: "Cancelled" })
        res.json({ success: true, message: "Order Cancelled" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const rateOrder = async (req, res) => {
    try {
        const { orderId, rating, review } = req.body
        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: "Order not found" })
        if (String(order.userId) !== String(req.body.userId)) return res.json({ success: false, message: "Unauthorized" })
        await orderModel.findByIdAndUpdate(orderId, { rating: Number(rating), review: review || '' })
        res.json({ success: true, message: "Rating submitted" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const assignOrder = async (req, res) => {
    try {
        const { orderId, deliveryBoyName } = req.body
        const order = await orderModel.findById(orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })
        if (order.assignedTo && order.assignedTo !== deliveryBoyName)
            return res.json({ success: false, message: 'Order already taken' })
        await orderModel.findByIdAndUpdate(orderId, { assignedTo: deliveryBoyName })
        res.json({ success: true })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const unassignOrder = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { assignedTo: '' })
        res.json({ success: true })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const updateDeliveryLocation = async (req, res) => {
    try {
        const { orderId, lat, lng, deliveryBoyName } = req.body
        await orderModel.findByIdAndUpdate(orderId, { deliveryBoyLat: lat, deliveryBoyLng: lng, deliveryBoyName: deliveryBoyName || '' })
        io.to(`order-${orderId}`).emit('location-update', { lat, lng, deliveryBoyName: deliveryBoyName || '' })
        res.json({ success: true })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const retryPayment = async (req, res) => {
    try {
        const order = await orderModel.findById(req.body.orderId)
        if (!order) return res.json({ success: false, message: 'Order not found' })
        if (order.payment) return res.json({ success: false, message: 'Already paid' })
        const razorpay = await getRazorpay()
        const razorpayOrder = await razorpay.orders.create({
            amount: order.amount * 100,
            currency: 'INR',
            receipt: String(order._id)
        })
        res.json({ success: true, razorpayOrderId: razorpayOrder.id, amount: order.amount })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const clearOrders = async (req, res) => {
    try {
        await orderModel.deleteMany({})
        res.json({ success: true, message: "All orders cleared" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const confirmDelivery = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { deliveryConfirmed: true })
        io.emit('order-status-changed', { orderId: req.body.orderId })
        res.json({ success: true })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const confirmReceived = async (req, res) => {
    try {
        const orderId = req.body.orderId
        await orderModel.findByIdAndUpdate(orderId, {
            customerConfirmed: true,
            status: 'Delivered',
            deliveredAt: new Date(),
            archived: true
        })
        io.to(`order-${orderId}`).emit('order-delivered', orderId)
        io.emit('order-status-changed', { orderId, status: 'Delivered' })
        res.json({ success: true })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export { placeOrder, verifyOrder, userOrders, cancelOrder, rateOrder, clearOrders, listOrders, archivedOrders, updateStatus, retryPayment, updateDeliveryLocation, assignOrder, unassignOrder, confirmDelivery, confirmReceived }
