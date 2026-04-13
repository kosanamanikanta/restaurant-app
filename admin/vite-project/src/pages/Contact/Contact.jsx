import React, { useState, useEffect } from 'react'
import './Contact.css'
import axios from 'axios'
import { toast } from 'react-toastify'

const Contact = ({ url }) => {
    const [data, setData] = useState({ phone: '', email: '', address: '' })

    useEffect(() => {
        const fetch = async () => {
            const response = await axios.get(`${url}/api/contact/get`)
            if (response.data.success) setData(response.data.data)
        }
        fetch()
    }, [])

    const onSubmit = async (e) => {
        e.preventDefault()
        const response = await axios.post(`${url}/api/contact/update`, data)
        if (response.data.success) toast.success(response.data.message)
        else toast.error(response.data.message)
    }

    return (
        <div className='contact-settings'>
            <p className='contact-title'>Contact Settings</p>
            <form onSubmit={onSubmit} className='contact-form'>
                <div className='contact-field'>
                    <p>Phone</p>
                    <input value={data.phone} onChange={e => setData(p => ({ ...p, phone: e.target.value }))} type='text' placeholder='+91 99999 99999' required />
                </div>
                <div className='contact-field'>
                    <p>Email</p>
                    <input value={data.email} onChange={e => setData(p => ({ ...p, email: e.target.value }))} type='email' placeholder='contact@tutafoods.com' required />
                </div>
                <div className='contact-field'>
                    <p>Address</p>
                    <input value={data.address} onChange={e => setData(p => ({ ...p, address: e.target.value }))} type='text' placeholder='123, Street, City' required />
                </div>
                <button type='submit'>Save</button>
            </form>
        </div>
    )
}

export default Contact
