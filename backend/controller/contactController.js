import contactModel from "../models/contactModel.js"

const getContact = async (req, res) => {
    try {
        let contact = await contactModel.findOne({})
        if (!contact) contact = await contactModel.create({ phone: "", email: "", address: "" })
        res.json({ success: true, data: contact })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

const updateContact = async (req, res) => {
    try {
        let contact = await contactModel.findOne({})
        if (!contact) {
            contact = await contactModel.create(req.body)
        } else {
            await contactModel.findByIdAndUpdate(contact._id, req.body)
        }
        res.json({ success: true, message: "Contact Updated" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export { getContact, updateContact }
