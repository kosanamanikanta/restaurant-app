import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            tls: true,
            tlsAllowInvalidCertificates: false
        })
        console.log("DB CONNECTED")
    } catch (error) {
        console.log("DB Connection Error:", error.message)
        process.exit(1)
    }
}