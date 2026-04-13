import userModel from "../models/userModel.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"
import nodemailer from "nodemailer"

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    })
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'TutaFoods - Password Reset OTP',
        html: `<p>Your OTP to reset password is: <b style="font-size:20px;color:tomato">${otp}</b></p><p>Valid for 10 minutes.</p>`
    })
}

const loginUser = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await userModel.findOne({ email })
        if (!user) return res.json({ success: false, message: "User Doesn't exist " })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.json({ success: false, message: "Invalid credentials" })

        const token = createToken(user._id)
        res.json({ success: true, token })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const registerUser = async (req, res) => {
    const { name, email, password } = req.body
    try {
        if (!validator.isEmail(email)) return res.json({ success: false, message: "Invalid email" })
        if (password.length < 8) return res.json({ success: false, message: "Password too short" })

        const exists = await userModel.findOne({ email })
        if (exists) return res.json({ success: false, message: "User already exists" })

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = new userModel({ name, email, password: hashedPassword })
        await user.save()

        const token = createToken(user._id)
        res.json({ success: true, token })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const forgotPassword = async (req, res) => {
    const { email } = req.body
    try {
        const user = await userModel.findOne({ email })
        if (!user) return res.json({ success: false, message: "Email not registered" })

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiry = new Date(Date.now() + 10 * 60 * 1000)

        await userModel.findByIdAndUpdate(user._id, { resetOtp: otp, resetOtpExpiry: expiry })
        await sendOtpEmail(email, otp)

        res.json({ success: true, message: "OTP sent to your email" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body
    try {
        const user = await userModel.findOne({ email })
        if (!user) return res.json({ success: false, message: "User not found" })
        if (user.resetOtp !== otp) return res.json({ success: false, message: "Invalid OTP" })
        if (new Date() > user.resetOtpExpiry) return res.json({ success: false, message: "OTP expired" })
        if (newPassword.length < 8) return res.json({ success: false, message: "Password too short" })

        const salt = await bcrypt.genSalt(10)
        const hashed = await bcrypt.hash(newPassword, salt)
        await userModel.findByIdAndUpdate(user._id, { password: hashed, resetOtp: null, resetOtpExpiry: null })

        res.json({ success: true, message: "Password reset successful" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const getProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId).select('-password -resetOtp -resetOtpExpiry')
        if (!user) return res.json({ success: false, message: "User not found" })
        res.json({ success: true, data: user })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body
        await userModel.findByIdAndUpdate(req.body.userId, { name, phone })
        res.json({ success: true, message: "Profile Updated" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const saveAddress = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId)
        const addresses = user.savedAddresses || []
        const exists = addresses.find(a => a.street === req.body.address.street && a.phone === req.body.address.phone)
        if (!exists) {
            addresses.unshift(req.body.address)
            if (addresses.length > 5) addresses.pop()
            await userModel.findByIdAndUpdate(req.body.userId, { savedAddresses: addresses })
        }
        res.json({ success: true })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export { loginUser, registerUser, forgotPassword, resetPassword, getProfile, updateProfile, saveAddress }
