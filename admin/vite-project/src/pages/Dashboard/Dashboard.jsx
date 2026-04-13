import React, { useEffect, useState } from 'react'
import './Dashboard.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Dashboard = ({ url }) => {
    const [stats, setStats] = useState(null)
    const navigate = useNavigate()

    const fetch = async () => {
        const res = await axios.get(`${url}/api/dashboard/stats`)
        if (res.data.success) setStats(res.data.data)
    }

    useEffect(() => {
        fetch()
        const interval = setInterval(fetch, 30000)
        return () => clearInterval(interval)
    }, [])

    const goOrders = (statusFilter, quickFilter) => {
        navigate('/orders', { state: { statusFilter, quickFilter, tab: quickFilter === 'all' ? 'all' : 'active' } })
    }

    if (!stats) return <div className='dashboard-loading'>Loading...</div>

    const maxRevenue = Math.max(...stats.weeklyData.map(d => d.revenue), 1)

    return (
        <div className='dashboard'>
            <p className='dashboard-title'>📊 Dashboard</p>

            {/* Stat Cards */}
            <div className='dash-cards'>
                <div className='dash-card tomato clickable' onClick={() => goOrders('All', 'today')}>
                    <p className='dash-card-label'>Today's Orders</p>
                    <p className='dash-card-value'>{stats.todayOrders}</p>
                    <p className='dash-card-hint'>Click to view →</p>
                </div>
                <div className='dash-card green clickable' onClick={() => goOrders('All', 'today')}>
                    <p className='dash-card-label'>Today's Revenue</p>
                    <p className='dash-card-value'>₹{stats.todayRevenue}</p>
                    <p className='dash-card-hint'>Click to view →</p>
                </div>
                <div className='dash-card blue clickable' onClick={() => goOrders('All', 'month')}>
                    <p className='dash-card-label'>This Month Revenue</p>
                    <p className='dash-card-value'>₹{stats.monthRevenue}</p>
                    <p className='dash-card-hint'>Click to view →</p>
                </div>
                <div className='dash-card purple clickable' onClick={() => goOrders('All', 'all')}>
                    <p className='dash-card-label'>Total Revenue</p>
                    <p className='dash-card-value'>₹{stats.totalRevenue}</p>
                    <p className='dash-card-hint'>Click to view →</p>
                </div>
                <div className='dash-card orange clickable' onClick={() => goOrders('All', 'all')}>
                    <p className='dash-card-label'>Total Orders</p>
                    <p className='dash-card-value'>{stats.totalOrders}</p>
                    <p className='dash-card-hint'>Click to view →</p>
                </div>
                <div className='dash-card teal clickable' onClick={() => goOrders('Food Processing', 'all')}>
                    <p className='dash-card-label'>Pending Orders</p>
                    <p className='dash-card-value'>{stats.pendingOrders}</p>
                    <p className='dash-card-hint'>Click to view →</p>
                </div>
                <div className='dash-card gray'>
                    <p className='dash-card-label'>Total Users</p>
                    <p className='dash-card-value'>{stats.totalUsers}</p>
                </div>
                <div className='dash-card pink'>
                    <p className='dash-card-label'>Menu Items</p>
                    <p className='dash-card-value'>{stats.totalFoods}</p>
                </div>
            </div>

            <div className='dash-bottom'>
                {/* Weekly Chart */}
                <div className='dash-section'>
                    <p className='dash-section-title'>📈 Last 7 Days Revenue</p>
                    <div className='bar-chart'>
                        {stats.weeklyData.map((d, i) => (
                            <div key={i} className='bar-col clickable' onClick={() => goOrders('All', 'week')}>
                                <p className='bar-amount'>₹{d.revenue}</p>
                                <div className='bar-wrap'>
                                    <div className='bar' style={{ height: `${(d.revenue / maxRevenue) * 140}px` }}></div>
                                </div>
                                <p className='bar-label'>{d.label}</p>
                                <p className='bar-orders'>{d.orders} orders</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='dash-right'>
                    {/* Top Items */}
                    <div className='dash-section'>
                        <p className='dash-section-title'>🏆 Top Ordered Items</p>
                        {stats.topItems.length === 0
                            ? <p className='dash-empty'>No orders yet</p>
                            : stats.topItems.map((item, i) => (
                                <div key={i} className='top-item'>
                                    <span className='top-rank'>{i + 1}</span>
                                    <p className='top-name'>{item.name}</p>
                                    <span className='top-count'>{item.count} sold</span>
                                </div>
                            ))
                        }
                    </div>

                    {/* Status Breakdown */}
                    <div className='dash-section'>
                        <p className='dash-section-title'>📦 Order Status</p>
                        {Object.entries(stats.statusCount).map(([status, count]) => (
                            <div key={status} className={`status-row clickable`} onClick={() => goOrders(status, 'all')}>
                                <p>{status}</p>
                                <span className={`status-badge status-${status.replace(/ /g, '-').toLowerCase()}`}>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
