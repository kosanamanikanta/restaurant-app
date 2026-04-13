import React, { useEffect, useState } from 'react'
import './List.css'
import axios from 'axios'
import { toast } from 'react-toastify'

const List = ({ url }) => {
    const [list, setList] = useState([])
    const [editItem, setEditItem] = useState(null)
    const [editData, setEditData] = useState({})
    const [editImage, setEditImage] = useState(false)
    const [categories, setCategories] = useState([])

    const fetchList = async () => {
        const response = await axios.get(`${url}/api/food/list`)
        if (response.data.success) setList(response.data.data)
    }

    const fetchCategories = async () => {
        const response = await axios.get(`${url}/api/category/list`)
        if (response.data.success) setCategories(response.data.data)
    }

    const removeFood = async (foodId) => {
        const response = await axios.post(`${url}/api/food/remove`, { id: foodId })
        await fetchList()
        if (response.data.success) toast.success(response.data.message)
        else toast.error("error")
    }

    const openEdit = (item) => {
        setEditItem(item._id)
        setEditData({ name: item.name, description: item.description, price: item.price, category: item.category, discount: item.discount || 0, discountType: item.discountType || 'percent' })
        setEditImage(false)
    }

    const saveEdit = async () => {
        const formData = new FormData()
        formData.append('id', editItem)
        Object.entries(editData).forEach(([k, v]) => formData.append(k, v))
        if (editImage) formData.append('image', editImage)
        const response = await axios.post(`${url}/api/food/edit`, formData)
        if (response.data.success) {
            toast.success(response.data.message)
            setEditItem(null)
            fetchList()
        } else {
            toast.error(response.data.message)
        }
    }

    useEffect(() => { fetchList(); fetchCategories() }, [])

    return (
        <div className='list'>
            <p className='list-title'>All Foods List</p>
            <div className='list-table'>
                <div className='list-table-format title'>
                    <b>Image</b><b>Name</b><b>Category</b><b>Price</b><b>Discount</b><b>Action</b>
                </div>
                {list.map((item) => (
                    <div key={item._id}>
                        {editItem === item._id ? (
                        <div className='list-edit-row'>
                                <div className='edit-img-wrap'>
                                    <label htmlFor='edit-img'>
                                        <img src={editImage ? URL.createObjectURL(editImage) : `${url}/images/${item.image}`} alt='' />
                                    </label>
                                    <input id='edit-img' type='file' hidden onChange={e => setEditImage(e.target.files[0])} />
                                </div>
                                <input value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} placeholder='Name' />
                                <select value={editData.category} onChange={e => setEditData(p => ({ ...p, category: e.target.value }))}>
                                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                </select>
                                <input value={editData.price} onChange={e => setEditData(p => ({ ...p, price: e.target.value }))} type='number' placeholder='Price' />
                                <div className='discount-edit-wrap'>
                                    <input value={editData.discount ?? 0} onChange={e => setEditData(p => ({ ...p, discount: e.target.value }))} type='number' placeholder='Discount' min='0' />
                                    <button type='button' className='discount-toggle-btn' onClick={() => setEditData(p => ({ ...p, discountType: p.discountType === 'percent' ? 'flat' : 'percent' }))}>
                                        {editData.discountType === 'percent' ? '%' : '₹'}
                                    </button>
                                </div>
                                <div className='edit-actions'>
                                    <button onClick={saveEdit} className='save-btn'>Save</button>
                                    <button onClick={() => setEditItem(null)} className='cancel-btn'>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className='list-table-format'>
                                <img src={`${url}/images/${item.image}`} alt={item.name} />
                                <p>{item.name}</p>
                                <p>{item.category}</p>
                                <p>₹{item.price}</p>
                                <p>{item.discount > 0 ? `${item.discount}${item.discountType === 'flat' ? '₹' : '%'} off` : '-'}</p>
                                <div className='list-actions'>
                                    <span onClick={() => openEdit(item)} className='edit-btn'>Edit</span>
                                    <span onClick={() => removeFood(item._id)} className='cursor'>X</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default List
