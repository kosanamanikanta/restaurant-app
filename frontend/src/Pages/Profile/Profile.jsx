import React, { useState, useEffect, useContext } from 'react'
import './Profile.css'
import { StoreContent } from '../../Components/context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
    const { url, token } = useContext(StoreContent)
    const navigate = useNavigate()
    const [user, setUser] = useState({ name: '', email: '', phone: '', usedPromos: [] })
    const [editMode, setEditMode] = useState(false)
    const [editData, setEditData] = useState({ name: '', phone: '' })
    const [msg, setMsg] = useState('')

    const fetchProfile = async () => {
        const response = await axios.post(url + '/api/user/profile', {}, { headers: { token } })
        if (response.data.success) {
            setUser(response.data.data)
            setEditData({ name: response.data.data.name, phone: response.data.data.phone || '' })
        }
    }

    const saveProfile = async () => {
        const response = await axios.post(url + '/api/user/update-profile', editData, { headers: { token } })
        if (response.data.success) {
            setMsg('✅ Profile updated!')
            setEditMode(false)
            fetchProfile()
            setTimeout(() => setMsg(''), 3000)
        }
    }

    useEffect(() => {
        if (!token) { navigate('/'); return }
        fetchProfile()
    }, [token])

    return (
        <div className='profile-page'>
            <div className='profile-card'>
                <button className='profile-close-btn' onClick={() => navigate(-1)}>✕</button>
                <div className='profile-avatar'>
                    {user.name ? user.name[0].toUpperCase() : '?'}
                </div>
                <h2>{user.name}</h2>
                <p className='profile-email'>✉️ {user.email}</p>

                {editMode ? (
                    <div className='profile-edit'>
                        <div className='profile-field'>
                            <p>Name</p>
                            <input value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className='profile-field'>
                            <p>Phone</p>
                            <input value={editData.phone} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))} placeholder='+91 99999 99999' />
                        </div>
                        <div className='profile-btns'>
                            <button className='save-btn' onClick={saveProfile}>Save</button>
                            <button className='cancel-btn' onClick={() => setEditMode(false)}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div className='profile-info'>
                        <p>📞 {user.phone || 'Phone not added'}</p>
                        <p>🎟️ Promos used: {user.usedPromos?.length || 0} / 3</p>
                        <button className='edit-btn' onClick={() => setEditMode(true)}>✏️ Edit Profile</button>
                    </div>
                )}

                {msg && <p className='profile-msg'>{msg}</p>}

                <div className='profile-actions'>
                    <button onClick={() => navigate('/myorders')}>📦 My Orders</button>
                </div>
            </div>
        </div>
    )
}

export default Profile
