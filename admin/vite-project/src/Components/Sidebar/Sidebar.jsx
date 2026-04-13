import React, { useState, useEffect } from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'
import axios from 'axios'
import { io } from 'socket.io-client'

const url = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const Sidebar = () => {
    const [activeOrderCount, setActiveOrderCount] = useState(() => {
        return parseInt(localStorage.getItem('activeOrderCount') || '0')
    })
    const [pendingDeliveryBoys, setPendingDeliveryBoys] = useState(0)

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const [ordersRes, boysRes] = await Promise.all([
                    axios.get(`${url}/api/order/list`),
                    axios.get(`${url}/api/deliveryboy/list`)
                ])
                if (ordersRes.data.success) {
                    const active = ordersRes.data.data.filter(o =>
                        o.status === 'Food Processing' || o.status === 'Out for Delivery'
                    ).length
                    setActiveOrderCount(active)
                    localStorage.setItem('activeOrderCount', String(active))
                }
                if (boysRes.data.success) {
                    setPendingDeliveryBoys(boysRes.data.data.filter(b => !b.approved).length)
                }
            } catch {}
        }
        fetchCount()
        const interval = setInterval(fetchCount, 10000)
        const socket = io(url)
        socket.on('new-delivery-boy', () => {
            setPendingDeliveryBoys(p => p + 1)
        })
        return () => { clearInterval(interval); socket.disconnect() }
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
                    {pendingDeliveryBoys > 0 && (
                        <span className='db-pending-dot'/>
                    )}
                </NavLink>
            </div>
        </div>
    )
}

export default Sidebar
