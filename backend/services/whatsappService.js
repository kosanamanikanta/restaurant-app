import twilio from 'twilio'
import settingsModel from '../models/settingsModel.js'

const getClient = (settings) => {
    const sid = settings?.twilioAccountSid || process.env.TWILIO_SID
    const token = settings?.twilioAuthToken || process.env.TWILIO_TOKEN
    if (!sid || !token) return null
    return twilio(sid, token)
}

export const sendWhatsAppToCustomer = async (order, userPhone) => {
    try {
        const settings = await settingsModel.findOne({})
        if (!settings?.whatsappEnabled || !userPhone) return
        const client = getClient(settings)
        if (!client) return
        const from = settings?.twilioWhatsappFrom || 'whatsapp:+14155238886'
        const restaurantName = settings?.restaurantName || 'TutaFoods'
        const items = order.items.map(i => `${i.name} x${i.quantity}`).join(', ')
        await client.messages.create({
            from,
            to: `whatsapp:${userPhone}`,
            body: `✅ Order Confirmed!\n\n🍽️ ${items}\n💰 Total: ₹${order.amount}\n🚚 ${settings?.deliveryTime || '30-45 minutes'} లో deliver అవుతుంది.\n\n— ${restaurantName}`
        })
    } catch (error) {}
}

export const sendWhatsAppToAdmin = async (order) => {
    try {
        const settings = await settingsModel.findOne({})
        if (!settings?.whatsappEnabled) return
        const client = getClient(settings)
        if (!client) return
        const from = settings?.twilioWhatsappFrom || 'whatsapp:+14155238886'
        const adminNumber = settings?.adminWhatsappNumber
        if (!adminNumber) return
        const items = order.items.map(i => `${i.name} x${i.quantity}`).join(', ')
        await client.messages.create({
            from,
            to: `whatsapp:${adminNumber}`,
            body: `🛒 New Order!\n\n🍽️ ${items}\n💰 Amount: ₹${order.amount}\n📍 ${order.address?.street}, ${order.address?.city}`
        })
    } catch (error) {}
}

export const sendOrderStatusWhatsApp = async (order, userPhone, status) => {
    try {
        const settings = await settingsModel.findOne({})
        if (!settings?.whatsappEnabled || !userPhone) return
        const client = getClient(settings)
        if (!client) return
        const from = settings?.twilioWhatsappFrom || 'whatsapp:+14155238886'
        const statusMessages = {
            'Food Processing': '🍳 మీ order prepare అవుతుంది!',
            'Out for Delivery': '🚚 మీ order on the way!',
            'Delivered': '✅ మీ order delivered అయింది! Enjoy your meal! 😊'
        }
        const msg = statusMessages[status]
        if (!msg) return
        await client.messages.create({
            from,
            to: `whatsapp:${userPhone}`,
            body: `${msg}\n\nOrder ID: ${order._id}\n💰 ₹${order.amount}\n\n— ${settings?.restaurantName || 'TutaFoods'}`
        })
    } catch (error) {}
}
