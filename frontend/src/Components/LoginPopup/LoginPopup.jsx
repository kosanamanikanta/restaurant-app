import React, { useState, useContext } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContent } from '../context/StoreContext'
import axios from 'axios'


const LoginPopup = ({setShowLogin}) => {

  const{url, setToken}=useContext(StoreContent)
    const [currState, setCurrState] = useState("Login")
    const [error, setError] = useState("")
    const [fpEmail, setFpEmail] = useState("")
    const [fpOtp, setFpOtp] = useState("")
    const [fpPassword, setFpPassword] = useState("")
    const [fpStep, setFpStep] = useState(0) // 0=off, 1=email, 2=otp+pass

    const [data,setData]=useState({
      name:"",
      email:"",
      password:""
    })
 const onChangerHandler = (event)=>{
    const name = event.target.name;
    const value = event.target.value;
    setData(data=>({...data,[name]:value}))
 }
const onLogin= async (event)=>{
    
  event.preventDefault()
  let newUrl= url;
  if(currState==="Login"){
    newUrl+= "/api/user/login"
  }else{
    newUrl+= "/api/user/register"
  }
  const response = await axios.post(newUrl,data)
  if(response.data.success){
    setToken(response.data.token);
    localStorage.setItem("token", response.data.token)
    setShowLogin(false)
  }else{
    setError(response.data.message)
  } 
}

  const sendOtp = async (e) => {
    e.preventDefault()
    setError("")
    const response = await axios.post(url + '/api/user/forgot-password', { email: fpEmail })
    if (response.data.success) {
      setFpStep(2)
    } else {
      setError(response.data.message)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setError("")
    const response = await axios.post(url + '/api/user/reset-password', { email: fpEmail, otp: fpOtp, newPassword: fpPassword })
    if (response.data.success) {
      setFpStep(0)
      setCurrState("Login")
      setFpEmail(""); setFpOtp(""); setFpPassword("")
      setError("")
      alert("Password reset successful! Please login.")
    } else {
      setError(response.data.message)
    }
  } 
 
   
  return (
    <div className='login-popup' id='login-popup'>

      {fpStep === 1 && (
        <form onSubmit={sendOtp} className='login-popup-container'>
          <div className='login-popup-title'>
            <h2>Forgot Password</h2>
            <img onClick={() => { setFpStep(0); setError('') }} src={assets.cross_icon} alt=''/>
          </div>
          <div className='login-popup-inputs'>
            <input value={fpEmail} onChange={e => setFpEmail(e.target.value)} type='email' placeholder='Enter your email' required/>
          </div>
          <button type='submit'>Send OTP</button>
          {error && <p className='login-error'>⚠️ {error}</p>}
        </form>
      )}

      {fpStep === 2 && (
        <form onSubmit={resetPassword} className='login-popup-container'>
          <div className='login-popup-title'>
            <h2>Reset Password</h2>
            <img onClick={() => { setFpStep(0); setError('') }} src={assets.cross_icon} alt=''/>
          </div>
          <div className='login-popup-inputs'>
            <input value={fpOtp} onChange={e => setFpOtp(e.target.value)} type='text' placeholder='Enter OTP' required/>
            <input value={fpPassword} onChange={e => setFpPassword(e.target.value)} type='password' placeholder='New Password' required/>
          </div>
          <button type='submit'>Reset Password</button>
          {error && <p className='login-error'>⚠️ {error}</p>}
          <p className='fp-back' onClick={() => setFpStep(1)}>← Resend OTP</p>
        </form>
      )}

      {fpStep === 0 && (
        <form onSubmit={onLogin} action="" className="login-popup-container">
          <div className='login-popup-title'>
                 <h2>{currState}</h2>
                 <img onClick={()=> setShowLogin(false)} src={assets.cross_icon} alt=''/>
          </div>
          <div className="login-popup-inputs">
            {currState==="Sign Up" ? <input name='name' onChange={onChangerHandler} value={data.name} type='text' placeholder='your name' required/> : <></> }
            <input name='email' onChange={onChangerHandler} value={data.email} type='email' placeholder='your email' required/>
            <input name='password' onChange={onChangerHandler} value={data.password} type='password' placeholder='password' required/>    
          </div>
          <button type='submit'>{currState==="Sign Up" ? "Create Account" : "Login"}</button>
          {error && <p className='login-error'>⚠️ {error}</p>}
          {currState === 'Login' && <p className='forgot-link' onClick={() => { setFpStep(1); setError('') }}>Forgot Password?</p>}
          <div className="login-popup-condition">
            <input type='checkbox' required/>
            <p>By continuing i agree to the terms of use & privacy policy</p>
          </div>
          {
            currState==="Login"
            ?<p>Create an account? <span onClick={()=>setCurrState("Sign Up")}>Click here</span></p>
            :<p>Already have an account? <span onClick={()=>setCurrState("Login")}>Login here</span></p>
          }
        </form>
      )}
    </div>
  )
}

export default LoginPopup