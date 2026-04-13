import adminModel from "../models/adminModel.js"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import foodModel from "../models/foodModel.js"
import categoryModel from "../models/categoryModel.js"
import promoModel from "../models/promoModel.js"
import contactModel from "../models/contactModel.js"
import { io } from "../server.js"

const sendOtp = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    })
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Admin Panel - Password Reset OTP',
        html: `<p>Your OTP to reset admin password: <b style="font-size:22px;color:tomato">${otp}</b></p><p>Valid for 10 minutes.</p>`
    })
}

const loginAdmin = async (req, res) => {
    const { username, password } = req.body
    try {
        let admin = await adminModel.findOne({})
        if (!admin) admin = await adminModel.create({})
        if (username !== admin.username || password !== admin.password) {
            return res.json({ success: false, message: "Invalid credentials" })
        }
        const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' })
        res.json({ success: true, token, admin: { name: admin.name, email: admin.email, phone: admin.phone, role: admin.role, username: admin.username } })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const forgotAdminPassword = async (req, res) => {
    try {
        const admin = await adminModel.findOne({})
        if (!admin || !admin.email) return res.json({ success: false, message: "No admin email set. Update your profile first." })
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiry = new Date(Date.now() + 10 * 60 * 1000)
        await adminModel.findByIdAndUpdate(admin._id, { resetOtp: otp, resetOtpExpiry: expiry })
        await sendOtp(admin.email, otp)
        res.json({ success: true, message: `OTP sent to ${admin.email}` })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const resetAdminPassword = async (req, res) => {
    const { otp, newPassword } = req.body
    try {
        const admin = await adminModel.findOne({})
        if (!admin) return res.json({ success: false, message: "Admin not found" })
        if (admin.resetOtp !== otp) return res.json({ success: false, message: "Invalid OTP" })
        if (new Date() > admin.resetOtpExpiry) return res.json({ success: false, message: "OTP expired" })
        if (newPassword.length < 6) return res.json({ success: false, message: "Password too short (min 6)" })
        await adminModel.findByIdAndUpdate(admin._id, { password: newPassword, resetOtp: null, resetOtpExpiry: null })
        res.json({ success: true, message: "Password reset successful" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const getAdmin = async (req, res) => {
    try {
        let admin = await adminModel.findOne({})
        if (!admin) admin = await adminModel.create({})
        res.json({ success: true, data: admin })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const updateAdmin = async (req, res) => {
    try {
        let admin = await adminModel.findOne({})
        if (!admin) await adminModel.create(req.body)
        else await adminModel.findByIdAndUpdate(admin._id, req.body)
        res.json({ success: true, message: "Admin Updated" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const fullReset = async (req, res) => {
    try {
        await Promise.all([
            orderModel.deleteMany({}),
            foodModel.deleteMany({}),
            categoryModel.deleteMany({}),
            promoModel.deleteMany({}),
            contactModel.deleteMany({}),
        ])
        io.emit('orders-cleared')
        res.json({ success: true, message: "All data cleared successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export { loginAdmin, forgotAdminPassword, resetAdminPassword, getAdmin, updateAdmin, fullReset }
