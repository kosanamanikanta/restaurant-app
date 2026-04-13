import express from "express"
import { loginAdmin, forgotAdminPassword, resetAdminPassword, getAdmin, updateAdmin, fullReset } from "../controller/adminController.js"

const adminRouter = express.Router()

adminRouter.post("/login", loginAdmin)
adminRouter.post("/forgot-password", forgotAdminPassword)
adminRouter.post("/reset-password", resetAdminPassword)
adminRouter.get("/get", getAdmin)
adminRouter.post("/update", updateAdmin)
adminRouter.post("/full-reset", fullReset)

export default adminRouter
