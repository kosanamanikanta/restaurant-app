import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'

axios.get('http://localhost:4000/api/settings/get').then(res => {
  if (res.data.success) {
    const { adminSiteTitle, adminFavicon } = res.data.data
    if (adminSiteTitle) document.title = adminSiteTitle
    if (adminFavicon) {
      const link = document.querySelector('link[rel*="icon"]') || document.createElement('link')
      link.rel = 'icon'
      link.href = `http://localhost:4000/images/${adminFavicon}`
      document.head.appendChild(link)
    }
  }
}).catch(() => {})

createRoot(document.getElementById('root')).render(
<BrowserRouter>
<App/>
</BrowserRouter>
)
