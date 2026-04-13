import express from "express"
import { addCategory, listCategories, removeCategory, editCategory } from "../controller/categoryController.js"
import multer from "multer"

const categoryRouter = express.Router()

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
})
const upload = multer({ storage })

categoryRouter.post("/add", upload.single("image"), addCategory)
categoryRouter.get("/list", listCategories)
categoryRouter.post("/remove", removeCategory)
categoryRouter.post("/edit", upload.single("image"), editCategory)

export default categoryRouter
