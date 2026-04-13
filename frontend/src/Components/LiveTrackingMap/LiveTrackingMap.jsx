import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { io } from 'socket.io-client'
import 'leaflet/dist/leaflet.css'
import './LiveTrackingMap.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const deliveryIcon = L.divIcon({
    html: '<div class="delivery-marker">🚚</div>',
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
})

const MoveMap = ({ pos }) => {
    const map = useMap()
    useEffect(() => { if (pos) map.panTo(pos) }, [pos, map])
    return null
}

async function getRoute(from, to) {
    try {
        const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`)
        const d = await r.json()
        if (d.routes?.[0]) return {
            coords: d.routes[0].geometry.coordinates.map(c => [c[1], c[0]]),
            distKm: d.routes[0].distance / 1000,
            durMin: Math.round(d.routes[0].duration / 60)
        }
    } catch (e) {}
    return null
}

function haversineKm(a, b) {
    const R = 6371, dLat = (b[0] - a[0]) * Math.PI / 180, dLng = (b[1] - a[1]) * Math.PI / 180
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

const LiveTrackingMap = ({ order, url, settings }) => {
    const [arrived, setArrived] = useState(false)

    const [deliveryPos, setDeliveryPos] = useState(
        order.deliveryBoyLat && order.deliveryBoyLng
            ? [order.deliveryBoyLat, order.deliveryBoyLng]
            : null
    )
    const [deliveryBoyName, setDeliveryBoyName] = useState(order.deliveryBoyName || '')
    const [customerPos, setCustomerPos] = useState(null)
    const [route, setRoute] = useState(null)
    const socketRef = useRef(null)
    const deliveryPosRef = useRef(deliveryPos)

    useEffect(() => { deliveryPosRef.current = deliveryPos }, [deliveryPos])

    // geocode customer address
    useEffect(() => {
        const addr = order.address
        if (!addr) return
        const q = encodeURIComponent(`${addr.street}, ${addr.city}, ${addr.state}, India`)
        fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`)
            .then(r => r.json())
            .then(data => {
                if (data.length > 0) {
                    setCustomerPos([parseFloat(data[0].lat), parseFloat(data[0].lon)])
                } else {
                    // fallback — city only
                    const q2 = encodeURIComponent(`${addr.city}, ${addr.state}, India`)
                    return fetch(`https://nominatim.openstreetmap.org/search?q=${q2}&format=json&limit=1`)
                        .then(r => r.json())
                        .then(d2 => { if (d2.length > 0) setCustomerPos([parseFloat(d2[0].lat), parseFloat(d2[0].lon)]) })
                }
            })
            .catch(() => {})
    }, [order._id])

    // fetch OSRM route when both positions available
    useEffect(() => {
        if (!deliveryPos || !customerPos) return
        getRoute(deliveryPos, customerPos).then(r => setRoute(r))
    }, [JSON.stringify(deliveryPos), JSON.stringify(customerPos)])

    // socket for live updates
    useEffect(() => {
        socketRef.current = io(url)
        socketRef.current.emit('join-order', order._id)
        socketRef.current.on('location-update', ({ lat, lng, deliveryBoyName: name }) => {
            setDeliveryPos([lat, lng])
            if (name) setDeliveryBoyName(name)
        })
        socketRef.current.on('delivery-arrived', () => setArrived(true))
        return () => {
            socketRef.current.emit('leave-order', order._id)
            socketRef.current.disconnect()
        }
    }, [order._id, url])

    const restLat = settings?.restaurantLat || 17.3850
    const restLng = settings?.restaurantLng || 78.4867
    const center = deliveryPos || customerPos || [restLat, restLng]

    const distKm = deliveryPos && customerPos ? haversineKm(deliveryPos, customerPos) : null
    const distLabel = distKm !== null
        ? distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`
        : null

    if (arrived) {
        return (
            <div className='arrived-wrap'>
                <div className='arrived-icon'>🛵</div>
                <h3>Delivery Partner Arrived!</h3>
                <p>🚚 {deliveryBoyName || 'Your delivery partner'} has reached your location</p>
            </div>
        )
    }

    return (
        <div className='live-map-wrap'>
            <div className='live-map-header'>
                <span className='live-dot'/>
                <span>Live Tracking</span>
                {deliveryBoyName && <span className='delivery-boy-name'>🚚 {deliveryBoyName}</span>}
                {!deliveryPos && <span className='waiting-msg'>⏳ Waiting for delivery boy...</span>}
            </div>

            <MapContainer center={center} zoom={14} className='live-map' scrollWheelZoom={false}>
                <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'/>
                {deliveryPos && <MoveMap pos={deliveryPos}/>}

                {deliveryPos && (
                    <Marker position={deliveryPos} icon={deliveryIcon}>
                        <Popup>🚚 {deliveryBoyName || 'Delivery Boy'}</Popup>
                    </Marker>
                )}

                {customerPos && (
                    <Marker position={customerPos}>
                        <Popup>🏠 Your Location<br/>{order.address?.street}, {order.address?.city}</Popup>
                    </Marker>
                )}

                {deliveryPos && customerPos && (
                    <Polyline
                        positions={route ? route.coords : [deliveryPos, customerPos]}
                        color='tomato' weight={4}
                        dashArray={route ? undefined : '8,6'}
                    />
                )}
            </MapContainer>

            {deliveryPos && customerPos && (
                <div className='live-distance-row'>
                    <span>📍 {distLabel} away</span>
                    {route ? <b>~{route.durMin} min · {distLabel}</b> : <b>{distLabel}</b>}
                </div>
            )}

            {!deliveryPos && (
                <div className='live-waiting-bar'>
                    <div className='live-skeleton'/>
                    <p>Delivery boy location updating soon...</p>
                </div>
            )}
        </div>
    )
}

export default LiveTrackingMap
