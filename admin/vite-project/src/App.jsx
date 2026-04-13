import React, { useState } from 'react'
import Navbar from './Components/Navbar/Navbar'
import Sidebar from './Components/Sidebar/Sidebar'
import { Route, Routes, Navigate } from 'react-router-dom'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import Categories from './pages/Categories/Categories'
import Promos from './pages/Promos/Promos'
import Contact from './pages/Contact/Contact'
import Settings from './pages/Settings/Settings'
import AdminProfile from './pages/AdminProfile/AdminProfile'
import Dashboard from './pages/Dashboard/Dashboard'
import DeliveryBoys from './pages/DeliveryBoys/DeliveryBoys'
import Login from './pages/Login/Login'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const url = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '')

  const handleLogin = (tok) => {
    setToken(tok)
    localStorage.setItem('adminToken', tok)
  }

  if (!token) return <Login url={url} onLogin={handleLogin} />

  return (
    <div>
      <ToastContainer/>
      <Navbar/>
      <hr/>
      <div className='app-content'>
        <Sidebar/>
        <Routes>
          <Route path='/' element={<Navigate to='/dashboard'/>}/>
          <Route path='/dashboard' element={<Dashboard url={url}/>}/>
          <Route path='/add' element={<Add url={url}/>}/>
          <Route path='/list' element={<List url={url}/>}/>
          <Route path='/orders' element={<Orders url={url}/>}/>
          <Route path='/categories' element={<Categories url={url}/>}/>
          <Route path='/promos' element={<Promos url={url}/>}/>
          <Route path='/contact' element={<Contact url={url}/>}/>
          <Route path='/settings' element={<Settings url={url}/>}/>
          <Route path='/admin-profile' element={<AdminProfile url={url}/>}/>
          <Route path='/delivery-boys' element={<DeliveryBoys url={url}/>}/>
        </Routes>
      </div>
    </div>
  )
}

export default App
