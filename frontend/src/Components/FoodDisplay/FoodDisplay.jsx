import React, { useContext } from 'react'
import './FoodDisplay.css'
import { StoreContent } from '../context/StoreContext'
import FoodItems from '../FoodItems/FoodItems'

const SkeletonCard = () => (
    <div className='skeleton-card'>
        <div className='skeleton-img'></div>
        <div className='skeleton-body'>
            <div className='skeleton-line wide'></div>
            <div className='skeleton-line medium'></div>
            <div className='skeleton-line short'></div>
        </div>
    </div>
)

const FoodDisplay = ({ category }) => {
    const { food_list, searchQuery } = useContext(StoreContent)

    const filtered = food_list.filter(item => {
        const matchCategory = category === 'All' || category === item.category
        const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchCategory && matchSearch
    })

    const loading = food_list.length === 0

    return (
        <div className='food-display' id='food-display'>
            <h2>{searchQuery ? `Results for "${searchQuery}"` : 'Top dishes near you'}</h2>
            <div className='food-display-list'>
                {loading
                    ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
                    : filtered.length === 0
                        ? <p className='no-results'>No items found{searchQuery ? ` for "${searchQuery}"` : ''}</p>
                        : filtered.map(item => (
                            <FoodItems key={item._id} id={item._id} name={item.name} price={item.price} description={item.description} image={item.image} category={item.category} discount={item.discount || 0} discountType={item.discountType || 'percent'} />
                        ))
                }
            </div>
        </div>
    )
}

export default FoodDisplay
