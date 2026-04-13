import React, { useState, useEffect, useRef } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const url = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const Navbar = ({ adminData, onLogout }) => {
    const navigate = useNavigate()
    const [navbarBg, setNavbarBg] = useState('')
    const [profileSrc, setProfileSrc] = useState(assets.profile_image)
    const [logoSrc, setLogoSrc] = useState(assets.logo)
    const [showDropdown, setShowDropdown] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [showNotif, setShowNotif] = useState(false)
    const audioRef = useRef(null)

    useEffect(() => {
        const fetchSettings = async () => {
            const response = await axios.get(`${url}/api/settings/get`)
            if (response.data.success) {
                const d = response.data.data
                if (d.adminNavbarImage) setNavbarBg(`url(${url}/images/${d.adminNavbarImage})`)
                else setNavbarBg('')
                setProfileSrc(d.adminProfileImage ? `${url}/images/${d.adminProfileImage}` : assets.profile_image)
                setLogoSrc(d.logo ? `${url}/images/${d.logo}` : assets.logo)
            }
        }
        fetchSettings()
        const interval = setInterval(fetchSettings, 5000)
        return () => clearInterval(interval)
    }, [])

    // SSE — listen for new order notifications
    useEffect(() => {
        let es
        let retryTimeout

        const connect = () => {
            es = new EventSource(`${url}/api/notifications/sse`)
            es.onmessage = (e) => {
                if (e.data === 'connected') return
                try {
                    const data = JSON.parse(e.data)
                    if (data.type === 'new_order') {
                        setNotifications(prev => {
                            // prevent duplicate by orderId
                            if (prev.some(n => n.orderId === data.orderId)) return prev
                            return [{ ...data, read: false }, ...prev].slice(0, 20)
                        })
                        if (Notification.permission === 'granted') {
                            new Notification(data.title, { body: data.message, icon: '/favicon.svg' })
                        }
                    }
                } catch {}
            }
            es.onerror = () => {
                es.close()
                retryTimeout = setTimeout(connect, 3000)
            }
        }

        connect()
        return () => {
            es?.close()
            clearTimeout(retryTimeout)
        }
    }, [])

    const unreadCount = notifications.filter(n => !n.read).length

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    return (
        <div className='navbar' style={navbarBg ? { backgroundImage: navbarBg } : {}}>
            <img className='logo' src={logoSrc} alt='logo' />

            <div className='navbar-right-group'>
                {/* Notification Bell */}
                <div className='notif-wrap'>
                    <div className='notif-bell' onClick={() => {
                        if (Notification.permission === 'default') Notification.requestPermission()
                        setShowNotif(p => !p)
                        setShowDropdown(false)
                        markAllRead()
                    }}>
                        🔔
                        {unreadCount > 0 && <span className='notif-badge'>{unreadCount}</span>}
                    </div>
                    {showNotif && (
                        <div className='notif-dropdown'>
                            <p className='notif-title'>Notifications</p>
                            {notifications.length === 0
                                ? <p className='notif-empty'>No notifications yet</p>
                                : notifications.map((n, i) => (
                                    <div key={i} className='notif-item' onClick={() => {
                                        navigate('/orders', { state: { highlightOrder: n.orderId } })
                                        setShowNotif(false)
                                        markAllRead()
                                    }}>
                                        <p className='notif-item-title'>{n.title}</p>
                                        <p className='notif-item-msg'>{n.message}</p>
                                        <p className='notif-item-time'>{new Date(n.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className='navbar-profile-wrap'>
                    <img
                        className='profile'
                        src={profileSrc}
                        alt='profile'
                        onClick={() => { setShowDropdown(p => !p); setShowNotif(false) }}
                    />
                    {showDropdown && (
                        <div className='admin-dropdown'>
                            <div className='admin-dropdown-header'>
                                <img src={profileSrc} alt='' className='dropdown-avatar' />
                                <div>
                                    <p className='dropdown-name'>{adminData?.name || 'Admin'}</p>
                                    <p className='dropdown-role'>{adminData?.role || 'Administrator'}</p>
                                </div>
                            </div>
                            <hr />
                            <div className='dropdown-detail'><span>👤</span><p>{adminData?.username || 'admin'}</p></div>
                            {adminData?.email && <div className='dropdown-detail'><span>✉️</span><p>{adminData.email}</p></div>}
                            {adminData?.phone && <div className='dropdown-detail'><span>📞</span><p>{adminData.phone}</p></div>}
                            <hr />
                            <div className='dropdown-logout' onClick={onLogout}>
                                <span>🚪</span><p>Logout</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Navbar
