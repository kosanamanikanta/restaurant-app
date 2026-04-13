import React, { useState, useEffect } from 'react'
import './Settings.css'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Settings = ({ url, onAdminUpdate }) => {
    const navigate = useNavigate()
    const [data, setData] = useState({
        restaurantName: '', heroTitle: '', heroSubtitle: '',
        deliveryFee: '', deliveryTime: '', deliveryRadius: '', maxDeliveryDistance: '',
        footerAbout: '', footerCopyright: '',
        facebookUrl: '', twitterUrl: '', linkedinUrl: '',
        appTitle: '', appSubtitle: '', playStoreUrl: '', appStoreUrl: '',
        razorpayKeyId: '', razorpayKeySecret: '', onlinePaymentEnabled: false,
        emailNotificationsEnabled: true, adminEmailNotificationsEnabled: true,
        whatsappEnabled: false, twilioAccountSid: '', twilioAuthToken: '',
        twilioWhatsappFrom: '', adminWhatsappNumber: '',
        smsEnabled: false, twilioSmsFrom: '', adminSmsNumber: '',
        websiteUrl: '',
        userSiteTitle: '',
        adminSiteTitle: '',
        emailUser: '',
        emailPass: '',
        restaurantLat: 17.3850,
        restaurantLng: 78.4867,
        restaurantMapAddress: ''
    })
    const [logo, setLogo] = useState(false)
    const [currentLogo, setCurrentLogo] = useState('')
    const [navbarImage, setNavbarImage] = useState(false)
    const [currentNavbarImage, setCurrentNavbarImage] = useState('')
    const [adminNavbarImage, setAdminNavbarImage] = useState(false)
    const [currentAdminNavbarImage, setCurrentAdminNavbarImage] = useState('')
    const [adminProfileImage, setAdminProfileImage] = useState(false)
    const [currentAdminProfileImage, setCurrentAdminProfileImage] = useState('')
    const [heroImage, setHeroImage] = useState(false)
    const [currentHeroImage, setCurrentHeroImage] = useState('')
    const [userFavicon, setUserFavicon] = useState(false)
    const [currentUserFavicon, setCurrentUserFavicon] = useState('')
    const [adminFavicon, setAdminFavicon] = useState(false)
    const [currentAdminFavicon, setCurrentAdminFavicon] = useState('')
    const [adminProfile, setAdminProfile] = useState({ name: '', email: '', phone: '', role: '', username: '', password: '', confirmPassword: '' })
    const [adminChanged, setAdminChanged] = useState(false)
    const [changed, setChanged] = useState({})
    const [confirmReset, setConfirmReset] = useState(false)

    useEffect(() => {
        const fetch = async () => {
            const [settingsRes, adminRes] = await Promise.all([
                axios.get(`${url}/api/settings/get`),
                axios.get(`${url}/api/admin/get`)
            ])
            if (settingsRes.data.success) {
                const d = settingsRes.data.data
                setData({
                    restaurantName: d.restaurantName || '',
                    heroTitle: d.heroTitle || '',
                    heroSubtitle: d.heroSubtitle || '',
                    deliveryFee: d.deliveryFee || '',
                    deliveryTime: d.deliveryTime || '',
                    deliveryRadius: d.deliveryRadius || '',
                    maxDeliveryDistance: d.maxDeliveryDistance || 25,
                    footerAbout: d.footerAbout || '',
                    footerCopyright: d.footerCopyright || '',
                    facebookUrl: d.facebookUrl || '',
                    twitterUrl: d.twitterUrl || '',
                    linkedinUrl: d.linkedinUrl || '',
                    appTitle: d.appTitle || '',
                    appSubtitle: d.appSubtitle || '',
                    playStoreUrl: d.playStoreUrl || '',
                    appStoreUrl: d.appStoreUrl || '',
                    razorpayKeyId: d.razorpayKeyId || '',
                    razorpayKeySecret: d.razorpayKeySecret || '',
                    onlinePaymentEnabled: d.onlinePaymentEnabled || false,
                    emailNotificationsEnabled: d.emailNotificationsEnabled !== false,
                    adminEmailNotificationsEnabled: d.adminEmailNotificationsEnabled !== false,
                    whatsappEnabled: d.whatsappEnabled || false,
                    twilioAccountSid: d.twilioAccountSid || '',
                    twilioAuthToken: d.twilioAuthToken || '',
                    twilioWhatsappFrom: d.twilioWhatsappFrom || '',
                    adminWhatsappNumber: d.adminWhatsappNumber || '',
                    smsEnabled: d.smsEnabled || false,
                    twilioSmsFrom: d.twilioSmsFrom || '',
                    adminSmsNumber: d.adminSmsNumber || '',
                    websiteUrl: d.websiteUrl || '',
                    userSiteTitle: d.userSiteTitle || '',
                    adminSiteTitle: d.adminSiteTitle || '',
                    emailUser: d.emailUser || '',
                    emailPass: d.emailPass || '',
                    restaurantLat: d.restaurantLat || 17.3850,
                    restaurantLng: d.restaurantLng || 78.4867,
                    restaurantMapAddress: d.restaurantMapAddress || ''
                })
                setCurrentLogo(d.logo || '')
                setCurrentNavbarImage(d.navbarImage || '')
                setCurrentAdminNavbarImage(d.adminNavbarImage || '')
                setCurrentAdminProfileImage(d.adminProfileImage || '')
                setCurrentHeroImage(d.heroImage || '')
                setCurrentUserFavicon(d.userFavicon || '')
                setCurrentAdminFavicon(d.adminFavicon || '')
            }
            if (adminRes.data.success) {
                const a = adminRes.data.data
                setAdminProfile({ name: a.name || '', email: a.email || '', phone: a.phone || '', role: a.role || '', username: a.username || '', password: '', confirmPassword: '' })
            }
        }
        fetch()
    }, [])

    const markChanged = (section) => setChanged(p => ({ ...p, [section]: true }))

    const save = async (section, fields, images = {}) => {
        const formData = new FormData()
        fields.forEach(k => formData.append(k, data[k] ?? ''))
        Object.entries(images).forEach(([k, v]) => { if (v) formData.append(k, v) })
        const response = await axios.post(`${url}/api/settings/update`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        if (response.data.success) {
            toast.success('Saved!')
            setChanged(p => ({ ...p, [section]: false }))
        } else {
            toast.error(response.data.message)
        }
    }

    const field = (label, key, type = 'text', placeholder = '', section = '') => (
        <div className='settings-field'>
            <p>{label}</p>
            <input value={data[key]} onChange={e => { setData(p => ({ ...p, [key]: e.target.value })); markChanged(section) }} type={type} placeholder={placeholder} />
        </div>
    )

    const imgUpload = (label, id, current, preview, setPreview, section = '') => (
        <div className='settings-field'>
            <p>{label}</p>
            <label htmlFor={id} className='logo-upload-label' style={{ width: id === 'hero-upload' ? '200px' : '100px', height: '100px' }}>
                {preview
                    ? <img src={URL.createObjectURL(preview)} alt='' />
                    : current
                        ? <img src={`${url}/images/${current}`} alt='' />
                        : <span>Click to upload</span>
                }
            </label>
            <input id={id} type='file' hidden onChange={e => { setPreview(e.target.files[0]); markChanged(section) }} />
        </div>
    )

    const SaveBtn = ({ section, onClick }) => (
        changed[section]
            ? <button type='button' className='section-save-btn' onClick={onClick}>Save</button>
            : null
    )

    const saveAdminProfile = async () => {
        if (adminProfile.password && adminProfile.password !== adminProfile.confirmPassword) {
            toast.error('Passwords do not match!')
            return
        }
        if (adminProfile.password && adminProfile.password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }
        const payload = { name: adminProfile.name, email: adminProfile.email, phone: adminProfile.phone, role: adminProfile.role, username: adminProfile.username }
        if (adminProfile.password) payload.password = adminProfile.password
        const response = await axios.post(`${url}/api/admin/update`, payload)
        if (response.data.success) {
            toast.success('Admin profile updated!')
            const stored = JSON.parse(localStorage.getItem('adminData') || '{}')
            localStorage.setItem('adminData', JSON.stringify({ ...stored, ...payload }))
            onAdminUpdate(payload)
            setAdminProfile(p => ({ ...p, password: '', confirmPassword: '' }))
            setAdminChanged(false)
        } else {
            toast.error(response.data.message)
        }
    }

    return (
        <div className='settings'>
            <p className='settings-title'>Site Settings</p>
            <div className='settings-form'>

                <div className='settings-section'>
                    <p className='section-label'>🏪 Restaurant</p>
                    {field('Restaurant Name', 'restaurantName', 'text', 'TutaFoods', 'restaurant')}
                    {field('Website URL (for QR code on receipts)', 'websiteUrl', 'text', 'https://yoursite.com', 'restaurant')}
                    {imgUpload('Logo', 'logo-upload', currentLogo, logo, setLogo, 'restaurant')}
                    <SaveBtn section='restaurant' onClick={() => save('restaurant', ['restaurantName', 'websiteUrl'], { logo })} />
                </div>

                <div className='settings-section'>
                    <p className='section-label'>🌐 Site Title & Favicon</p>
                    {field('User Site Title', 'userSiteTitle', 'text', 'TutaFoods', 'sitetitle')}
                    {field('Admin Panel Title', 'adminSiteTitle', 'text', 'TutaFoods Admin', 'sitetitle')}
                    {imgUpload('User Site Favicon', 'user-favicon-upload', currentUserFavicon, userFavicon, setUserFavicon, 'sitetitle')}
                    {imgUpload('Admin Site Favicon', 'admin-favicon-upload', currentAdminFavicon, adminFavicon, setAdminFavicon, 'sitetitle')}
                    <SaveBtn section='sitetitle' onClick={() => save('sitetitle', ['userSiteTitle', 'adminSiteTitle'], { userFavicon, adminFavicon })} />
                </div>

                <div className='settings-section'>
                    <p className='section-label'>🧭 Navbar</p>
                    {imgUpload('User Navbar Background', 'navbar-upload', currentNavbarImage, navbarImage, setNavbarImage, 'navbar')}
                    {imgUpload('Admin Navbar Background', 'admin-navbar-upload', currentAdminNavbarImage, adminNavbarImage, setAdminNavbarImage, 'navbar')}
                    {imgUpload('Admin Profile Image', 'admin-profile-upload', currentAdminProfileImage, adminProfileImage, setAdminProfileImage, 'navbar')}
                    <p className='section-note'>Logo change kosam above "Restaurant" section lo Logo upload cheyyi</p>
                    <SaveBtn section='navbar' onClick={() => save('navbar', [], { navbarImage, adminNavbarImage, adminProfileImage })} />
                </div>

                <div className='settings-section'>
                    <p className='section-label'>🖼️ Hero Banner</p>
                    {imgUpload('Hero Image', 'hero-upload', currentHeroImage, heroImage, setHeroImage, 'hero')}
                    {field('Hero Title', 'heroTitle', 'text', '', 'hero')}
                    <div className='settings-field'>
                        <p>Hero Subtitle</p>
                        <textarea value={data.heroSubtitle} onChange={e => { setData(p => ({ ...p, heroSubtitle: e.target.value })); markChanged('hero') }} rows={3} />
                    </div>
                    <SaveBtn section='hero' onClick={() => save('hero', ['heroTitle', 'heroSubtitle'], { heroImage })} />
                </div>

                <div className='settings-section'>
                    <p className='section-label'>🚚 Delivery</p>
                    {field('Delivery Fee (₹)', 'deliveryFee', 'number', '', 'delivery')}
                    {field('Delivery Time', 'deliveryTime', 'text', '30-45 minutes', 'delivery')}
                    {field('Max Delivery Distance (km)', 'maxDeliveryDistance', 'number', '25', 'delivery')}
                    <p className='section-note'>ఈ distance కంటే దూరంగా ఉన్న users కి checkout block అవుతుంది</p>
                    <SaveBtn section='delivery' onClick={() => save('delivery', ['deliveryFee', 'deliveryTime', 'maxDeliveryDistance'])} />
                </div>

                <div className='settings-section'>
                    <p className='section-label'>📍 Restaurant Location</p>
                    <p className='section-note'>Google Maps లో నీ restaurant search చేసి, URL లో lat,lng చూడు లేదా right click → "What's here?" చేయి</p>
                    {field('Latitude', 'restaurantLat', 'number', '17.3850', 'location')}
                    {field('Longitude', 'restaurantLng', 'number', '78.4867', 'location')}
                    {field('Address (map popup లో కనపడుతుంది)', 'restaurantMapAddress', 'text', 'e.g. MK Foods, Hyderabad', 'location')}
                    <SaveBtn section='location' onClick={() => save('location', ['restaurantLat', 'restaurantLng', 'restaurantMapAddress'])} />
                </div>

                <div className='settings-section'>
                    <p className='section-label'>📋 Footer</p>
                    <div className='settings-field'>
                        <p>About Text</p>
                        <textarea value={data.footerAbout} onChange={e => { setData(p => ({ ...p, footerAbout: e.target.value })); markChanged('footer') }} rows={3} />
                    </div>
                    {field('Copyright Text', 'footerCopyright', 'text', '', 'footer')}
                    {field('Facebook URL', 'facebookUrl', 'text', 'https://facebook.com/...', 'footer')}
                    {field('Twitter URL', 'twitterUrl', 'text', 'https://twitter.com/...', 'footer')}
                    {field('LinkedIn URL', 'linkedinUrl', 'text', 'https://linkedin.com/...', 'footer')}
                    <SaveBtn section='footer' onClick={() => save('footer', ['footerAbout', 'footerCopyright', 'facebookUrl', 'twitterUrl', 'linkedinUrl'])} />
                </div>

                <div className='settings-section'>
                    <p className='section-label'>📱 App Download</p>
                    {field('App Title', 'appTitle', 'text', 'TUTA APP', 'app')}
                    {field('App Subtitle', 'appSubtitle', 'text', 'Enjoy a Smoother Experience', 'app')}
                    {field('Play Store URL', 'playStoreUrl', 'text', 'https://play.google.com/...', 'app')}
                    {field('App Store URL', 'appStoreUrl', 'text', 'https://apps.apple.com/...', 'app')}
                    <SaveBtn section='app' onClick={() => save('app', ['appTitle', 'appSubtitle', 'playStoreUrl', 'appStoreUrl'])} />
                </div>

                <div className='settings-section'>
                    <p className='section-label'>🔔 Notifications</p>
                    <p className='section-note' style={{fontWeight:600,color:'#555',fontStyle:'normal'}}>📧 Email</p>
                    <p className='section-note'>Gmail App Password కోసం: myaccount.google.com → Security → 2-Step Verification ON → App Passwords → Generate</p>
                    {field('Gmail Address', 'emailUser', 'email', 'your@gmail.com', 'notifications')}
                    {field('Gmail App Password', 'emailPass', 'password', 'xxxx xxxx xxxx xxxx', 'notifications')}
                    <div className='settings-field payment-toggle-field'>
                        <p>Customer Order Confirmation Email</p>
                        <label className='toggle-switch'>
                            <input type='checkbox' checked={data.emailNotificationsEnabled} onChange={e => { setData(p => ({ ...p, emailNotificationsEnabled: e.target.checked })); markChanged('notifications') }} />
                            <span className='toggle-slider'></span>
                        </label>
                        <span className={`toggle-label ${data.emailNotificationsEnabled ? 'on' : 'off'}`}>{data.emailNotificationsEnabled ? '✅ On' : '❌ Off'}</span>
                    </div>
                    <div className='settings-field payment-toggle-field'>
                        <p>Admin New Order Email Alert</p>
                        <label className='toggle-switch'>
                            <input type='checkbox' checked={data.adminEmailNotificationsEnabled} onChange={e => { setData(p => ({ ...p, adminEmailNotificationsEnabled: e.target.checked })); markChanged('notifications') }} />
                            <span className='toggle-slider'></span>
                        </label>
                        <span className={`toggle-label ${data.adminEmailNotificationsEnabled ? 'on' : 'off'}`}>{data.adminEmailNotificationsEnabled ? '✅ On' : '❌ Off'}</span>
                    </div>
                    <p className='section-note' style={{fontWeight:600,color:'#555',fontStyle:'normal',marginTop:8}}>💬 WhatsApp (Twilio)</p>
                    <p className='section-note'>twilio.com lo free account create cheyyi → WhatsApp Sandbox enable cheyyi</p>
                    <div className='settings-field payment-toggle-field'>
                        <p>Enable WhatsApp Notifications</p>
                        <label className='toggle-switch'>
                            <input type='checkbox' checked={data.whatsappEnabled} onChange={e => { setData(p => ({ ...p, whatsappEnabled: e.target.checked })); markChanged('notifications') }} />
                            <span className='toggle-slider'></span>
                        </label>
                        <span className={`toggle-label ${data.whatsappEnabled ? 'on' : 'off'}`}>{data.whatsappEnabled ? '✅ On' : '❌ Off'}</span>
                    </div>
                    {field('Twilio Account SID', 'twilioAccountSid', 'text', 'ACxxxxxxxxxxxxxxxx', 'notifications')}
                    {field('Twilio Auth Token', 'twilioAuthToken', 'password', 'Enter Auth Token', 'notifications')}
                    {field('Twilio WhatsApp From', 'twilioWhatsappFrom', 'text', 'whatsapp:+14155238886', 'notifications')}
                    {field('Admin WhatsApp Number', 'adminWhatsappNumber', 'text', '+919999999999', 'notifications')}
                    <SaveBtn section='notifications' onClick={() => save('notifications', ['emailUser','emailPass','emailNotificationsEnabled','adminEmailNotificationsEnabled','whatsappEnabled','twilioAccountSid','twilioAuthToken','twilioWhatsappFrom','adminWhatsappNumber'])} />
                </div>

                <div className='settings-section'>
                    <p className='section-label'>💳 Payment (Razorpay)</p>
                    <p className='section-note'>razorpay.com lo free account create cheyyi. Test keys tho start cheyyochu.</p>
                    <div className='settings-field'>
                        <p>Razorpay Key ID <span style={{color:'#aaa',fontWeight:400}}>(starts with rzp_)</span></p>
                        <input value={data.razorpayKeyId} onChange={e => { setData(p => ({ ...p, razorpayKeyId: e.target.value })); markChanged('payment') }} type='text' placeholder='rzp_test_xxxxxxxxxxxx' />
                    </div>
                    <div className='settings-field'>
                        <p>Razorpay Key Secret</p>
                        <input value={data.razorpayKeySecret} onChange={e => { setData(p => ({ ...p, razorpayKeySecret: e.target.value })); markChanged('payment') }} type='password' placeholder='Enter Key Secret' />
                    </div>
                    <div className='settings-field payment-toggle-field'>
                        <p>Enable Online Payments (UPI / GPay / PhonePe / Card)</p>
                        <label className='toggle-switch'>
                            <input type='checkbox' checked={data.onlinePaymentEnabled} onChange={e => { setData(p => ({ ...p, onlinePaymentEnabled: e.target.checked })); markChanged('payment') }} />
                            <span className='toggle-slider'></span>
                        </label>
                        <span className={`toggle-label ${data.onlinePaymentEnabled ? 'on' : 'off'}`}>{data.onlinePaymentEnabled ? '✅ Enabled' : '❌ Disabled'}</span>
                    </div>
                    <SaveBtn section='payment' onClick={() => save('payment', ['razorpayKeyId', 'razorpayKeySecret', 'onlinePaymentEnabled'])} />
                </div>

                <div className='settings-section'>
                    <p className='section-label'>📱 SMS Notifications (Twilio)</p>
                    <p className='section-note'>Same Twilio account use cheyyochu. SMS kosam verified number kavali.</p>
                    <div className='settings-field payment-toggle-field'>
                        <p>Enable SMS Notifications</p>
                        <label className='toggle-switch'>
                            <input type='checkbox' checked={data.smsEnabled} onChange={e => { setData(p => ({ ...p, smsEnabled: e.target.checked })); markChanged('sms') }} />
                            <span className='toggle-slider'></span>
                        </label>
                        <span className={`toggle-label ${data.smsEnabled ? 'on' : 'off'}`}>{data.smsEnabled ? '✅ On' : '❌ Off'}</span>
                    </div>
                    {field('Twilio SMS From Number', 'twilioSmsFrom', 'text', '+1XXXXXXXXXX', 'sms')}
                    {field('Admin SMS Number', 'adminSmsNumber', 'text', '+919999999999', 'sms')}
                    <SaveBtn section='sms' onClick={() => save('sms', ['smsEnabled', 'twilioSmsFrom', 'adminSmsNumber'])} />
                </div>

                <div className='settings-section'>
                    <p className='section-label'>👤 Admin Profile</p>
                    <div className='settings-field'>
                        <p>Name</p>
                        <input value={adminProfile.name} onChange={e => { setAdminProfile(p => ({ ...p, name: e.target.value })); setAdminChanged(true) }} type='text' placeholder='Admin Name' />
                    </div>
                    <div className='settings-field'>
                        <p>Email (used for Forgot Password OTP)</p>
                        <input value={adminProfile.email} onChange={e => { setAdminProfile(p => ({ ...p, email: e.target.value })); setAdminChanged(true) }} type='email' placeholder='admin@email.com' />
                    </div>
                    <div className='settings-field'>
                        <p>Phone</p>
                        <input value={adminProfile.phone} onChange={e => { setAdminProfile(p => ({ ...p, phone: e.target.value })); setAdminChanged(true) }} type='text' placeholder='+91 99999 99999' />
                    </div>
                    <div className='settings-field'>
                        <p>Role</p>
                        <input value={adminProfile.role} onChange={e => { setAdminProfile(p => ({ ...p, role: e.target.value })); setAdminChanged(true) }} type='text' placeholder='Administrator' />
                    </div>
                    <div className='settings-field'>
                        <p>Username (for login)</p>
                        <input value={adminProfile.username} onChange={e => { setAdminProfile(p => ({ ...p, username: e.target.value })); setAdminChanged(true) }} type='text' placeholder='admin' />
                    </div>
                    <div className='settings-field'>
                        <p>New Password <span style={{color:'#aaa',fontWeight:400}}>(leave blank to keep current)</span></p>
                        <input value={adminProfile.password} onChange={e => { setAdminProfile(p => ({ ...p, password: e.target.value })); setAdminChanged(true) }} type='password' placeholder='New password (min 6)' />
                    </div>
                    <div className='settings-field'>
                        <p>Confirm New Password</p>
                        <input value={adminProfile.confirmPassword} onChange={e => { setAdminProfile(p => ({ ...p, confirmPassword: e.target.value })); setAdminChanged(true) }} type='password' placeholder='Confirm new password' />
                    </div>
                    {adminChanged && <button type='button' className='section-save-btn' onClick={saveAdminProfile}>Save Profile</button>}
                </div>

                <div className='settings-section'>
                    <p className='section-label'>⚠️ Danger Zone</p>
                    <p className='section-note' style={{color:'#e74c3c',fontStyle:'normal'}}>Idi click chestinapudu anni orders, users, food items, categories, promos anni permanently delete avutayi. Settings and admin account safe ga untayi.</p>
                    {!confirmReset
                        ? <button type='button' className='reset-btn' onClick={() => setConfirmReset(true)}>🗑️ Clear All Data (Fresh Start)</button>
                        : <div className='reset-confirm-box'>
                            <p>🔴 Meeru confirm chestunnara? Anni data permanently delete avutundi!</p>
                            <div style={{display:'flex',gap:'10px',marginTop:'10px'}}>
                                <button type='button' className='reset-btn' onClick={async () => {
                                    try {
                                        const response = await axios.post(`${url}/api/admin/full-reset`)
                                        if (response.data.success) {
                                            localStorage.setItem('activeOrderCount', '0')
                                            toast.success('✅ All data cleared! Fresh start ready.')
                                            setConfirmReset(false)
                                            setTimeout(() => navigate('/dashboard'), 1500)
                                        } else {
                                            toast.error(response.data.message)
                                        }
                                    } catch (e) {
                                        toast.error('Reset failed: ' + e.message)
                                    }
                                }}>Yes, Clear Everything</button>
                                <button type='button' className='section-save-btn' style={{background:'#aaa'}} onClick={() => setConfirmReset(false)}>Cancel</button>
                            </div>
                          </div>
                    }
                </div>

            </div>
        </div>
    )
}

export default Settings
