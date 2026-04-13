import React, { useState, useEffect } from 'react'
import './Promos.css'
import axios from 'axios'
import { toast } from 'react-toastify'

const Promos = ({ url }) => {
    const [list, setList] = useState([])
    const [data, setData] = useState({ code: '', discount: '', type: 'percent' })

    const fetchPromos = async () => {
        const response = await axios.get(`${url}/api/promo/list`)
        if (response.data.success) setList(response.data.data)
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        const response = await axios.post(`${url}/api/promo/add`, data)
        if (response.data.success) {
            toast.success(response.data.message)
            setData({ code: '', discount: '', type: 'percent' })
            fetchPromos()
        } else {
            toast.error(response.data.message)
        }
    }

    const removePromo = async (id) => {
        const response = await axios.post(`${url}/api/promo/remove`, { id })
        if (response.data.success) {
            toast.success(response.data.message)
            fetchPromos()
        }
    }

    useEffect(() => { fetchPromos() }, [])

    return (
        <div className='promos'>
            <div className='promos-add'>
                <p className='promos-title'>Add Promo Code</p>
                <form onSubmit={onSubmit} className='promos-form'>
                    <div className='promo-field'>
                        <p>Code</p>
                        <input value={data.code} onChange={e => setData(p => ({ ...p, code: e.target.value }))} type='text' placeholder='e.g. SAVE20' required />
                    </div>
                    <div className='promo-field'>
                        <p>Discount</p>
                        <input value={data.discount} onChange={e => setData(p => ({ ...p, discount: e.target.value }))} type='number' placeholder='e.g. 20' required />
                    </div>
                    <div className='promo-field'>
                        <p>Type</p>
                        <select value={data.type} onChange={e => setData(p => ({ ...p, type: e.target.value }))}>
                            <option value='percent'>Percent (%)</option>
                            <option value='flat'>Flat (₹)</option>
                        </select>
                    </div>
                    <button type='submit'>Add</button>
                </form>
            </div>

            <div className='promos-list'>
                <p className='promos-title'>All Promo Codes</p>
                <div className='promo-list-header'>
                    <b>Code</b><b>Discount</b><b>Type</b><b>Action</b>
                </div>
                {list.map(item => (
                    <div key={item._id} className='promo-list-row'>
                        <p className='promo-code-badge'>{item.code}</p>
                        <p>{item.discount}{item.type === 'percent' ? '%' : '₹'} off</p>
                        <p>{item.type === 'percent' ? 'Percentage' : 'Flat'}</p>
                        <p onClick={() => removePromo(item._id)} className='promo-remove'>X</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Promos
