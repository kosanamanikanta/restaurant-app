import React, { useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContent } from '../../Components/context/StoreContext'
import axios from 'axios'
import './Verify.css'

const Verify = () => {
    const [searchParams] = useSearchParams()
    const success = searchParams.get('success')
    const orderId = searchParams.get('orderId')
    const { url, setCartItems } = useContext(StoreContent)
    const navigate = useNavigate()

    useEffect(() => {
        const verifyPayment = async () => {
            const response = await axios.post(url + '/api/order/verify', { success, orderId })
            if (response.data.success) {
                setCartItems({})
                navigate('/myorders')
            } else {
                navigate('/')
            }
        }
        verifyPayment()
    }, [])

    return (
        <div className='verify'>
            <div className='verify-spinner'></div>
        </div>
    )
}

export default Verify
