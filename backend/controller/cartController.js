import userModel from "../models/userModel.js"


// add user cart data
const addToCart = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId)
        const cartData = user.cartData
        if (!cartData[req.body.itemId]) {
            cartData[req.body.itemId] = 1
        } else {
            cartData[req.body.itemId] += 1
        }
        await userModel.findByIdAndUpdate(req.body.userId, { cartData })
        res.json({ success: true, message: "Added to cart" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
// remove user cart data
const removeFromCart = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId)
        const cartData = user.cartData
        if (cartData[req.body.itemId] > 0) {
            cartData[req.body.itemId] -= 1
        }
        await userModel.findByIdAndUpdate(req.body.userId, { cartData })
        res.json({ success: true, message: "Removed from cart" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

//fetch user cart
const getCart = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId)
        res.json({ success: true, cartData: user.cartData })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export { addToCart, removeFromCart, getCart }
