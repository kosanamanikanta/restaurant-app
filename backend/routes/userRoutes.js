import express from "express"
import { loginUser, registerUser, forgotPassword, resetPassword, getProfile, updateProfile, saveAddress } from "../controller/userController.js"
import authMiddleware from "../middleware/auth.js"

const userRouter = express.Router()

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.post("/forgot-password", forgotPassword)
userRouter.post("/reset-password", resetPassword)
userRouter.post("/profile", authMiddleware, getProfile)
userRouter.post("/update-profile", authMiddleware, updateProfile)
userRouter.post("/save-address", authMiddleware, saveAddress)

export default userRouter
