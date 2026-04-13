import nodemailer from "nodemailer"
import settingsModel from "../models/settingsModel.js"

const getTransporter = async (settings) => {
    const emailUser = settings?.emailUser || process.env.EMAIL_USER
    const emailPass = settings?.emailPass || process.env.EMAIL_PASS
    if (!emailUser || !emailPass) return null
    return nodemailer.createTransport({
        service: "gmail",
        auth: { user: emailUser, pass: emailPass }
    })
}

export const sendOrderConfirmationToCustomer = async (order, userEmail) => {
    try {
        const settings = await settingsModel.findOne({})
        if (!settings?.emailNotificationsEnabled) return
        const transporter = await getTransporter(settings)
        if (!transporter || !userEmail) return
        const restaurantName = settings?.restaurantName || "TutaFoods"
        const emailUser = settings?.emailUser || process.env.EMAIL_USER
        const itemsList = order.items.map(i => `<li>${i.name} x${i.quantity} — ₹${i.price * i.quantity}</li>`).join('')
        await transporter.sendMail({
            from: `"${restaurantName}" <${emailUser}>`,
            to: userEmail,
            subject: `✅ Order Confirmed — ${restaurantName}`,
            html: `
                <h2>Thank you for your order! 🎉</h2>
                <p><b>Order ID:</b> ${order._id}</p>
                <p><b>Items:</b></p>
                <ul>${itemsList}</ul>
                <p><b>Total:</b> ₹${order.amount}</p>
                <p><b>Payment:</b> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</p>
                <p>We will deliver your order in ${settings?.deliveryTime || '30-45 minutes'}.</p>
                <br/><p>— ${restaurantName} Team</p>
            `
        })
    } catch (error) {}
}

export const sendNewOrderAlertToAdmin = async (order) => {
    try {
        const settings = await settingsModel.findOne({})
        if (!settings?.adminEmailNotificationsEnabled) return
        const transporter = await getTransporter(settings)
        if (!transporter) return
        const restaurantName = settings?.restaurantName || "TutaFoods"
        const emailUser = settings?.emailUser || process.env.EMAIL_USER
        const itemsList = order.items.map(i => `<li>${i.name} x${i.quantity}</li>`).join('')
        await transporter.sendMail({
            from: `"${restaurantName}" <${emailUser}>`,
            to: emailUser,
            subject: `🛒 New Order — ₹${order.amount}`,
            html: `
                <h2>New Order Received!</h2>
                <p><b>Order ID:</b> ${order._id}</p>
                <p><b>Amount:</b> ₹${order.amount}</p>
                <p><b>Items:</b></p>
                <ul>${itemsList}</ul>
                <p><b>Address:</b> ${order.address?.street}, ${order.address?.city}</p>
                <p><b>Payment:</b> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</p>
            `
        })
    } catch (error) {}
}
