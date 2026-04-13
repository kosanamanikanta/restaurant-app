import React, { useState, useEffect } from 'react'
import './AdminProfile.css'
import axios from 'axios'
import { toast } from 'react-toastify'

const AdminProfile = ({ url }) => {
    const [data, setData] = useState({ name: '', email: '', phone: '', role: '' })
    const [editMode, setEditMode] = useState(false)

    const fetchAdmin = async () => {
        const response = await axios.get(`${url}/api/admin/get`)
        if (response.data.success) setData(response.data.data)
    }

    const onSave = async () => {
        const response = await axios.post(`${url}/api/admin/update`, data)
        if (response.data.success) {
            toast.success(response.data.message)
            setEditMode(false)
            fetchAdmin()
        } else {
            toast.error(response.data.message)
        }
    }

    useEffect(() => { fetchAdmin() }, [])

    return (
        <div className='admin-profile'>
            <p className='admin-profile-title'>Admin Profile</p>
            <div className='admin-profile-card'>
                <div className='admin-avatar'>
                    {data.name ? data.name[0].toUpperCase() : 'A'}
                </div>
                <h2>{data.name}</h2>
                <p className='admin-role'>{data.role}</p>

                {editMode ? (
                    <div className='admin-edit-form'>
                        {[['Name', 'name'], ['Email', 'email', 'email'], ['Phone', 'phone'], ['Role', 'role']].map(([label, key, type = 'text']) => (
                            <div key={key} className='admin-field'>
                                <p>{label}</p>
                                <input value={data[key]} onChange={e => setData(p => ({ ...p, [key]: e.target.value }))} type={type} placeholder={label} />
                            </div>
                        ))}
                        <div className='admin-btns'>
                            <button className='save-btn' onClick={onSave}>Save</button>
                            <button className='cancel-btn' onClick={() => setEditMode(false)}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div className='admin-details'>
                        <div className='admin-detail-row'><span>✉️ Email</span><p>{data.email || '—'}</p></div>
                        <div className='admin-detail-row'><span>📞 Phone</span><p>{data.phone || '—'}</p></div>
                        <div className='admin-detail-row'><span>👤 Role</span><p>{data.role || '—'}</p></div>
                        <button className='edit-btn' onClick={() => setEditMode(true)}>✏️ Edit Profile</button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminProfile
