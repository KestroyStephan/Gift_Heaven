import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { backendUrl, currency } from '../App'

const StatCard = ({ label, value }) => (
  <div className='bg-white border border-gray-200 rounded p-5'>
    <p className='text-xs uppercase tracking-wide text-gray-500'>{label}</p>
    <p className='text-2xl font-semibold text-gray-800 mt-2'>{value}</p>
  </div>
)

const Dashboard = ({ token }) => {

  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    axios.post(backendUrl + '/api/orders/stats', {}, { headers: { token } })
      .then(({ data }) => {
        if (data.success) {
          setStats(data.stats)
          setRecentOrders(data.recentOrders)
        } else {
          toast.error(data.message)
        }
      })
      .catch(error => toast.error(error.message))
  }, [token])

  if (!stats) return <p>Loading dashboard...</p>

  const maxStatus = Math.max(1, ...Object.values(stats.byStatus))

  return (
    <div className='flex flex-col gap-6'>
      <h2 className='text-xl font-semibold text-gray-800'>Dashboard</h2>

      <div className='grid grid-cols-2 lg:grid-cols-5 gap-4'>
        <StatCard label='Revenue (paid)' value={`${currency}${stats.revenue.toFixed(2)}`} />
        <StatCard label='Awaiting payment' value={`${currency}${stats.pendingPayments.toFixed(2)}`} />
        <StatCard label='Orders' value={stats.totalOrders} />
        <StatCard label='Products' value={stats.totalProducts} />
        <StatCard label='Customers' value={stats.totalUsers} />
      </div>

      <div className='grid md:grid-cols-2 gap-4'>
        <div className='bg-white border border-gray-200 rounded p-5'>
          <p className='font-medium text-gray-800 mb-4'>Orders by status</p>
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} className='flex items-center gap-3 text-sm mb-2'>
              <p className='w-32 shrink-0'>{status}</p>
              <div className='flex-1 h-3 bg-gray-100 rounded'>
                <div className='h-3 bg-pink-400 rounded' style={{ width: `${(count / maxStatus) * 100}%` }}></div>
              </div>
              <p className='w-8 text-right'>{count}</p>
            </div>
          ))}
        </div>

        <div className='bg-white border border-gray-200 rounded p-5'>
          <p className='font-medium text-gray-800 mb-4'>Payment methods</p>
          {Object.keys(stats.byMethod).length === 0 && <p className='text-sm'>No orders yet.</p>}
          {Object.entries(stats.byMethod).map(([method, count]) => (
            <div key={method} className='flex justify-between text-sm py-1 border-b last:border-b-0'>
              <p>{method === 'COD' ? 'Cash on Delivery' : method}</p>
              <p>{count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className='bg-white border border-gray-200 rounded p-5'>
        <div className='flex justify-between mb-4'>
          <p className='font-medium text-gray-800'>Recent orders</p>
          <Link to='/orders' className='text-sm text-pink-700 underline'>View all</Link>
        </div>
        {recentOrders.length === 0 && <p className='text-sm'>No orders yet.</p>}
        {recentOrders.map(order => (
          <div key={order._id} className='grid grid-cols-[1fr_1fr] sm:grid-cols-[1fr_2fr_1fr_1fr] gap-2 text-sm py-2 border-b last:border-b-0'>
            <p className='font-mono'>#{String(order._id).slice(-8).toUpperCase()}</p>
            <p className='hidden sm:block'>{order.address.firstName} {order.address.lastName}</p>
            <p>{currency}{order.amount.toFixed(2)}</p>
            <p className='hidden sm:block'>{order.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
