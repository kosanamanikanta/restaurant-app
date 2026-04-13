import React, { useState, useContext, useEffect } from 'react'
import './PlaceOrders.css'
import { StoreContent } from '../../Components/context/StoreContext'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

const PlaceOrders = () => {
    const { getTotalCartAmount, token, url, food_list, cartItems, setCartItems, settings, paymentConfig, deliveryDistance, locationError, getUserLocation } = useContext(StoreContent)
    const navigate = useNavigate()
    const location = useLocation()
    const discountAmount = location.state?.discount || 0
    const promoCode = location.state?.promoCode || ''
    const deliveryFee = settings?.deliveryFee || 38
    const deliveryTime = settings?.deliveryTime || '30-45 minutes'
    const maxDeliveryDistance = settings?.maxDeliveryDistance || 25

    const isOutOfRange = deliveryDistance !== null && deliveryDistance > maxDeliveryDistance

    const distanceLabel = deliveryDistance !== null
        ? deliveryDistance < 1
            ? `${Math.round(deliveryDistance * 1000)} m from restaurant`
            : `${deliveryDistance.toFixed(1)} km from restaurant`
        : null

    const getFinalAmount = () => {
        const total = getTotalCartAmount()
        if (total === 0) return 0
        return total - discountAmount + deliveryFee
    }

    const [data, setData] = useState({
        firstName: '', lastName: '', email: '',
        street: '', city: '', state: '',
        zipCode: '', country: '', phone: ''
    })

    const onChangeHandler = (e) => {
        setData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const [paymentMethod, setPaymentMethod] = useState('cod')
    const [orderPlaced, setOrderPlaced] = useState(false)
    const [orderDetails, setOrderDetails] = useState(null)

    useEffect(() => { getUserLocation() }, [])

    // load Razorpay script dynamically only when needed
    useEffect(() => {
        if (paymentConfig.onlinePaymentEnabled && !window.Razorpay) {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.async = true
            document.body.appendChild(script)
        }
    }, [paymentConfig.onlinePaymentEnabled])
    const [editAddress, setEditAddress] = useState(false)
    const [hasSavedAddress, setHasSavedAddress] = useState(false)
    const [savedAddresses, setSavedAddresses] = useState([])
    const [showAddressList, setShowAddressList] = useState(false)

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!token) return
            const response = await axios.post(url + '/api/user/profile', {}, { headers: { token } })
            if (response.data.success && response.data.data?.savedAddresses?.length > 0) {
                setSavedAddresses(response.data.data.savedAddresses)
                setData(response.data.data.savedAddresses[0])
                setHasSavedAddress(true)
            }
        }
        fetchAddresses()
    }, [token])

    const placeOrder = async (e) => {
        e.preventDefault()
        try {
            let orderItems = []
            food_list.forEach(item => {
                if (cartItems[item._id] > 0) {
                    orderItems.push({ ...item, quantity: cartItems[item._id] })
                }
            })
            if (orderItems.length === 0) { alert('Cart is empty!'); return }
            if (!token) { alert('Please login first!'); return }

            const response = await axios.post(url + '/api/order/place', {
                address: data,
                items: orderItems,
                amount: getFinalAmount(),
                paymentMethod,
                promoCode
            }, { headers: { token } })

            if (response.data.success) {
                if (paymentMethod === 'cod') {
                    await axios.post(url + '/api/order/verify', {
                        orderId: response.data.orderId,
                        success: true
                    }, { headers: { token } })
                    setCartItems({})
                    setOrderDetails({ items: orderItems, amount: getFinalAmount(), method: 'Cash on Delivery', address: data, distance: deliveryDistance })
                    setOrderPlaced(true)
                    setTimeout(() => navigate('/myorders'), 6000)
                } else {
                    const options = {
                        key: paymentConfig.razorpayKeyId,
                        amount: response.data.amount * 100,
                        currency: 'INR',
                        name: 'TutaFoods',
                        description: 'Food Order Payment',
                        order_id: response.data.razorpayOrderId,
                        handler: async (paymentResponse) => {
                            await axios.post(url + '/api/order/verify', {
                                orderId: response.data.orderId,
                                success: true
                            }, { headers: { token } })
                            setCartItems({})
                            setOrderDetails({ items: orderItems, amount: getFinalAmount(), method: 'Online Payment', address: data, distance: deliveryDistance })
                            setOrderPlaced(true)
                            setTimeout(() => navigate('/myorders'), 6000)
                        },
                        prefill: {
                            name: data.firstName + ' ' + data.lastName,
                            email: data.email,
                            contact: data.phone
                        },
                        theme: { color: 'tomato' },
                        modal: {
                            ondismiss: async () => {
                                await axios.post(url + '/api/order/verify', {
                                    orderId: response.data.orderId,
                                    success: false
                                }, { headers: { token } })
                            }
                        }
                    }
                    const rzp = new window.Razorpay(options)
                    rzp.open()
                }
            } else {
                alert(response.data.message)
            }
        } catch (error) {
            alert('Error: ' + error.message)
        }
    }

    if (isOutOfRange) {
        return (
            <div className='out-of-range-page'>
                <div className='out-of-range-card'>
                    <div className='oor-icon'>🚚</div>
                    <h1>Delivery Not Available</h1>
                    <p className='oor-sub'>Sorry! We currently deliver only within <b>{maxDeliveryDistance} km</b> from our restaurant.</p>
                    <div className='oor-distance-box'>
                        <span>📍 Your distance</span>
                        <b>{deliveryDistance < 1 ? `${Math.round(deliveryDistance * 1000)} m` : `${deliveryDistance.toFixed(1)} km`}</b>
                    </div>
                    <div className='oor-divider'/>
                    <p className='oor-help'>Want to place a bulk order or need special delivery?</p>
                    {settings?.phone && (
                        <a className='oor-call-btn' href={`tel:${settings.phone}`}>📞 Call Us: {settings.phone}</a>
                    )}
                    {settings?.address && (
                        <p className='oor-address'>🏠 Visit us: {settings.address}</p>
                    )}
                    <button className='oor-back-btn' onClick={() => navigate('/')}>← Back to Menu</button>
                </div>
            </div>
        )
    }

    if (orderPlaced) {
        return (
            <div className='thankyou-page'>
                <div className='thankyou-card'>
                    <div className='thankyou-icon'>🎉</div>
                    <h1>Order Placed Successfully!</h1>
                    <p className='thankyou-sub'>Thank you for ordering at <b>{settings?.restaurantName || 'our restaurant'}</b>!</p>
                    <div className='thankyou-divider'/>
                    <div className='thankyou-items'>
                        <p className='thankyou-section-title'>🛍️ Your Items</p>
                        {orderDetails?.items.map((item, i) => (
                            <div key={i} className='thankyou-item-row'>
                                <span>{item.name} × {item.quantity}</span>
                                <span>₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <div className='thankyou-divider'/>
                    <div className='thankyou-meta'>
                        <div className='thankyou-meta-row'>
                            <span>💰 Total Paid</span>
                            <b>₹{orderDetails?.amount}</b>
                        </div>
                        <div className='thankyou-meta-row'>
                            <span>💳 Payment</span>
                            <b>{orderDetails?.method}</b>
                        </div>
                        <div className='thankyou-meta-row'>
                            <span>📍 Deliver To</span>
                            <b>{orderDetails?.address?.street}, {orderDetails?.address?.city}</b>
                        </div>
                        <div className='thankyou-meta-row'>
                            <span>⏱️ Delivery Time</span>
                            <b>{deliveryTime}</b>
                        </div>
                        {orderDetails?.distance !== null && orderDetails?.distance !== undefined && (
                            <div className='thankyou-meta-row'>
                                <span>📍 Delivery Distance</span>
                                <b className='thankyou-distance'>
                                    {orderDetails.distance < 1
                                        ? `${Math.round(orderDetails.distance * 1000)} m`
                                        : `${orderDetails.distance.toFixed(1)} km`
                                    } from restaurant
                                </b>
                            </div>
                        )}
                    </div>
                    <div className='thankyou-divider'/>
                    <p className='thankyou-msg'>We are preparing your food with love ❤️<br/>Sit back and relax!</p>
                    <div className='thankyou-redirect'>
                        <div className='thankyou-progress'/>
                        <p>Redirecting to your orders in a moment...</p>
                    </div>
                    <button className='thankyou-btn' onClick={() => navigate('/myorders')}>View My Orders →</button>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={placeOrder} className='place-order'>
            <div className='place-order-left'>
                <div className='delivery-title-row'>
                    <p className='title'>Delivery Information</p>
                    {hasSavedAddress && !editAddress && (
                        <div className='address-actions'>
                            {savedAddresses.length > 1 && (
                                <button type='button' className='edit-address-btn' onClick={() => setShowAddressList(!showAddressList)}>📋 Change</button>
                            )}
                            <button type='button' className='edit-address-btn' onClick={() => { setEditAddress(true); setShowAddressList(false) }}>✏️ Edit</button>
                        </div>
                    )}
                </div>

                {showAddressList && (
                    <div className='address-list'>
                        {savedAddresses.map((addr, i) => (
                            <div key={i} className={`address-option ${data.street === addr.street && data.phone === addr.phone ? 'selected' : ''}`}
                                onClick={() => { setData(addr); setShowAddressList(false) }}>
                                <p><b>{addr.firstName} {addr.lastName}</b></p>
                                <p>{addr.street}, {addr.city}, {addr.state}</p>
                                <p>📞 {addr.phone}</p>
                            </div>
                        ))}
                        <button type='button' className='new-address-btn' onClick={() => { setData({ firstName:'',lastName:'',email:'',street:'',city:'',state:'',zipCode:'',country:'',phone:'' }); setEditAddress(true); setShowAddressList(false) }}>+ Add New Address</button>
                    </div>
                )}

                {hasSavedAddress && !editAddress ? (
                    <div className='saved-address'>
                        <p>{data.firstName} {data.lastName}</p>
                        <p>{data.street}, {data.city}, {data.state}</p>
                        <p>{data.zipCode}, {data.country}</p>
                        <p>📞 {data.phone}</p>
                        <p>✉️ {data.email}</p>
                    </div>
                ) : (
                    <>
                        <div className='multi-fields'>
                            <input name='firstName' onChange={onChangeHandler} value={data.firstName} type='text' placeholder='First Name' required/>
                            <input name='lastName' onChange={onChangeHandler} value={data.lastName} type='text' placeholder='Last Name' required/>
                        </div>
                        <input name='email' onChange={onChangeHandler} value={data.email} type='email' placeholder='Email Address' required/>
                        <input name='street' onChange={onChangeHandler} value={data.street} type='text' placeholder='Street' required/>
                        <div className='multi-fields'>
                            <input name='city' onChange={onChangeHandler} value={data.city} type='text' placeholder='City' required/>
                            <input name='state' onChange={onChangeHandler} value={data.state} type='text' placeholder='State' required/>
                        </div>
                        <div className='multi-fields'>
                            <input name='zipCode' onChange={onChangeHandler} value={data.zipCode} type='text' placeholder='Zip Code' required/>
                            <input name='country' onChange={onChangeHandler} value={data.country} type='text' placeholder='Country' required/>
                        </div>
                        <input name='phone' onChange={onChangeHandler} value={data.phone} type='text' placeholder='Phone' required/>
                        {editAddress && (
                            <button type='button' className='cancel-edit-btn' onClick={() => setEditAddress(false)}>✕ Cancel</button>
                        )}
                    </>
                )}
            </div>
            <div className='place-order-right'>
                <div className='cart-total'>
                    <h2>Cart Total</h2>
                    <div className='cart-total-details'>
                        <p>Subtotal</p>
                        <p>₹{getTotalCartAmount()}</p>
                    </div>
                    <hr />
                    {discountAmount > 0 && (
                        <>
                            <div className='cart-total-details'>
                                <p style={{color:'green'}}>Discount ({promoCode})</p>
                                <p style={{color:'green'}}>- ₹{discountAmount}</p>
                            </div>
                            <hr />
                        </>
                    )}
                    <div className='delivery-distance-row'>
                        {distanceLabel
                            ? <span className={`distance-badge ${isOutOfRange ? 'out-of-range' : ''}`}>
                                📍 {distanceLabel}
                                {isOutOfRange && <span className='out-of-range-msg'> — Sorry, outside delivery range ({maxDeliveryDistance} km)</span>}
                              </span>
                            : <span className='distance-badge loading'>📍 Detecting location...</span>
                        }
                        {locationError && <span className='location-error'>⚠️ {locationError}</span>}
                    </div>
                    <div className='cart-total-details'>
                        <p>Delivery Fee</p>
                        <p>₹{getTotalCartAmount() === 0 ? 0 : deliveryFee}</p>
                    </div>
                    <hr />
                    <div className='cart-total-details'>
                        <b>Total</b>
                        <b>₹{getFinalAmount()}</b>
                    </div>
                    <button type='submit' disabled={isOutOfRange} className={isOutOfRange ? 'btn-disabled' : ''}>Proceed To Payment</button>
                </div>
                <div className='payment-method'>
                    <p>Select Payment Method:</p>
                    <div className='payment-options'>
                        <div onClick={() => setPaymentMethod('cod')} className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                            <span>💵</span> Cash on Delivery
                        </div>
                        {paymentConfig.onlinePaymentEnabled && (
                            <div onClick={() => setPaymentMethod('razorpay')} className={`payment-option ${paymentMethod === 'razorpay' ? 'selected' : ''}`}>
                                <span>📱</span> UPI / PhonePe / GPay / Card
                            </div>
                        )}
                        {!paymentConfig.onlinePaymentEnabled && (
                            <div className='payment-option disabled'>
                                <span>📱</span> UPI / Card <span className='payment-unavailable'>(Coming Soon)</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </form>
    )
}

export default PlaceOrders
