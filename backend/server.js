import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createServer } from "http"
import { Server } from "socket.io"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoutes.js"
import orderRouter from "./routes/orderRoutes.js"
import userRouter from "./routes/userRoutes.js"
import cartRouter from "./routes/cartRoutes.js"
import categoryRouter from "./routes/categoryRoutes.js"
import promoRouter from "./routes/promoRoutes.js"
import contactRouter from "./routes/contactRoutes.js"
import settingsRouter from "./routes/settingsRoutes.js"
import adminRouter from "./routes/adminRoutes.js"
import dashboardRouter from "./routes/dashboardRoutes.js"
import deliveryBoyRouter from "./routes/deliveryBoyRoutes.js"
import { sseHandler } from "./services/notificationService.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

dotenv.config()

const app = express()
const httpServer = createServer(app)
const port = process.env.PORT || 4000

export const io = new Server(httpServer, {
    cors: { origin: '*', credentials: false }
})

io.on('connection', (socket) => {
    socket.on('join-order', (orderId) => socket.join(`order-${orderId}`))
    socket.on('leave-order', (orderId) => socket.leave(`order-${orderId}`))
    socket.on('delivery-arrived', (orderId) => {
        io.to(`order-${orderId}`).emit('delivery-arrived', orderId)
    })
    // delivery boys listen on this room for new order alerts
    socket.on('join-delivery-pool', () => socket.join('delivery-pool'))
})

app.use(express.json())
app.use(cors())

connectDB()

app.use('/api/food', foodRouter)
app.use('/api/order', orderRouter)
app.use('/api/user', userRouter)
app.use('/api/cart', cartRouter)
app.use('/api/category', categoryRouter)
app.use('/api/promo', promoRouter)
app.use('/api/contact', contactRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/admin', adminRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/deliveryboy', deliveryBoyRouter)
app.use('/images', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    next()
}, express.static('uploads'))
app.use('/delivery', express.static(join(__dirname, 'delivery')))
app.get('/api/notifications/sse', sseHandler)

app.get("/", (req, res) => {
    res.send("API WORKING")
})

httpServer.listen(port, () => {
    console.log(`server Started on http://localhost:${port}`)
})
