import React, { useState, useEffect } from 'react'
import './Categories.css'
import { assets } from '../../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const Categories = ({ url }) => {
    const [image, setImage] = useState(false)
    const [name, setName] = useState('')
    const [list, setList] = useState([])
    const [editId, setEditId] = useState(null)
    const [editName, setEditName] = useState('')
    const [editImage, setEditImage] = useState(false)

    const fetchCategories = async () => {
        const response = await axios.get(`${url}/api/category/list`)
        if (response.data.success) setList(response.data.data)
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('name', name)
        formData.append('image', image)
        const response = await axios.post(`${url}/api/category/add`, formData)
        if (response.data.success) {
            toast.success(response.data.message)
            setName('')
            setImage(false)
            fetchCategories()
        } else {
            toast.error(response.data.message)
        }
    }

    const removeCategory = async (id) => {
        const response = await axios.post(`${url}/api/category/remove`, { id })
        if (response.data.success) {
            toast.success(response.data.message)
            fetchCategories()
        } else {
            toast.error(response.data.message)
        }
    }

    const startEdit = (item) => {
        setEditId(item._id)
        setEditName(item.name)
        setEditImage(false)
    }

    const cancelEdit = () => {
        setEditId(null)
        setEditName('')
        setEditImage(false)
    }

    const saveEdit = async (id) => {
        const formData = new FormData()
        formData.append('id', id)
        formData.append('name', editName)
        if (editImage) formData.append('image', editImage)
        const response = await axios.post(`${url}/api/category/edit`, formData)
        if (response.data.success) {
            toast.success(response.data.message)
            cancelEdit()
            fetchCategories()
        } else {
            toast.error(response.data.message)
        }
    }

    useEffect(() => { fetchCategories() }, [])

    return (
        <div className='categories'>
            <div className='categories-add'>
                <p className='categories-title'>Add Category</p>
                <form onSubmit={onSubmitHandler} className='categories-form'>
                    <div className='cat-img-upload'>
                        <label htmlFor='cat-image'>
                            <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt='' />
                        </label>
                        <input onChange={(e) => setImage(e.target.files[0])} type='file' id='cat-image' hidden required />
                        <p>Upload Image</p>
                    </div>
                    <div className='cat-name'>
                        <p>Category Name</p>
                        <input value={name} onChange={(e) => setName(e.target.value)} type='text' placeholder='e.g. Biryani' required />
                    </div>
                    <button type='submit'>Add</button>
                </form>
            </div>

            <div className='categories-list'>
                <p className='categories-title'>All Categories</p>
                <div className='cat-list-header'>
                    <b>Image</b><b>Name</b><b>Actions</b>
                </div>
                {list.map((item) => (
                    <div key={item._id} className={`cat-list-row ${editId === item._id ? 'cat-list-row-edit' : ''}`}>
                        {editId === item._id ? (
                            <>
                                <label htmlFor={`edit-img-${item._id}`} className='cat-edit-img-label'>
                                    <img
                                        src={editImage ? URL.createObjectURL(editImage) : `${url}/images/${item.image}`}
                                        alt={item.name}
                                    />
                                    <span className='cat-edit-img-hint'>Click to change</span>
                                </label>
                                <input type='file' id={`edit-img-${item._id}`} hidden onChange={e => setEditImage(e.target.files[0])} />
                                <input
                                    className='cat-edit-input'
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    autoFocus
                                />
                                <div className='cat-edit-actions'>
                                    <button type='button' className='cat-save-btn' onClick={() => saveEdit(item._id)}>✔ Save</button>
                                    <button type='button' className='cat-cancel-btn' onClick={cancelEdit}>✕ Cancel</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <img src={`${url}/images/${item.image}`} alt={item.name} />
                                <p>{item.name}</p>
                                <div className='cat-actions'>
                                    <span className='cat-edit' onClick={() => startEdit(item)}>✏️ Edit</span>
                                    <span className='cat-remove' onClick={() => removeCategory(item._id)}>🗑️</span>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Categories
