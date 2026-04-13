import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import './DeliveryBoys.css'

const DeliveryBoys = ({ url }) => {
    const [boys, setBoys] = useState([])

    const fetchBoys = async () => {
        const r = await axios.get(`${url}/api/deliveryboy/list`)
        if (r.data.success) setBoys(r.data.data)
    }

    useEffect(() => { fetchBoys() }, [])

    const approve = async (id) => {
        const r = await axios.post(`${url}/api/deliveryboy/approve/${id}`)
        if (r.data.success) { toast.success('Approved!'); fetchBoys() }
    }

    const remove = async (id) => {
        if (!window.confirm('Delete this delivery boy?')) return
        const r = await axios.delete(`${url}/api/deliveryboy/${id}`)
        if (r.data.success) { toast.success('Deleted'); fetchBoys() }
    }

    const toggle = async (id) => {
        await axios.post(`${url}/api/deliveryboy/toggle/${id}`)
        fetchBoys()
    }

    const pending = boys.filter(b => !b.approved)
    const approved = boys.filter(b => b.approved)

    return (
        <div className='db-page'>
            <p className='db-title'>🚚 Delivery Boys</p>

            {pending.length > 0 && (
                <div className='db-section'>
                    <p className='db-section-title'>⏳ Pending Approval ({pending.length})</p>
                    {pending.map(b => (
                        <div key={b._id} className='db-card pending'>
                            <div className='db-info'>
                                <p className='db-name'>{b.name} <span className='db-pending-tag'>Pending</span></p>
                                <p className='db-meta'>@{b.username} {b.phone && `· 📞 ${b.phone}`}</p>
                            </div>
                            <div className='db-actions'>
                                <button className='db-approve-btn' onClick={() => approve(b._id)}>✅ Approve</button>
                                <button className='db-del-btn' onClick={() => remove(b._id)}>🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className='db-section'>
                <p className='db-section-title'>✅ Approved ({approved.length})</p>
                {approved.length === 0 && <p className='db-empty'>No approved delivery boys yet.</p>}
                {approved.map(b => (
                    <div key={b._id} className={`db-card ${!b.active ? 'inactive' : ''}`}>
                        <div className='db-info'>
                            <p className='db-name'>{b.name} {!b.active && <span className='db-inactive-tag'>Inactive</span>}</p>
                            <p className='db-meta'>@{b.username} {b.phone && `· 📞 ${b.phone}`}</p>
                        </div>
                        <div className='db-actions'>
                            <button className={`db-toggle-btn ${b.active ? 'active' : ''}`} onClick={() => toggle(b._id)}>
                                {b.active ? '✅ Active' : '❌ Inactive'}
                            </button>
                            <button className='db-del-btn' onClick={() => remove(b._id)}>🗑️</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default DeliveryBoys
