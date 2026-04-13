import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"

const authMiddleware = async (req, res, next) => {
    const { token } = req.headers
    if (!token) return res.json({ success: false, message: "Not Authorized" })
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // user DB లో exist అవుతుందా check చేయి
        const user = await userModel.findById(decoded.id)
        if (!user) return res.json({ success: false, message: "Not Authorized" })
        req.body.userId = decoded.id
        next()
    } catch (error) {
        res.json({ success: false, message: "Invalid Token" })
    }
}

export default authMiddleware
