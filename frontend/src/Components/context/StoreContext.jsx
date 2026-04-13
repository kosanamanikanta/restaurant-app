import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { food_list as staticFoodList, menu_list as staticMenuList } from "../../assets/assets";
import { toast } from "react-toastify";

export const StoreContent= createContext(null)

const StoreContextProvider=(props)=>{
    const [cartItems, setCartItems] = useState({})
    const url = import.meta.env.VITE_API_URL || "http://localhost:4000"
    const [token, setToken] = useState(localStorage.getItem("token") || "")
    const [food_list, setFood_list] = useState(staticFoodList)
    const [menu_list, setMenu_list] = useState(staticMenuList)
    const [searchQuery, setSearchQuery] = useState('')
    const [settings, setSettings] = useState({
        restaurantName: 'TutaFoods',
        heroTitle: 'Order your favourite food here!',
        heroSubtitle: 'Choose from a diverse range of delicious dishes created by our expert chefs.',
        deliveryFee: 38,
        deliveryTime: '30-45 minutes',
        logo: ''
    })
    const [paymentConfig, setPaymentConfig] = useState({ razorpayKeyId: '', onlinePaymentEnabled: false })
    const [deliveryDistance, setDeliveryDistance] = useState(null)
    const [locationError, setLocationError] = useState('')
    const [userCoords, setUserCoords] = useState(null)

    const addToCart = async(itemId) => {
        if (!cartItems[itemId]) {
            setCartItems(prev => ({ ...prev, [itemId]: 1 }))
        } else {
            setCartItems(prev => ({ ...prev, [itemId]: prev[itemId] + 1 }))
        }
        const item = food_list.find(f => f._id === itemId)
        if (item) toast.success(`${item.name} added to cart! 🛒`, { autoClose: 1500 })
        if(token){
            await axios.post(url+"/api/cart/add",{itemId},{headers:{token}})
        }
    }

    const removeFromCart = async(itemId) => {
        setCartItems(prev => ({ ...prev, [itemId]: prev[itemId] > 1 ? prev[itemId] - 1 : 0 }))
        const item = food_list.find(f => f._id === itemId)
        if (item && cartItems[itemId] > 0) toast.info(`${item.name} removed 🗑️`, { autoClose: 1200 })
        if(token){
            await axios.post(url+"/api/cart/remove", {itemId}, {headers:{token}})
        }
    }




    const getTotalCartAmount = () => {
        let total = 0
        food_list.forEach(item => {
            if (cartItems[item._id] > 0) {
                total += item.price * cartItems[item._id]
            }
        })
        return total
    }

    const fetchFoodList = async () => {
        try {
            const response = await axios.get(url + "/api/food/list")
            if (response.data.success && response.data.data.length > 0) {
                setFood_list(response.data.data)
            } else {
                setFood_list(staticFoodList)
            }
        } catch (error) {
            setFood_list(staticFoodList)
        }
    }

    const fetchMenuList = async () => {
        try {
            const response = await axios.get(url + "/api/category/list")
            if (response.data.success && response.data.data.length > 0) {
                setMenu_list(response.data.data.map(c => ({ menu_name: c.name, menu_image: `${url}/images/${c.image}` })))
            } else {
                setMenu_list(staticMenuList)
            }
        } catch (error) {
            setMenu_list(staticMenuList)
        }
    }

    const fetchSettings = async () => {
        try {
            const [settingsRes, contactRes, paymentRes] = await Promise.all([
                axios.get(url + "/api/settings/get"),
                axios.get(url + "/api/contact/get").catch(() => ({ data: { success: false } })),
                axios.get(url + "/api/settings/payment-config").catch(() => ({ data: { success: false } }))
            ])
            if (settingsRes.data.success) {
                const s = settingsRes.data.data
                const c = contactRes.data.success ? contactRes.data.data : {}
                setSettings({ ...s, phone: c.phone, email: c.email, address: c.address })
            }
            if (paymentRes.data.success) {
                setPaymentConfig({ razorpayKeyId: paymentRes.data.razorpayKeyId, onlinePaymentEnabled: paymentRes.data.onlinePaymentEnabled })
            }
        } catch (error) {}
    }

    const calcDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLng = (lng2 - lng1) * Math.PI / 180
        const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    }

    const getUserLocation = () => {
        if (!navigator.geolocation) { setLocationError('Geolocation not supported'); return }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords
                setUserCoords({ lat: latitude, lng: longitude })
                setLocationError('')
            },
            () => setLocationError('Location access denied')
        )
    }

    useEffect(() => {
        if (!userCoords || !settings.restaurantLat || !settings.restaurantLng) return
        const dist = calcDistance(userCoords.lat, userCoords.lng, settings.restaurantLat, settings.restaurantLng)
        setDeliveryDistance(dist)
    }, [userCoords, settings.restaurantLat, settings.restaurantLng])

    const loadCartData = async()=>{
        if(token){
            const response = await axios.post(url+"/api/cart/get",{}, {headers:{token}})
            if (!response.data.success && response.data.message === 'Not Authorized') {
                setToken('')
                setCartItems({})
                localStorage.removeItem('token')
            } else {
                setCartItems(response.data.cartData || {})
            }
        }
    }

    useEffect(() => {
        async function loadData() {
            await fetchFoodList()
            await fetchMenuList()
            await fetchSettings()
            if (localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"))
                await loadCartData(localStorage.getItem("token"))
            }
        }
        loadData()
        const interval = setInterval(() => {
            fetchFoodList()
            fetchMenuList()
            fetchSettings()
        }, 5000)
        // socket — admin clear all data అయితే logout చేయి
        const socket = io(url)
        socket.on('orders-cleared', () => {
            setToken('')
            setCartItems({})
            localStorage.removeItem('token')
            toast.info('Session expired. Please login again.')
        })
        return () => { clearInterval(interval); socket.disconnect() }
    }, [])

    const contextValue = { food_list, menu_list, cartItems, setCartItems, addToCart, removeFromCart, getTotalCartAmount, url, token, setToken, searchQuery, setSearchQuery, settings, paymentConfig, deliveryDistance, locationError, getUserLocation }

    return <StoreContent.Provider value={contextValue}>
        {props.children}
        </StoreContent.Provider>
}
export default StoreContextProvider;