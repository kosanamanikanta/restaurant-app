import React, { useState, useEffect } from 'react'
import './Add.css'
import { assets } from '../../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const Add = ({url}) => {
    const [image, setImage] = useState(false)
    const [categories, setCategories] = useState([])
    const [data, setData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        discount: '',
        discountType: 'percent'
    })

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${url}/api/category/list`)
            if (response.data.success && response.data.data.length > 0) {
                setCategories(response.data.data)
                setData(prev => ({ ...prev, category: response.data.data[0].name }))
            }
        } catch (error) {}
    }

    useEffect(() => { fetchCategories() }, [])

    const onChangeHandler = (e) => {
        const { name, value } = e.target
        setData(prev => ({ ...prev, [name]: value }))
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('description', data.description)
        formData.append('price', Number(data.price))
        formData.append('category', data.category)
        formData.append('discount', Number(data.discount) || 0)
        formData.append('discountType', data.discountType || 'percent')
        formData.append('image', image)
        try {
            const response = await axios.post(`${url}/api/food/add`, formData)
            if (response.data.success) {
                setData({ name: '', description: '', price: '', category: 'Salad', discount: '', discountType: 'percent' })
                setImage(false)
                toast.success(response.data.message)
            } else {
               toast.error(response.data.message)
            }
        } catch (error) {
            alert('Server Error: ' + error.message)
            console.log(error)
        }
    }

    return (
        <div className='add'>
            <form className='add-form' onSubmit={onSubmitHandler}>
                <div className='add-img-upload'>
                    <p>Upload Image</p>
                    <label htmlFor='image'>
                        <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt=''/>
                    </label>
                    <input onChange={(e) => setImage(e.target.files[0])} type='file' id='image' hidden required/>
                </div>
                <div className='add-product-name'>
                    <p>Product Name</p>
                    <input onChange={onChangeHandler} value={data.name} type='text' name='name' placeholder='Type here' required/>
                </div>
                <div className='add-product-desc'>
                    <p>Product Description</p>
                    <textarea onChange={onChangeHandler} value={data.description} name='description' rows={6} placeholder='Write content here' required/>
                </div>
                <div className='add-category-price'>
                    <div className='add-category'>
                        <p>Product Category</p>
                        <select onChange={onChangeHandler} name='category' value={data.category}>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className='add-price'>
                        <p>Product Price</p>
                        <input onChange={onChangeHandler} value={data.price} type='number' name='price' placeholder='₹20' required/>
                    </div>
                </div>
                <div className='add-discount-row'>
                    <p>Discount <span className='add-discount-hint'>(optional)</span></p>
                    <div className='add-discount-wrap'>
                        <input onChange={onChangeHandler} value={data.discount} type='number' name='discount' placeholder='Enter value' min='0' autoComplete='off' />
                        <button type='button' className='add-discount-toggle' onClick={() => setData(prev => ({ ...prev, discountType: prev.discountType === 'percent' ? 'flat' : 'percent' }))}>
                            {data.discountType === 'percent' ? '%' : '₹'}
                        </button>
                        {data.discount > 0 && data.price > 0 && (
                            <span className='add-discount-preview'>
                                = ₹{data.discountType === 'flat'
                                    ? Math.max(0, data.price - data.discount)
                                    : Math.round(data.price - (data.price * data.discount / 100))}
                            </span>
                        )}
                    </div>
                </div>
                <button type='submit'>ADD</button>
            </form>
        </div>
    )
}

export default Add
