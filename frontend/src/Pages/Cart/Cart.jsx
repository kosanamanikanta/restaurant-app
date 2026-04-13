import React, { useContext, useState, useEffect } from 'react'
import './Cart.css'
import { StoreContent } from '../../Components/context/StoreContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Cart = ({ setShowLogin }) => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, url, token, settings } = useContext(StoreContent)
  const navigate = useNavigate()
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(null)
  const [promoMsg, setPromoMsg] = useState('')
  const [availablePromos, setAvailablePromos] = useState([])
  const [eligible, setEligible] = useState(true)

  useEffect(() => {
    const fetchPromos = async () => {
      const response = await axios.post(url + '/api/promo/user-promos', {}, token ? { headers: { token } } : {})
      if (response.data.success) {
        setAvailablePromos(response.data.data)
        setEligible(response.data.eligible)
      }
    }
    fetchPromos()
  }, [token])

  const applyPromo = async () => {
    if (!promoCode) return
    const response = await axios.post(url + '/api/promo/apply', { code: promoCode }, { headers: { token } })
    if (response.data.success) {
      setDiscount(response.data)
      setPromoMsg('✅ Promo applied!')
    } else {
      setDiscount(null)
      setPromoMsg('❌ ' + response.data.message)
    }
  }

  const deliveryFee = settings?.deliveryFee || 38

  const getDiscountAmount = () => {
    if (!discount) return 0
    if (discount.type === 'percent') return Math.round(getTotalCartAmount() * discount.discount / 100)
    return discount.discount
  }

  const getFinalAmount = () => {
    const total = getTotalCartAmount()
    if (total === 0) return 0
    return total - getDiscountAmount() + deliveryFee
  }

  const isEmpty = !food_list.some(item => cartItems[item._id] > 0)

  return (
    <div className='cart'>
      <div className='cart-items'>
        <div className='cart-items-title'>
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <hr/>
        {isEmpty
          ? <div className='cart-empty'>
              <p>🛒 Your cart is empty!</p>
              <button onClick={() => {
                navigate('/')
                setTimeout(() => {
                  const el = document.getElementById('explore-menu')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}>+ Add Items</button>
            </div>
          : <>
              {food_list.map((item) => {
                if (cartItems[item._id] > 0) {
                  return (
                    <div key={item._id}>
                      <div className='cart-items-title cart-items-item'>
                        <img src={typeof item.image === 'string' ? (item.image.startsWith('http') ? item.image : url+"/images/"+item.image) : item.image} alt={item.name}/>
                        <p>{item.name}</p>
                        <p>₹{item.price}</p>
                        <p>{cartItems[item._id]}</p>
                        <p>₹{item.price * cartItems[item._id]}</p>
                        <p onClick={() => removeFromCart(item._id)} className='cross'>x</p>
                      </div>
                      <hr/>
                    </div>
                  )
                }
              })}
              <button className='add-more-btn' onClick={() => {
                navigate('/')
                setTimeout(() => {
                  const el = document.getElementById('explore-menu')
                  if (el) el.scrollIntoView({ behavior: 'smooth' })
                }, 100)
              }}>+ Add More Items</button>
            </>
        }
      </div>
      <div className='cart-bottom'>
        <div className='cart-total'>
          <h2>Cart Total</h2>
          <div className='cart-total-details'>
            <p>Subtotal</p>
            <p>₹{getTotalCartAmount()}</p>
          </div>
          <hr/>
          {discount && getDiscountAmount() > 0 && (
            <>
              <div className='cart-total-details'>
                <p style={{color:'green'}}>Discount ({promoCode})</p>
                <p style={{color:'green'}}>- ₹{getDiscountAmount()}</p>
              </div>
              <hr/>
            </>
          )}
          <div className='cart-total-details'>
            <p>Delivery Fee</p>
            <p>₹{getTotalCartAmount() === 0 ? 0 : deliveryFee}</p>
          </div>
          <hr/>
          <div className='cart-total-details'>
            <b>Total</b>
            <b>₹{getFinalAmount()}</b>
          </div>
          <button onClick={() => {
            if (!token) { setShowLogin(true); return }
            navigate('/order', { state: { discount: getDiscountAmount(), promoCode } })
          }}>Proceed To Checkout</button>
        </div>
        <div className='cart-promocode'>
          {!token ? (
            <div className='promo-login-msg'>
              <p>🔐 <span onClick={() => setShowLogin(true)}>Login</span> to use promo codes</p>
            </div>
          ) : (
            <>
              <p>If you have a promo code, enter it here</p>
              {eligible && availablePromos.length > 0 && (
                <div className='available-promos'>
                  <p className='promos-label'>🎉 Available for you:</p>
                  <div className='promos-tags'>
                    {availablePromos.map(p => (
                      <span key={p._id} className='promo-tag' onClick={() => { setPromoCode(p.code); setPromoMsg(''); setDiscount(null) }}>
                        {p.code} — {p.discount}{p.type === 'percent' ? '%' : '₹'} off
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className='cart-promocode-input'>
                <input value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromoMsg(''); setDiscount(null) }} type='text' placeholder='Promo code'/>
                <button onClick={applyPromo}>Submit</button>
              </div>
              {promoMsg && <p className='promo-msg'>{promoMsg}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Cart
