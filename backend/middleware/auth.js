import jwt from "jsonwebtoken"

const authMiddleware = async (req, res, next) => {
    const { token } = req.headers
    if (!token) return res.json({ success: false, message: "Not Authorized" })
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.body.userId = decoded.id
        next()
    } catch (error) {
        res.json({ success: false, message: "Invalid Token" })
    }
}

export default authMiddleware
