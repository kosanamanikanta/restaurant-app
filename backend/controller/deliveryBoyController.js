import deliveryBoyModel from "../models/deliveryBoyModel.js"
import orderModel from "../models/orderModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { io } from "../server.js"

const registerDeliveryBoy = async (req, res) => {
    try {
        const { name, phone, username, password } = req.body
        if (!name || !username || !password) return res.json({ success: false, message: "Name, username, password required" })
        const exists = await deliveryBoyModel.findOne({ username })
        if (exists) return res.json({ success: false, message: "Username already taken" })
        const hashed = await bcrypt.hash(password, 10)
        await deliveryBoyModel.create({ name, phone, username, password: hashed, approved: false })
        res.json({ success: true, message: "Registered! Wait for admin approval." })
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
}

const loginDeliveryBoy = async (req, res) => {
    try {
        const { username, password } = req.body
        const boy = await deliveryBoyModel.findOne({ username })
        if (!boy) return res.json({ success: false, message: "Invalid credentials" })
        const match = await bcrypt.compare(password, boy.password)
        if (!match) return res.json({ success: false, message: "Invalid credentials" })
        if (!boy.approved) return res.json({ success: false, message: "pending" })
        if (!boy.active) return res.json({ success: false, message: "Account disabled. Contact admin." })
        const token = jwt.sign({ id: boy._id, name: boy.name }, process.env.JWT_SECRET || "secret123", { expiresIn: "7d" })
        res.json({ success: true, token, name: boy.name, id: boy._id, currentOrderId: boy.currentOrderId })
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
}

const getAvailableOrders = async (req, res) => {
    try {
        const boyId = req.body.deliveryBoyId
        const boy = await deliveryBoyModel.findById(boyId)
        if (!boy) return res.json({ success: false, message: "Not found" })

        // if boy has active order — only show that order
        if (boy.currentOrderId) {
            const order = await orderModel.findById(boy.currentOrderId)
            return res.json({ success: true, data: order ? [order] : [], myOrderId: boy.currentOrderId })
        }

        // show only unassigned Ready for Pickup / Out for Delivery orders
        const orders = await orderModel.find({
            status: { $in: ['Ready for Pickup', 'Out for Delivery'] },
            $or: [{ assignedTo: null }, { assignedTo: '' }, { assignedTo: { $exists: false } }]
        }).sort({ date: 1 })
        res.json({ success: true, data: orders, myOrderId: null })
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
}

const acceptOrder = async (req, res) => {
    try {
        const boyId = req.body.deliveryBoyId
        const boy = await deliveryBoyModel.findById(boyId)
        if (!boy) return res.json({ success: false, message: "Not found" })
        if (!boy.isAvailable || boy.currentOrderId) return res.json({ success: false, message: "You already have an active order" })

        // atomic — only succeeds if assignedTo is still null or empty
        const updated = await orderModel.findOneAndUpdate(
            { _id: req.body.orderId, $or: [{ assignedTo: null }, { assignedTo: '' }], status: { $in: ['Ready for Pickup', 'Out for Delivery'] } },
            { assignedTo: String(boyId), status: 'Out for Delivery' },
            { new: true }
        )
        if (!updated) return res.json({ success: false, message: "Order already taken by another delivery partner" })

        await deliveryBoyModel.findByIdAndUpdate(boyId, {
            isAvailable: false,
            currentOrderId: String(req.body.orderId)
        })
        io.emit('order-status-changed', { orderId: req.body.orderId, status: 'Out for Delivery' })
        res.json({ success: true, message: "Order accepted!" })
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
}

const completeDelivery = async (req, res) => {
    try {
        const boyId = req.body.deliveryBoyId
        const boy = await deliveryBoyModel.findById(boyId)
        if (!boy || !boy.currentOrderId) return res.json({ success: false, message: "No active order" })
        const orderId = boy.currentOrderId
        await orderModel.findByIdAndUpdate(orderId, {
            status: 'Delivered',
            deliveredAt: new Date(),
            archived: true,
            deliveryConfirmed: true
        })
        await deliveryBoyModel.findByIdAndUpdate(boyId, { isAvailable: true, currentOrderId: null })
        io.to(`order-${orderId}`).emit('order-delivered', orderId)
        io.emit('order-status-changed', { orderId, status: 'Delivered' })
        res.json({ success: true, message: "Delivery completed!" })
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
}

const listDeliveryBoys = async (req, res) => {
    try {
        const boys = await deliveryBoyModel.find({}).select("-password").sort({ createdAt: -1 })
        res.json({ success: true, data: boys })
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
}

const approveDeliveryBoy = async (req, res) => {
    try {
        await deliveryBoyModel.findByIdAndUpdate(req.params.id, { approved: true, active: true })
        res.json({ success: true })
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
}

const deleteDeliveryBoy = async (req, res) => {
    try {
        await deliveryBoyModel.findByIdAndDelete(req.params.id)
        res.json({ success: true })
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
}

const toggleDeliveryBoy = async (req, res) => {
    try {
        const boy = await deliveryBoyModel.findById(req.params.id)
        if (!boy) return res.json({ success: false, message: "Not found" })
        await deliveryBoyModel.findByIdAndUpdate(req.params.id, { active: !boy.active })
        res.json({ success: true })
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
}

export { registerDeliveryBoy, loginDeliveryBoy, getAvailableOrders, acceptOrder, completeDelivery, listDeliveryBoys, approveDeliveryBoy, deleteDeliveryBoy, toggleDeliveryBoy }
