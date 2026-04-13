import foodModel from "../models/foodModel.js";
import fs from "fs"

const addFood = async (req, res) => {
    let image_filename = `${req.file.filename}`;
    const food = new foodModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        image: image_filename,
        category: req.body.category,
        discount: Number(req.body.discount) || 0,
        discountType: req.body.discountType || 'percent'
    })
    try {
        await food.save();
        res.json({ success: true, message: "Food Added" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({ success: true, data: foods })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findByIdAndDelete(req.body.id);
        if (!food) return res.json({ success: false, message: "Food not found" })
        fs.unlink(`uploads/${food.image}`, () => {})
        res.json({ success: true, message: "Food Removed" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const editFood = async (req, res) => {
    try {
        const update = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            discount: Number(req.body.discount) || 0,
            discountType: req.body.discountType || 'percent'
        }
        if (req.file) {
            const old = await foodModel.findById(req.body.id)
            if (old?.image) fs.unlink(`uploads/${old.image}`, () => {})
            update.image = req.file.filename
        }
        await foodModel.findByIdAndUpdate(req.body.id, update)
        res.json({ success: true, message: "Food Updated" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export { addFood, listFood, removeFood, editFood }
