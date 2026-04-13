import express from "express"
import { getContact, updateContact } from "../controller/contactController.js"

const contactRouter = express.Router()

contactRouter.get("/get", getContact)
contactRouter.post("/update", updateContact)

export default contactRouter
