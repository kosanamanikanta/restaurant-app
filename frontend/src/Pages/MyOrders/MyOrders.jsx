import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContent } from '../../Components/context/StoreContext'
import axios from 'axios'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import LiveTrackingMap from '../../Components/LiveTrackingMap/LiveTrackingMap'
import { io } from 'socket.io-client'

const StarRating = ({ value, onChange }) => (
    <div className='star-row'>
        {[1,2,3,4,5].map(s => (
            <span
                key={s}
                className={`star ${value >= s ? 'filled' : ''}`}
                onClick={() => onChange && onChange(s)}
                style={{ cursor: onChange ? 'pointer' : 'default' }}
            >★</span>
        ))}
    </div>
)

const MyOrders = () => {
    const { url, token, paymentConfig, settings } = useContext(StoreContent)
    const [orders, setOrders] = useState([])

    // load Razorpay script dynamically only when needed
    useEffect(() => {
        if (paymentConfig.onlinePaymentEnabled && !window.Razorpay) {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.async = true
            document.body.appendChild(script)
        }
    }, [paymentConfig.onlinePaymentEnabled])
    const [confirmCancel, setConfirmCancel] = useState(null)
    const [ratingOrder, setRatingOrder] = useState(null)
    const [ratingVal, setRatingVal] = useState(0)
    const [reviewText, setReviewText] = useState('')

    const fetchOrders = async () => {
        const response = await axios.post(url + '/api/order/userorders', {}, { headers: { token } })
        if (response.data.success) setOrders([...response.data.data].reverse())
    }

    useEffect(() => {
        if (!token) return
        fetchOrders()
        const interval = setInterval(() => {
            if (!ratingOrder) fetchOrders()
        }, 5000)
        // socket — instant delivered update
        const socket = io(url)
        // join all active order rooms
        orders.filter(o => o.status === 'Out for Delivery').forEach(o => {
            socket.emit('join-order', o._id)
        })
        socket.on('order-status-changed', ({ status }) => {
            if (status === 'Delivered') {
                fetchOrders()
                toast.success('🎉 Your order has been delivered!')
            }
        })
        socket.on('order-delivered', () => {
            fetchOrders()
            toast.success('🎉 Your order has been delivered!')
        })
        return () => { clearInterval(interval); socket.disconnect() }
    }, [token, ratingOrder])

    const cancelOrder = async (orderId) => {
        const response = await axios.post(url + '/api/order/cancel', { orderId }, { headers: { token } })
        setConfirmCancel(null)
        if (response.data.success) fetchOrders()
        else toast.error(response.data.message)
    }

    const submitRating = async (orderId) => {
        if (!ratingVal) { toast.error('Please select a star rating'); return }
        const response = await axios.post(url + '/api/order/rate', { orderId, rating: ratingVal, review: reviewText }, { headers: { token } })
        if (response.data.success) {
            toast.success('Thank you for your feedback! ⭐')
            setOrders(prev => prev.map(o =>
                o._id === orderId ? { ...o, rating: ratingVal, review: reviewText } : o
            ))
            setRatingOrder(null)
            setRatingVal(0)
            setReviewText('')
        } else {
            toast.error(response.data.message)
        }
    }

    const retryPayment = async (order) => {
        try {
            const response = await axios.post(url + '/api/order/retry-payment', { orderId: order._id }, { headers: { token } })
            if (!response.data.success) { toast.error(response.data.message); return }
            const options = {
                key: paymentConfig.razorpayKeyId,
                amount: response.data.amount * 100,
                currency: 'INR',
                name: 'TutaFoods',
                description: 'Food Order Payment',
                order_id: response.data.razorpayOrderId,
                handler: async () => {
                    await axios.post(url + '/api/order/verify', { orderId: order._id, success: true }, { headers: { token } })
                    toast.success('Payment successful! ✅')
                    fetchOrders()
                },
                theme: { color: 'tomato' },
                modal: { ondismiss: () => fetchOrders() }
            }
            new window.Razorpay(options).open()
        } catch (error) {
            toast.error('Retry failed: ' + error.message)
        }
    }

    const canCancel = (status, date) => {
        if (status !== 'Food Processing') return false
        return (Date.now() - new Date(date).getTime()) < 60000
    }

    const isDelivered = (order) => order.status === 'Delivered' || order.archived

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>
            <div className='container'>
                {orders.length === 0 && <p className='no-orders'>No orders found.</p>}
                {orders.map((order) => (
                    <div key={order._id} className={`my-orders-order ${!order.payment ? 'unpaid' : ''} ${order.status === 'Cancelled' ? 'cancelled' : ''}`}>

                        {/* Order Info Row */}
                        <div className='order-top-row'>
                            <img src={assets.parcel_icon} alt='' />
                            <p className='order-items'>
                                {order.items.map((item, i) =>
                                    i === order.items.length - 1
                                        ? `${item.name} x ${item.quantity}`
                                        : `${item.name} x ${item.quantity}, `
                                )}
                            </p>
                            <p>₹{order.amount}</p>
                            <p>Items: {order.items.length}</p>
                            <p>{new Date(order.date).toLocaleString('en-IN', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}</p>
                            {order.deliveredAt && (
                                <p className='delivered-time'>✅ Delivered: {new Date(order.deliveredAt).toLocaleString('en-IN', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}</p>
                            )}
                            <div className='order-actions'>
                                {!order.payment ? (
                                    <button className='retry-btn' onClick={() => retryPayment(order)}>💳 Retry Payment</button>
                                ) : order.status === 'Cancelled' ? (
                                    <span className='cancelled-label'>❌ Cancelled</span>
                                ) : isDelivered(order) ? (
                                    !order.rating && ratingOrder !== order._id
                                        ? <button className='rate-btn' onClick={() => { setRatingOrder(order._id); setRatingVal(0); setReviewText('') }}>⭐ Rate Order</button>
                                        : null
                                ) : (
                                    canCancel(order.status, order.date) && (
                                        confirmCancel === order._id
                                            ? <>
                                                <span className='confirm-text'>Cancel cheyalaa?</span>
                                                <button className='cancel-btn' onClick={() => cancelOrder(order._id)}>✔ Yes</button>
                                                <button className='no-btn' onClick={() => setConfirmCancel(null)}>✘ No</button>
                                              </>
                                            : <button className='cancel-btn' onClick={() => setConfirmCancel(order._id)}>❌ Cancel</button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Rating Panel — shown when user clicks Rate Order */}
                        {ratingOrder === order._id && (
                            <div className='rating-panel'>
                                <p>How was your order?</p>
                                <StarRating value={ratingVal} onChange={setRatingVal} />
                                <textarea
                                    value={reviewText}
                                    onChange={e => setReviewText(e.target.value)}
                                    placeholder='Write a review (optional)...'
                                    rows={2}
                                />
                                <div className='rating-actions'>
                                    <button className='submit-rating-btn' onClick={() => submitRating(order._id)}>Submit ⭐</button>
                                    <button className='skip-rating-btn' onClick={() => { setRatingOrder(null); setRatingVal(0); setReviewText('') }}>Skip</button>
                                </div>
                            </div>
                        )}

                        {/* Submitted Rating Display — only for rated orders */}
                        {order.rating > 0 && ratingOrder !== order._id && (
                            <div className='order-rating-display'>
                                <StarRating value={order.rating} />
                                {order.review && <p className='order-review-text'>"{order.review}"</p>}
                            </div>
                        )}

                        {/* Live Tracking Map */}
                        {order.status === 'Out for Delivery' && order.payment && (
                            <LiveTrackingMap order={order} url={url} settings={settings} />
                        )}

                        {/* Status Track */}
                        {order.status !== 'Cancelled' && order.payment && (
                            <div className='order-status-track'>
                                {[
                                    { key: 'Food Processing', icon: '🍳', label: 'Order Confirmed', msg: 'Your order is being prepared!' },
                                    { key: 'Out for Delivery', icon: '🚚', label: 'Out for Delivery', msg: 'Your order is on the way!' },
                                    { key: 'Delivered', icon: '✅', label: 'Delivered', msg: 'Enjoy your meal!' }
                                ].map((step, i, arr) => {
                                    const statuses = arr.map(s => s.key)
                                    const currentIdx = statuses.indexOf(order.status)
                                    const stepIdx = i
                                    const isDone = currentIdx >= stepIdx
                                    const isActive = currentIdx === stepIdx
                                    return (
                                        <React.Fragment key={step.key}>
                                            <div className={`track-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                                                <div className='track-icon-wrap'>
                                                    <span>{step.icon}</span>
                                                    {isActive && <span className='track-ping'/>}
                                                </div>
                                                <p>{step.label}</p>
                                                {isActive && <span className='track-status-msg'>{step.msg}</span>}
                                            </div>
                                            {i < arr.length - 1 && (
                                                <div className={`track-line ${currentIdx > stepIdx ? 'done' : ''} ${isActive ? 'animating' : ''}`}/>
                                            )}
                                        </React.Fragment>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MyOrders
