import categoryModel from "../models/categoryModel.js"
import fs from "fs"

const addCategory = async (req, res) => {
    try {
        const category = new categoryModel({
            name: req.body.name,
            image: req.file.filename
        })
        await category.save()
        res.json({ success: true, message: "Category Added" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const listCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find({})
        res.json({ success: true, data: categories })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const removeCategory = async (req, res) => {
    try {
        const category = await categoryModel.findByIdAndDelete(req.body.id)
        if (!category) return res.json({ success: false, message: "Category not found" })
        fs.unlink(`uploads/${category.image}`, () => {})
        res.json({ success: true, message: "Category Removed" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const editCategory = async (req, res) => {
    try {
        const category = await categoryModel.findById(req.body.id)
        if (!category) return res.json({ success: false, message: "Category not found" })
        const update = { name: req.body.name }
        if (req.file) {
            fs.unlink(`uploads/${category.image}`, () => {})
            update.image = req.file.filename
        }
        await categoryModel.findByIdAndUpdate(req.body.id, update)
        res.json({ success: true, message: "Category Updated" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export { addCategory, listCategories, removeCategory, editCategory }
