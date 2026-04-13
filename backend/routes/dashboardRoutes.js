import express from "express"
import { getStats } from "../controller/dashboardController.js"

const dashboardRouter = express.Router()

dashboardRouter.get("/stats", getStats)

export default dashboardRouter
