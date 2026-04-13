import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import StoreContextProvider from './Components/context/StoreContext.jsx'
import axios from 'axios'

axios.get('http://localhost:4000/api/settings/get').then(res => {
  if (res.data.success) {
    const { userSiteTitle, userFavicon } = res.data.data
    if (userSiteTitle) document.title = userSiteTitle
    if (userFavicon) {
      const link = document.querySelector('link[rel*="icon"]') || document.createElement('link')
      link.rel = 'icon'
      link.href = `http://localhost:4000/images/${userFavicon}`
      document.head.appendChild(link)
    }
  }
}).catch(() => {})

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <StoreContextProvider>
    <App/>
  </StoreContextProvider>
  </BrowserRouter>
)
