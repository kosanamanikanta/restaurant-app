import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import foodModel from "../models/foodModel.js"

const getStats = async (req, res) => {
    try {
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        const allOrders = await orderModel.find({ payment: true })
        const todayOrders = allOrders.filter(o => new Date(o.date) >= todayStart)
        const monthOrders = allOrders.filter(o => new Date(o.date) >= monthStart)
        const pendingOrders = await orderModel.countDocuments({ status: 'Food Processing', payment: true })
        const totalUsers = await userModel.countDocuments({})
        const totalFoods = await foodModel.countDocuments({})

        // Weekly data
        const weeklyData = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(d.getDate() - i)
            const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
            const end = new Date(start); end.setDate(end.getDate() + 1)
            const dayOrders = allOrders.filter(o => new Date(o.date) >= start && new Date(o.date) < end)
            weeklyData.push({
                label: start.toLocaleDateString('en-IN', { weekday: 'short' }),
                revenue: dayOrders.reduce((s, o) => s + o.amount, 0),
                orders: dayOrders.length
            })
        }

        // Top items
        const itemCount = {}
        allOrders.forEach(o => o.items.forEach(item => {
            itemCount[item.name] = (itemCount[item.name] || 0) + item.quantity
        }))
        const topItems = Object.entries(itemCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }))

        // Status count
        const statusCount = {}
        const allOrdersAll = await orderModel.find({})
        allOrdersAll.forEach(o => { statusCount[o.status] = (statusCount[o.status] || 0) + 1 })

        res.json({
            success: true,
            data: {
                todayOrders: todayOrders.length,
                todayRevenue: todayOrders.reduce((s, o) => s + o.amount, 0),
                monthRevenue: monthOrders.reduce((s, o) => s + o.amount, 0),
                totalRevenue: allOrders.reduce((s, o) => s + o.amount, 0),
                totalOrders: allOrders.length,
                pendingOrders,
                totalUsers,
                totalFoods,
                weeklyData,
                topItems,
                statusCount
            }
        })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export { getStats }
