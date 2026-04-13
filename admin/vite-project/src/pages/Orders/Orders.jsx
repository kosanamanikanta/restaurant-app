import React, { useEffect, useState, useRef } from 'react'
import './Orders.css'
import axios from 'axios'
import { assets } from '../../assets/assets'
import { useLocation } from 'react-router-dom'
import QRCode from 'qrcode'
import { io } from 'socket.io-client'

const toDateStr = (d) => d.toISOString().slice(0, 10)
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return toDateStr(d) }
const today = () => toDateStr(new Date())
const weekAgo = () => { const d = new Date(); d.setDate(d.getDate() - 6); return toDateStr(d) }
const monthStart = () => { const d = new Date(); return toDateStr(new Date(d.getFullYear(), d.getMonth(), 1)) }

const Orders = ({ url }) => {
    const location = useLocation()
    const navState = location.state
    const [expandedItems, setExpandedItems] = useState({})

    const toggleItems = (orderId) => setExpandedItems(p => ({ ...p, [orderId]: !p[orderId] }))

    const printOrder = async (order) => {
        let qrDataUrl = ''
        if (websiteUrl) {
            try {
                qrDataUrl = await QRCode.toDataURL(websiteUrl, { width: 120, margin: 1, color: { dark: '#000', light: '#fff' } })
            } catch {}
        }
        const win = window.open('', '_blank', 'width=302,height=600,left=100,top=100')
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Order #${String(order._id).slice(-6).toUpperCase()}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Courier New', monospace; font-size: 12px; width: 80mm; padding: 8px; }
                    @media print {
                        @page { size: 80mm auto; margin: 2mm; }
                        body { width: 80mm; }
                    }
                    .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
                    .header img.logo { height: 50px; object-fit: contain; margin-bottom: 4px; display: block; margin-left: auto; margin-right: auto; }
                    .header h2 { font-size: 16px; font-weight: 700; letter-spacing: 1px; }
                    .header p { font-size: 10px; margin-top: 2px; }
                    .order-id { font-size: 10px; color: #555; margin-top: 2px; }
                    .section { margin-bottom: 8px; }
                    .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; border-bottom: 1px solid #ddd; padding-bottom: 2px; }
                    .customer p { font-size: 12px; font-weight: 700; margin-bottom: 2px; }
                    .customer span { font-size: 10px; display: block; line-height: 1.5; }
                    table { width: 100%; border-collapse: collapse; }
                    th { font-size: 10px; text-align: left; border-bottom: 1px dashed #000; padding: 2px 0; }
                    th:last-child { text-align: right; }
                    td { font-size: 11px; padding: 3px 0; border-bottom: 1px dotted #ccc; vertical-align: top; }
                    td:nth-child(2) { text-align: center; width: 30px; }
                    td:last-child { text-align: right; font-weight: 700; }
                    .total { border-top: 1px dashed #000; padding-top: 6px; margin-top: 6px; }
                    .total-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px; }
                    .total-row.grand { font-size: 14px; font-weight: 700; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px; }
                    .payment { text-align: center; margin-top: 8px; font-size: 11px; font-weight: 700; padding: 4px; border: 1px dashed #000; }
                    .footer { text-align: center; margin-top: 10px; border-top: 1px dashed #000; padding-top: 8px; font-size: 10px; line-height: 1.8; }
                    .qr-section { margin: 6px 0; }
                    .qr-section img { display: block; margin: 0 auto 3px; }
                </style>
            </head>
            <body>
                <div class='header'>
                    ${restaurantLogo ? `<img class='logo' src='${restaurantLogo}' />` : ''}
                    <h2>${restaurantName}</h2>
                    <p>${new Date(order.date).toLocaleString('en-IN', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}</p>
                    <p class='order-id'>Order: #${String(order._id).slice(-6).toUpperCase()}</p>
                </div>
                <div class='section customer'>
                    <div class='section-title'>Deliver To</div>
                    <p>${order.address.firstName} ${order.address.lastName}</p>
                    <span>${order.address.street}, ${order.address.city}</span>
                    <span>${order.address.state} - ${order.address.zipCode}</span>
                    <span>Ph: ${order.address.phone}</span>
                </div>
                <div class='section'>
                    <div class='section-title'>Items</div>
                    <table>
                        <thead><tr><th>Item</th><th>Qty</th><th>Amt</th></tr></thead>
                        <tbody>
                            ${order.items.map((i, idx) => `<tr><td>${idx+1}. ${i.name}</td><td>x${i.quantity}</td><td>&#8377;${i.price * i.quantity}</td></tr>`).join('')}
                        </tbody>
                    </table>
                </div>
                <div class='total'>
                    <div class='total-row grand'><span>TOTAL</span><span>&#8377;${order.amount}</span></div>
                </div>
                <div class='payment'>${(order.paymentMethod === 'cod' || !order.paymentMethod) ? 'CASH ON DELIVERY' : 'PAID ONLINE'}</div>
                <div class='footer'>
                    ${qrDataUrl ? `<div class='qr-section'><img src='${qrDataUrl}' width='90' height='90' /><p style='font-size:9px;'>Scan to order online</p><p style='font-size:9px;'>${websiteUrl}</p></div>` : ''}
                    Thank you for ordering!<br/>${restaurantName}
                </div>
            </body>
            </html>
        `)
        win.document.close()
        win.focus()
        win.onload = () => { win.print(); win.close() }
        // fallback if onload doesn't fire
        setTimeout(() => { try { win.print(); win.close() } catch {} }, 1000)
    }

    useEffect(() => {
        if (navState?.highlightOrder) {
            setTimeout(() => {
                const el = document.getElementById(`order-${navState.highlightOrder}`)
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    el.classList.add('highlighted')
                    setTimeout(() => el.classList.remove('highlighted'), 3000)
                }
            }, 500)
        }
    }, [navState])

    const getInitialDates = (quick) => {
        if (quick === 'today') return [today(), today()]
        if (quick === 'week') return [weekAgo(), today()]
        if (quick === 'month') return [monthStart(), today()]
        if (quick === 'all') return ['', '']
        return [yesterday(), today()]
    }

    const [initFrom, initTo] = getInitialDates(navState?.quickFilter)

    const [orders, setOrders] = useState([])
    const [archived, setArchived] = useState([])
    const [tab, setTab] = useState(navState?.tab || 'active')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState(navState?.statusFilter || 'All')
    const [dateFrom, setDateFrom] = useState(initFrom)
    const [dateTo, setDateTo] = useState(initTo)
    const [activeQuick, setActiveQuick] = useState(navState?.quickFilter || 'all')
    const [restaurantName, setRestaurantName] = useState('TutaFoods')
    const [restaurantLogo, setRestaurantLogo] = useState('')
    const [websiteUrl, setWebsiteUrl] = useState('')

    const fetchOrders = async () => {
        const response = await axios.get(`${url}/api/order/list`)
        if (response.data.success) setOrders([...response.data.data].reverse())
    }

    const fetchArchived = async () => {}

    const statusHandler = async (e, orderId) => {
        await axios.post(`${url}/api/order/status`, { orderId, status: e.target.value })
        await fetchOrders()
    }

    useEffect(() => {
        axios.get(`${url}/api/settings/get`).then(res => {
            if (res.data.success) {
                if (res.data.data.restaurantName) setRestaurantName(res.data.data.restaurantName)
                if (res.data.data.logo) setRestaurantLogo(`${url}/images/${res.data.data.logo}`)
                if (res.data.data.websiteUrl) setWebsiteUrl(res.data.data.websiteUrl)
            }
        }).catch(() => {})
        fetchOrders()
        fetchArchived()
        const interval = setInterval(() => { fetchOrders(); fetchArchived() }, 30000)
        // socket — instant update when delivery boy marks delivered
        const socket = io(url)
        socket.on('order-status-changed', () => fetchOrders())
        return () => { clearInterval(interval); socket.disconnect() }
    }, [])

    const applyQuick = (type) => {
        setActiveQuick(type)
        if (type === 'today') { setDateFrom(today()); setDateTo(today()); setTab('active') }
        else if (type === 'yesterday') { setDateFrom(yesterday()); setDateTo(yesterday()); setTab('all') }
        else if (type === 'week') { setDateFrom(weekAgo()); setDateTo(today()); setTab('all') }
        else if (type === 'all') { setDateFrom(''); setDateTo(''); setTab('all') }
    }

    const filterList = (list) => list.filter(o => {
        const name = `${o.address.firstName} ${o.address.lastName}`.toLowerCase()
        const phone = o.address.phone || ''
        const matchSearch = !search || name.includes(search.toLowerCase()) || phone.includes(search)
        const matchStatus = statusFilter === 'All' || o.status === statusFilter
        const orderDate = new Date(o.date)
        const matchFrom = !dateFrom || orderDate >= new Date(dateFrom + 'T00:00:00')
        const matchTo = !dateTo || orderDate <= new Date(dateTo + 'T23:59:59')
        return matchSearch && matchStatus && matchFrom && matchTo
    })

    const exportCSV = (list) => {
        const rows = [['Order ID', 'Customer', 'Phone', 'Items', 'Amount', 'Status', 'Payment', 'Date']]
        list.forEach(o => rows.push([
            o._id,
            `${o.address.firstName} ${o.address.lastName}`,
            o.address.phone,
            o.items.map(i => `${i.name}x${i.quantity}`).join(' | '),
            o.amount, o.status,
            o.payment ? 'Paid' : 'COD',
            new Date(o.date).toLocaleString('en-IN')
        ]))
        const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
    }

    const activeFiltered = filterList(orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled'))
    const archivedFiltered = filterList(orders.filter(o => o.status === 'Delivered'))
    const displayList = tab === 'active' ? activeFiltered : tab === 'archived' ? archivedFiltered : filterList(orders)

    return (
        <div className='orders'>
            <div className='orders-header'>
                <p className='orders-title'>Orders</p>
                <button className='export-btn' onClick={() => exportCSV(displayList)}>⬇ Export CSV</button>
            </div>

            {/* Tabs */}
            <div className='orders-tabs'>
                <button className={`orders-tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>
                    🟢 Active <span className='tab-count'>{orders.filter(o=>o.status!=='Delivered'&&o.status!=='Cancelled').length}</span>
                </button>
                <button className={`orders-tab ${tab === 'archived' ? 'active' : ''}`} onClick={() => setTab('archived')}>
                    📦 Delivered <span className='tab-count'>{orders.filter(o=>o.status==='Delivered').length}</span>
                </button>
                <button className={`orders-tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
                    📋 All Orders <span className='tab-count'>{orders.length}</span>
                </button>
            </div>

            {/* Quick Filters */}
            <div className='quick-filters'>
                <button className={activeQuick==='today'?'active':''} onClick={() => applyQuick('today')}>Today</button>
                <button className={activeQuick==='yesterday'?'active':''} onClick={() => applyQuick('yesterday')}>Yesterday</button>
                <button className={activeQuick==='week'?'active':''} onClick={() => applyQuick('week')}>This Week</button>
                <button className={activeQuick==='all'?'active':''} onClick={() => applyQuick('all')}>All Time</button>
            </div>

            {/* Filters */}
            <div className='orders-filters'>
                <input className='orders-search' type='text' placeholder='🔍 Search by name or phone...' value={search} onChange={e => setSearch(e.target.value)} />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value='All'>All Status</option>
                    <option value='Food Processing'>Food Processing</option>
                    <option value='Ready for Pickup'>Ready for Pickup</option>
                    <option value='Out for Delivery'>Out for Delivery</option>
                    <option value='Delivered'>Delivered</option>
                    <option value='Cancelled'>Cancelled</option>
                </select>
                <input type='date' value={dateFrom} onChange={e => setDateFrom(e.target.value)} title='From date' />
                <input type='date' value={dateTo} onChange={e => setDateTo(e.target.value)} title='To date' />
                {(search || statusFilter !== 'All' || dateFrom || dateTo) && (
                    <button className='clear-filter-btn' onClick={() => { setSearch(''); setStatusFilter('All'); setDateFrom(''); setDateTo(''); setActiveQuick('all') }}>✕ Reset</button>
                )}
            </div>

            <p className='orders-count'>{displayList.length} order{displayList.length !== 1 ? 's' : ''} found</p>

            <div className='orders-list'>
                {displayList.length === 0
                    ? <p className='orders-empty'>No orders found.</p>
                    : displayList.map((order) => (
                        <div key={order._id} id={`order-${order._id}`} className={`orders-item ${!order.payment ? 'unpaid' : ''} ${order.status === 'Cancelled' ? 'cancelled' : ''} ${order.archived ? 'archived' : ''}`}>
                            <img src={assets.parcel_icon} alt='' />
                            <div>
                                <p className='orders-item-food' onClick={() => toggleItems(order._id)} style={{cursor:'pointer'}}>
                                    {expandedItems[order._id]
                                        ? <span className='items-toggle'>▲ Hide items</span>
                                        : <><span className='items-toggle'>▼ {order.items.length} item{order.items.length > 1 ? 's' : ''}</span> — {order.items.map(i => i.name).join(', ')}</>  
                                    }
                                </p>
                                {expandedItems[order._id] && (
                                    <ul className='items-list'>
                                        {order.items.map((item, i) => (
                                            <li key={i}>
                                                <span className='item-num'>{i + 1}.</span>
                                                <span className='item-name'>{item.name}</span>
                                                <span className='item-qty'>x{item.quantity}</span>
                                                <span className='item-price'>₹{item.price * item.quantity}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <p className='orders-item-name'>{order.address.firstName} {order.address.lastName}</p>
                                <p className='orders-item-address'>{order.address.street}, {order.address.city}, {order.address.state}</p>
                                <p className='orders-item-phone'>{order.address.phone}</p>
                                <p className='orders-item-time'>🕐 {new Date(order.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                {order.deliveredAt && <p className='orders-item-delivered'>✅ Delivered: {new Date(order.deliveredAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>}
                                {order.deliveryConfirmed && <p className='confirm-tag delivery-confirm'>🚚 Delivery Boy Confirmed</p>}
                                {order.rating && <p className='orders-item-rating'>{'★'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)} {order.review && `— "${order.review}"`}</p>}
                            </div>
                            <p>Items: {order.items.length}</p>
                            <p>₹{order.amount}</p>
                            <span className={`payment-tag ${order.payment ? 'paid' : 'cod'}`}>{order.payment ? '✅ Paid' : '💵 COD'}</span>
                            {order.archived
                                ? <div className='status-actions'>
                                    <span className='status-archived'>📦 Archived</span>
                                    <button className='action-btn print-btn' onClick={() => printOrder(order)}>🖨️ Print</button>
                                  </div>
                                : order.status === 'Cancelled'
                                    ? <span className='status-cancelled'>❌ Cancelled</span>
                                    : <div className='status-actions'>
                                        <span className={`status-badge-label status-${order.status.replace(/ /g,'-').toLowerCase()}`}>{order.status}</span>
                                        {order.status === 'Food Processing' && (
                                            <>
                                                <button className='action-btn ready-btn' onClick={async () => {
                                                    await statusHandler({ target: { value: 'Ready for Pickup' } }, order._id)
                                                }}>🟡 Ready for Pickup</button>
                                                <button className='action-btn delivery-btn' onClick={() => statusHandler({ target: { value: 'Out for Delivery' } }, order._id)}>🚚 Out for Delivery</button>
                                            </>
                                        )}
                                        {order.status === 'Ready for Pickup' && (
                                            <>
                                                <button className='action-btn delivery-btn' onClick={() => statusHandler({ target: { value: 'Out for Delivery' } }, order._id)}>🚚 Send to Delivery</button>
                                            </>
                                        )}
                                        {order.status === 'Out for Delivery' && (
                                            <button className='action-btn delivered-btn' onClick={() => statusHandler({ target: { value: 'Delivered' } }, order._id)}>✅ Mark Delivered</button>
                                        )}
                                        {order.status === 'Delivered' && (
                                            <span className='delivered-done'>✅ Delivered</span>
                                        )}
                                        <button className='action-btn print-btn' onClick={() => printOrder(order)}>🖨️ Print</button>
                                      </div>
                            }
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Orders
