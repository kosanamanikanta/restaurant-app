import React, { useState } from 'react'
import './Login.css'
import { assets } from '../../assets/assets'
import axios from 'axios'

const Login = ({ url, onLogin }) => {
    const [step, setStep] = useState('login') // login | forgot | reset
    const [data, setData] = useState({ username: '', password: '' })
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [error, setError] = useState('')
    const [info, setInfo] = useState('')
    const [loading, setLoading] = useState(false)

    const onSubmitLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const response = await axios.post(`${url}/api/admin/login`, data)
            if (response.data.success) {
                localStorage.setItem('adminToken', response.data.token)
                localStorage.setItem('adminData', JSON.stringify(response.data.admin))
                onLogin(response.data.token, response.data.admin)
            } else {
                setError(response.data.message)
            }
        } catch {
            setError('Server error. Please try again.')
        }
        setLoading(false)
    }

    const onSendOtp = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const response = await axios.post(`${url}/api/admin/forgot-password`)
            if (response.data.success) {
                setInfo(response.data.message)
                setStep('reset')
            } else {
                setError(response.data.message || 'Failed to send OTP')
            }
        } catch (err) {
            setError('Server error: ' + (err.response?.data?.message || err.message))
        }
        setLoading(false)
    }

    const onResetPassword = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const response = await axios.post(`${url}/api/admin/reset-password`, { otp, newPassword })
            if (response.data.success) {
                setInfo('')
                setOtp('')
                setNewPassword('')
                setStep('login')
                setError('')
                alert('Password reset successful! Please login with new password.')
            } else {
                setError(response.data.message)
            }
        } catch {
            setError('Server error. Please try again.')
        }
        setLoading(false)
    }

    return (
        <div className='admin-login'>
            {step === 'login' && (
                <form onSubmit={onSubmitLogin} className='admin-login-box'>
                    <img src={assets.logo} alt='logo' className='login-logo' />
                    <h2>Admin Login</h2>
                    <div className='login-field'>
                        <p>Username</p>
                        <input value={data.username} onChange={e => setData(p => ({ ...p, username: e.target.value }))} type='text' placeholder='Enter username' required />
                    </div>
                    <div className='login-field'>
                        <p>Password</p>
                        <input value={data.password} onChange={e => setData(p => ({ ...p, password: e.target.value }))} type='password' placeholder='Enter password' required />
                    </div>
                    {error && <p className='login-error'>⚠️ {error}</p>}
                    <button type='submit' disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
                    <p className='forgot-link' onClick={() => { setStep('forgot'); setError('') }}>Forgot Password?</p>
                </form>
            )}

            {step === 'forgot' && (
                <form onSubmit={onSendOtp} className='admin-login-box'>
                    <img src={assets.logo} alt='logo' className='login-logo' />
                    <h2>Forgot Password</h2>
                    <p className='login-info'>OTP will be sent to the admin email set in your profile.</p>
                    {error && <p className='login-error'>⚠️ {error}</p>}
                    <button type='submit' disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
                    <p className='forgot-link' onClick={() => { setStep('login'); setError('') }}>← Back to Login</p>
                </form>
            )}

            {step === 'reset' && (
                <form onSubmit={onResetPassword} className='admin-login-box'>
                    <img src={assets.logo} alt='logo' className='login-logo' />
                    <h2>Reset Password</h2>
                    {info && <p className='login-info'>✅ {info}</p>}
                    <div className='login-field'>
                        <p>OTP</p>
                        <input value={otp} onChange={e => setOtp(e.target.value)} type='text' placeholder='Enter OTP from email' required />
                    </div>
                    <div className='login-field'>
                        <p>New Password</p>
                        <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type='password' placeholder='Min 6 characters' required />
                    </div>
                    {error && <p className='login-error'>⚠️ {error}</p>}
                    <button type='submit' disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
                    <p className='forgot-link' onClick={() => { setStep('forgot'); setError('') }}>← Resend OTP</p>
                </form>
            )}
        </div>
    )
}

export default Login
