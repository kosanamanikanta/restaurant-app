import React, { useContext } from 'react'
import './ExploreMenu.css'
import { StoreContent } from '../context/StoreContext'

const ExploreMenu = ({category, setCategory}) => {
  const { menu_list } = useContext(StoreContent)
  return (
    <div className='explore-menu' id='explore-menu' >
        <h1>Explore our menu</h1>
        <p className='explore-menu-text'>Choose from a diverse range of delicious dishes created by our expert chefs. Whether you crave something familiar or want to explore new flavors, we have something for every palate.</p>
        <div className='explore-menu-list'>
            {menu_list.map((item,index)=>{
                return(
                    <div onClick={()=>setCategory(prev=>prev===item.menu_name?"All":item.menu_name)} className='explore-menu-list-item' key={index}>
                        <img className={category===item.menu_name?"active":""} src={item.menu_image} alt="" />
                        <p>{item.menu_name }</p>
                    </div>
                )
            })}
        </div>
       <hr/>
    </div>
  )
}

export default ExploreMenu