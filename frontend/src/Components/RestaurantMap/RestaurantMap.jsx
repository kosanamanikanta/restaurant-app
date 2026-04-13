import React, { useContext, useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './RestaurantMap.css'
import { StoreContent } from '../context/StoreContext'
import axios from 'axios'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const ChangeView = ({ center }) => {
    const map = useMap()
    useEffect(() => { map.setView(center, 15) }, [center])
    return null
}

const RestaurantMap = () => {
    const { url } = useContext(StoreContent)
    const [pos, setPos] = useState({ lat: 12.8754, lng: 80.2216, address: 'Our Restaurant' })

    useEffect(() => {
        axios.get(`${url}/api/settings/get`).then(res => {
            if (res.data.success) {
                const d = res.data.data
                setPos({
                    lat: Number(d.restaurantLat) || 12.8754,
                    lng: Number(d.restaurantLng) || 80.2216,
                    address: d.restaurantMapAddress || d.restaurantName || 'Our Restaurant'
                })
            }
        }).catch(() => {})
    }, [])

    return (
        <div className='restaurant-map-wrap'>
            <h2>📍 Find Us</h2>
            <MapContainer center={[pos.lat, pos.lng]} zoom={15} className='restaurant-map'>
                <ChangeView center={[pos.lat, pos.lng]} />
                <TileLayer
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    attribution='© OpenStreetMap'
                />
                <Marker position={[pos.lat, pos.lng]}>
                    <Popup>
                        {pos.address}<br/>
                        <a href={`https://www.google.com/maps?q=${pos.lat},${pos.lng}`} target='_blank' rel='noreferrer' style={{color:'tomato',fontWeight:600}}>Open in Google Maps →</a>
                    </Popup>
                </Marker>
            </MapContainer>
            {pos.address && <p className='restaurant-map-address'>📍 {pos.address}</p>}
        </div>
    )
}

export default RestaurantMap
