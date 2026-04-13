import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { StoreContent } from '../context/StoreContext'

const Footer = () => {
  const { url, settings } = useContext(StoreContent)
  const navigate = useNavigate()

  const contact = settings?.contact || {}
  const logoSrc = settings?.logo ? `${url}/images/${settings.logo}` : assets.logo

  const handleNav = (section) => {
    if (section === 'top') {
      navigate('/')
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
      return
    }
    navigate('/')
    setTimeout(() => {
      const el = document.getElementById(section)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className='footer' id='footer'>
        <div className="footer-content">
            <div className="footer-content-left">
              <img src={logoSrc} alt='' className='footer-logo'/>
              <p>{settings?.footerAbout || 'We serve delicious food with love.'}</p>
              <div className="footer-social-icons">
                {settings?.facebookUrl
                    ? <a href={settings.facebookUrl} target='_blank' rel='noreferrer'><img src={assets.facebook_icon} alt=''/></a>
                    : <img src={assets.facebook_icon} alt=''/>
                }
                {settings?.twitterUrl
                    ? <a href={settings.twitterUrl} target='_blank' rel='noreferrer'><img src={assets.twitter_icon} alt=''/></a>
                    : <img src={assets.twitter_icon} alt=''/>
                }
                {settings?.linkedinUrl
                    ? <a href={settings.linkedinUrl} target='_blank' rel='noreferrer'><img src={assets.linkedin_icon} alt=''/></a>
                    : <img src={assets.linkedin_icon} alt=''/>
                }
              </div>
            </div>
            <div className="footer-content-center">
                <h2>COMPANY</h2>
                <ul>
                    <li onClick={() => handleNav('top')}>Home</li>
                    <li onClick={() => handleNav('explore-menu')}>Menu</li>
                    <li onClick={() => handleNav('app-download')}>Mobile App</li>
                    <li onClick={() => handleNav('footer')}>Contact us</li>
                </ul>
            </div>
            <div className="footer-content-right">
                <h2>GET IN TOUCH</h2>
                <ul>
                    {settings?.phone && <li>📞 {settings.phone}</li>}
                    {settings?.email && <li>✉️ {settings.email}</li>}
                    {settings?.address && <li>📍 {settings.address}</li>}
                </ul>
            </div>
        </div>
        <hr/>
        <p className="footer-copyright">{settings?.footerCopyright || 'Copyright 2026 © TutaFoods - All Right Reserved.'}</p>
    </div>
  )
}

export default Footer
