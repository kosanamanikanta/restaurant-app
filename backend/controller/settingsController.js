import settingsModel from "../models/settingsModel.js"
import fs from "fs"

const getSettings = async (req, res) => {
    try {
        let settings = await settingsModel.findOne({})
        if (!settings) settings = await settingsModel.create({})
        // never expose razorpayKeySecret to frontend
        const data = settings.toObject()
        delete data.razorpayKeySecret
        res.json({ success: true, data })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const getPaymentConfig = async (req, res) => {
    try {
        const settings = await settingsModel.findOne({})
        res.json({
            success: true,
            razorpayKeyId: settings?.razorpayKeyId || '',
            onlinePaymentEnabled: settings?.onlinePaymentEnabled || false
        })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const updateSettings = async (req, res) => {
    try {
        let settings = await settingsModel.findOne({})
        const update = { ...req.body }
        if (req.body.restaurantLat) update.restaurantLat = Number(req.body.restaurantLat)
        if (req.body.restaurantLng) update.restaurantLng = Number(req.body.restaurantLng)
        if (req.files?.logo) {
            if (settings?.logo) fs.unlink(`uploads/${settings.logo}`, () => {})
            update.logo = req.files.logo[0].filename
        }
        if (req.files?.heroImage) {
            if (settings?.heroImage) fs.unlink(`uploads/${settings.heroImage}`, () => {})
            update.heroImage = req.files.heroImage[0].filename
        }
        if (req.files?.navbarImage) {
            if (settings?.navbarImage) fs.unlink(`uploads/${settings.navbarImage}`, () => {})
            update.navbarImage = req.files.navbarImage[0].filename
        }
        if (req.files?.adminNavbarImage) {
            if (settings?.adminNavbarImage) fs.unlink(`uploads/${settings.adminNavbarImage}`, () => {})
            update.adminNavbarImage = req.files.adminNavbarImage[0].filename
        }
        if (req.files?.adminProfileImage) {
            if (settings?.adminProfileImage) fs.unlink(`uploads/${settings.adminProfileImage}`, () => {})
            update.adminProfileImage = req.files.adminProfileImage[0].filename
        }
        if (req.files?.userFavicon) {
            if (settings?.userFavicon) fs.unlink(`uploads/${settings.userFavicon}`, () => {})
            update.userFavicon = req.files.userFavicon[0].filename
        }
        if (req.files?.adminFavicon) {
            if (settings?.adminFavicon) fs.unlink(`uploads/${settings.adminFavicon}`, () => {})
            update.adminFavicon = req.files.adminFavicon[0].filename
        }
        if (!settings) {
            settings = await settingsModel.create(update)
        } else {
            await settingsModel.findByIdAndUpdate(settings._id, update)
        }
        res.json({ success: true, message: "Settings Updated" })
    } catch (error) {
        console.error('Settings update error:', error.message)
        res.json({ success: false, message: error.message })
    }
}

export { getSettings, getPaymentConfig, updateSettings }