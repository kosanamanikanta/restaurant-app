import React, { useContext } from 'react'
import './Header.css'
import { assets } from '../../assets/assets'
import { StoreContent } from '../context/StoreContext'

const Header = ({ setCategory }) => {
  const { settings, url } = useContext(StoreContent)

  const handleViewMenu = () => {
    setCategory('All')
    const el = document.getElementById('explore-menu')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const heroImg = settings?.heroImage ? `${url}/images/${settings.heroImage}` : assets.header_img

  return (
    <div className='header' style={{backgroundImage:`url(${heroImg})`,backgroundSize:'cover',backgroundPosition:'center'}}>
        <div className='header-content'>
            <h2>{settings.heroTitle}</h2>
            <p>{settings.heroSubtitle}</p>
            <button onClick={handleViewMenu}>View Menu</button>
        </div>
    </div>
  )
}

export default Header