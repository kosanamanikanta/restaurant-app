import express from "express"
import { getSettings, getPaymentConfig, updateSettings } from "../controller/settingsController.js"
import multer from "multer"

const settingsRouter = express.Router()

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
})
const upload = multer({ storage })

settingsRouter.get("/get", getSettings)
settingsRouter.get("/payment-config", getPaymentConfig)
settingsRouter.post("/update", upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'heroImage', maxCount: 1 },
    { name: 'navbarImage', maxCount: 1 },
    { name: 'adminNavbarImage', maxCount: 1 },
    { name: 'adminProfileImage', maxCount: 1 },
    { name: 'userFavicon', maxCount: 1 },
    { name: 'adminFavicon', maxCount: 1 }
]), updateSettings)

export default settingsRouter
