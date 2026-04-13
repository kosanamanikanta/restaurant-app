import deliveryBoyModel from "../models/deliveryBoyModel.js"
import orderModel from "../models/orderModel.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

// Admin creates delivery boy accounts
const registerDeliveryBoy = async (req, res) => {
    try {
        const { name, phone, password } = req.body
        const exists = await deliveryBoyModel.findOne({ phone })
        if (exists) return res.json({ success: false, message: "Phone already registered" })
        const hashed = await bcrypt.hash(password, 10)
        const boy = new deliveryBoyModel({ name, phone, password: hashed })
        await boy.save()
        res.json({ success: true, message: "Delivery boy added" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const loginDeliveryBoy = async (req, res) => {
    try {
        const { username, password } = req.body
        const boy = await deliveryBoyModel.findOne({ username })
        if (!boy) return res.json({ success: false, message: "not_found" })
        if (!boy.approved) return res.json({ success: false, message: "pending" })
        const match = await bcrypt.compare(password, boy.password)
        if (!match) return res.json({ success: false, message: "Invalid password" })
        const token = jwt.sign({ id: boy._id, role: 'delivery' }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.json({ success: true, token, boy: { name: boy.name, username: boy.username, isAvailable: boy.isAvailable, currentOrderId: boy.currentOrderId } })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const getAvailableOrders = async (req, res) => {
    try {
        const boy = await deliveryBoyModel.findById(req.body.deliveryBoyId)
        // if boy has active order, only show that order
        if (boy?.currentOrderId) {
            const order = await orderModel.findById(boy.currentOrderId)
            return res.json({ success: true, data: order ? [order] : [], myOrderId: boy.currentOrderId })
        }
        // show only unassigned Out for Delivery orders
        const orders = await orderModel.find({
            status: 'Out for Delivery',
            payment: true,
            $or: [{ assignedTo: null }, { assignedTo: '' }]
        }).sort({ date: 1 })
        res.json({ success: true, data: orders, myOrderId: null })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const getMyOrder = async (req, res) => {
    try {
        const boy = await deliveryBoyModel.findById(req.body.deliveryBoyId)
        if (!boy || !boy.currentOrderId) return res.json({ success: true, data: null })
        const order = await orderModel.findById(boy.currentOrderId)
        res.json({ success: true, data: order })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const acceptOrder = async (req, res) => {
    try {
        const boy = await deliveryBoyModel.findById(req.body.deliveryBoyId)
        if (!boy) return res.json({ success: false, message: "Delivery boy not found" })
        if (!boy.isAvailable || boy.currentOrderId) return res.json({ success: false, message: "You already have an active order" })

        // atomic update — only succeeds if assignedTo is still null
        const updated = await orderModel.findOneAndUpdate(
            { _id: req.body.orderId, assignedTo: null, status: 'Out for Delivery' },
            { assignedTo: String(boy._id) },
            { new: true }
        )
        if (!updated) return res.json({ success: false, message: "Order already taken by another delivery partner" })

        await deliveryBoyModel.findByIdAndUpdate(boy._id, { isAvailable: false, currentOrderId: String(req.body.orderId) })
        res.json({ success: true, message: "Order accepted!" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const completeDelivery = async (req, res) => {
    try {
        const boy = await deliveryBoyModel.findById(req.body.deliveryBoyId)
        if (!boy) return res.json({ success: false, message: "Not found" })
        await orderModel.findByIdAndUpdate(boy.currentOrderId, {
            status: 'Delivered',
            deliveredAt: new Date(),
            archived: true
        })
        await deliveryBoyModel.findByIdAndUpdate(boy._id, { isAvailable: true, currentOrderId: null })
        res.json({ success: true, message: "Delivery completed!" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const listDeliveryBoys = async (req, res) => {
    try {
        const boys = await deliveryBoyModel.find({}).select('-password')
        res.json({ success: true, data: boys })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const removeDeliveryBoy = async (req, res) => {
    try {
        await deliveryBoyModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Removed" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export { registerDeliveryBoy, loginDeliveryBoy, getAvailableOrders, getMyOrder, acceptOrder, completeDelivery, listDeliveryBoys, removeDeliveryBoy }
