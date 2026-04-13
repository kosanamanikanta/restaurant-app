import React, { useContext, useState } from 'react'
import './FoodItems.css'
import { assets } from '../../assets/assets'
import { StoreContent } from '../context/StoreContext'

const FoodItems = ({ id, name, price, description, image, category, discount, discountType }) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContent)
  const [showDetail, setShowDetail] = useState(false)

  const discountedPrice = discount > 0
    ? Math.round(discountType === 'flat' ? price - discount : price - (price * discount / 100))
    : null
  const discountLabel = discount > 0 ? (discountType === 'flat' ? `₹${discount} off` : `${discount}% off`) : null

  const imgSrc = typeof image === 'string'
    ? (image.startsWith('http') || image.startsWith('/') || image.startsWith('data:')
        ? image
        : url + '/images/' + image)
    : image

  return (
    <>
      <div className='food-item'>
        <div className='food-item-image-container'>
          <img className='food-item-image' src={imgSrc} alt={name} onClick={() => setShowDetail(true)} />
          {!cartItems[id] || cartItems[id] === 0
            ? <img className='add' onClick={() => addToCart(id)} src={assets.add_icon_white} alt='' />
            : <div className='food-item-counter'>
                <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt='' />
                <p>{cartItems[id]}</p>
                <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt='' />
              </div>
          }
        </div>
        <div className='food-item-info'>
          <div className='food-item-name-rating'>
            <p>{name}</p>
            <img src={assets.rating_starts} alt='' />
          </div>
          <p className='food-item-desc'>{description}</p>
          <p className='food-item-price'>
            {discountedPrice
              ? <><span className='food-item-original-price'>₹{price}</span> ₹{discountedPrice} <span className='food-item-discount-badge'>{discountLabel}</span></>
              : <>₹{price}</>}
          </p>
        </div>
      </div>

      {/* Detail Popup */}
      {showDetail && (
        <div className='food-detail-overlay' onClick={() => setShowDetail(false)}>
          <div className='food-detail-box' onClick={e => e.stopPropagation()}>
            <img src={imgSrc} alt={name} className='food-detail-img' />
            <div className='food-detail-content'>
              <div className='food-detail-top'>
                <h2>{name}</h2>
                <img src={assets.cross_icon} alt='' className='food-detail-close' onClick={() => setShowDetail(false)} />
              </div>
              <span className='food-detail-category'>{category}</span>
              <img src={assets.rating_starts} alt='' className='food-detail-rating' />
              <p className='food-detail-desc'>{description}</p>
              <p className='food-detail-price'>
                {discountedPrice
                  ? <><span className='food-item-original-price'>₹{price}</span> ₹{discountedPrice} <span className='food-item-discount-badge'>{discountLabel}</span></>
                  : <>₹{price}</>}
              </p>
              <div className='food-detail-actions'>
                {!cartItems[id] || cartItems[id] === 0
                  ? <button className='food-detail-add' onClick={() => { addToCart(id); setShowDetail(false) }}>Add to Cart 🛒</button>
                  : <div className='food-detail-counter'>
                      <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt='' />
                      <p>{cartItems[id]}</p>
                      <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt='' />
                    </div>
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FoodItems
