import express from "express"
import { addFood, listFood, removeFood, editFood } from "../controller/foodController.js"
import multer from "multer"

const foodRouter = express.Router()

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
})

const upload = multer({ storage })

foodRouter.post("/add", upload.single("image"), addFood)
foodRouter.get("/list", listFood)
foodRouter.post("/remove", removeFood)
foodRouter.post("/edit", upload.single("image"), editFood)

export default foodRouter
