import React, { useState, useEffect } from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'
import axios from 'axios'

const url = 'http://localhost:4000'

const Sidebar = () => {
    const [activeOrderCount, setActiveOrderCount] = useState(() => {
        return parseInt(localStorage.getItem('activeOrderCount') || '0')
    })

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await axios.get(`${url}/api/order/list`)
                if (res.data.success) {
                    const active = res.data.data.filter(o =>
                        o.status === 'Food Processing' || o.status === 'Out for Delivery'
                    ).length
                    setActiveOrderCount(active)
                    localStorage.setItem('activeOrderCount', String(active))
                }
            } catch {}
        }
        fetchCount()
        const interval = setInterval(fetchCount, 10000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className='sidebar'>
            <div className='sidebar-options'>
                <NavLink to='/dashboard' className='sidebar-option'>
                    <img src={assets.order_icon} alt=''/>
                    <p>Dashboard</p>
                </NavLink>
                <NavLink to='/add' className='sidebar-option'>
                    <img src={assets.add_icon} alt=''/>
                    <p>Add Items</p>
                </NavLink>
                <NavLink to='/list' className='sidebar-option'>
                    <img src={assets.order_icon} alt=''/>
                    <p>List Items</p>
                </NavLink>
                <NavLink to='/orders' className='sidebar-option'>
                    <img src={assets.parcel_icon} alt=''/>
                    <p>Orders</p>
                    {activeOrderCount > 0 && (
                        <span className='orders-badge'>{activeOrderCount}</span>
                    )}
                </NavLink>
                <NavLink to='/categories' className='sidebar-option'>
                    <img src={assets.add_icon} alt=''/>
                    <p>Categories</p>
                </NavLink>
                <NavLink to='/promos' className='sidebar-option'>
                    <img src={assets.add_icon} alt=''/>
                    <p>Promo Codes</p>
                </NavLink>
                <NavLink to='/contact' className='sidebar-option'>
                    <img src={assets.add_icon} alt=''/>
                    <p>Contact</p>
                </NavLink>
                <NavLink to='/settings' className='sidebar-option'>
                    <img src={assets.add_icon} alt=''/>
                    <p>Site Settings</p>
                </NavLink>
                <NavLink to='/delivery-boys' className='sidebar-option'>
                    <img src={assets.parcel_icon} alt=''/>
                    <p>Delivery Boys</p>
                </NavLink>
            </div>
        </div>
    )
}

export default Sidebar
