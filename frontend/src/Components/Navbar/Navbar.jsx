import React, { useState, useContext } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { StoreContent } from '../context/StoreContext'

const Navbar = ( {setShowLogin}) => {
    const [menu, setMenu] = useState("home")
    const { getTotalCartAmount, token, setToken, searchQuery, setSearchQuery, settings, url, cartItems } = useContext(StoreContent)
    const totalCartItems = Object.values(cartItems || {}).filter(v => v > 0).reduce((a, b) => a + b, 0)
    const logoSrc = settings?.logo ? `${url}/images/${settings.logo}` : assets.logo
    const navigate = useNavigate()
    const [showSearch, setShowSearch] = useState(false)

    const handleScroll = (section) => {
        setMenu(section)
        navigate('/')
        setTimeout(() => {
            const el = document.getElementById(section)
            if(el) el.scrollIntoView({behavior: 'smooth'})
        }, 100)
    }

    const handleSearchIcon = () => {
        setShowSearch(prev => !prev)
        if (showSearch) setSearchQuery('')
    }

    const navbarBg = settings?.navbarImage ? `url(${url}/images/${settings.navbarImage})` : `url('/navbar_img.png')`

  return (
    <div className='navbar' style={{backgroundImage: navbarBg}}>
        <Link to="/"><img src={logoSrc} alt='' className='logo'/></Link>
        <ul className='navbar-menu'>
            <Link to='/' onClick={()=>setMenu("home")} className={menu==="home"?"active":""}>Home</Link>
            <span onClick={()=>handleScroll("explore-menu")} className={menu==="explore-menu"?"active":""}>Menu</span>
            <span onClick={()=>handleScroll("app-download")} className={menu==="app-download"?"active":""}>Mobile-app</span>
            <span onClick={()=>handleScroll("footer")} className={menu==="footer"?"active":""}>Contact us</span>
        </ul>
        <div className='navbar-right'>
            <div className='navbar-search-box'>
                <img src={assets.search_icon} alt='' className='search_icon' onClick={handleSearchIcon}/>
                {showSearch && (
                    <input
                        className='navbar-search-input'
                        type='text'
                        placeholder='Search food...'
                        value={searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value)
                            navigate('/')
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                setTimeout(() => {
                                    const el = document.getElementById('food-display')
                                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                                }, 100)
                            }
                        }}
                        autoFocus
                    />
                )}
            </div>
            <div className='navbar-search-icon'>
              <Link to='/cart'><img src={assets.basket_icon} alt='' className='basket_image'/></Link>
                {totalCartItems > 0 && <div className='dot'><span>{totalCartItems}</span></div>}
            </div>
            {!token?  <button onClick={()=>setShowLogin(true)}>Sign in</button>
            :<div className='navbar-profile'>
                  <img src={assets.profile_icon} alt=''/>
                  <ul className="navbar-profile-dropdown">
                    <li onClick={()=>navigate('/profile')}><img src={assets.profile_icon} alt="" /> <p>Profile</p></li>
                    <hr/>
                    <li onClick={()=>navigate('/myorders')}><img src={assets.bag_icon} alt="" /> <p>Orders</p></li>
                    <hr/>
                    <li onClick={()=>{setToken("");localStorage.removeItem("token");navigate('/');window.location.reload()}}><img src={assets.logout_icon} alt="" /><p>Logout</p></li>
                  </ul>
                </div>}
           
        </div>
    </div>
  )
}

export default Navbar