import React, { useState, useContext, useEffect } from 'react'
import './Home.css'
import Header from '../../Components/Header/Header'
import ExploreMenu from '../../Components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../Components/FoodDisplay/FoodDisplay'
import APPDownload from '../../Components/AppDownload/APPDownload'
import RestaurantMap from '../../Components/RestaurantMap/RestaurantMap'
import { StoreContent } from '../../Components/context/StoreContext'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const [category, setCategory] = useState('All')
  const { getTotalCartAmount, cartItems, searchQuery } = useContext(StoreContent)
  const navigate = useNavigate()

  useEffect(() => {
    if (searchQuery) setCategory('All')
  }, [searchQuery])

  const totalItems = Object.values(cartItems).reduce((a, b) => a + b, 0)

  return (
    <div>
        <Header setCategory={setCategory}/>
        <ExploreMenu category={category} setCategory={setCategory}/>
        <FoodDisplay category={category}/>
        <APPDownload/>
        <RestaurantMap/>
        {totalItems > 0 && (
            <div className='cart-float-bar' onClick={() => navigate('/cart')}>
                <span className='cart-float-count'>{totalItems} item{totalItems > 1 ? 's' : ''} added</span>
                <span className='cart-float-right'>
                    Go to Cart ₹{getTotalCartAmount()} →
                </span>
            </div>
        )}
    </div>
  )
}

export default Home