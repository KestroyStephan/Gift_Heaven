import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Orders = ({ token }) => {

  const [orders, setOrders] = useState([])

  const fetchAllOrders = async () => {
    if (!token) {
      return null;

    }
    try {
      const response = await axios.post(backendUrl + '/api/orders/list', {}, { headers: { token } })

      if (response.data.success) {
        setOrders(response.data.orders)

      } else {
        toast.error(response.data.message)
      }


    } catch (error) {
      console.log(error.message)
      toast.error(error.message)
    }

  }


  const statusHandler = async (event, orderId) =>{
    try {
      
      const response = await axios.post(backendUrl + '/api/orders/status', {orderId, status:event.target.value}, {headers:{token}})
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchAllOrders()
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }




  useEffect(() => {
    fetchAllOrders();
  }, [token])

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const visibleOrders = orders.filter(order => {
    if (statusFilter && order.status !== statusFilter) return false
    if (!query) return true
    const q = query.toLowerCase()
    const a = order.address || {}
    return [String(order._id).slice(-8), a.firstName, a.lastName, a.email, a.phone]
      .some(v => String(v || '').toLowerCase().includes(q))
  })



  return (
    <div>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h3 className='text-xl font-semibold text-gray-800'>Orders ({visibleOrders.length})</h3>
        <div className='flex gap-2'>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search name, email, order #' className='px-3 py-2 border border-gray-300 text-sm' />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className='px-3 py-2 border border-gray-300 text-sm'>
            <option value=''>All statuses</option>
            {['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {visibleOrders.length === 0 && <p className='mt-6'>No orders found.</p>}
      <div>
        {
          visibleOrders.map((order, index) => (
            <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-300 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={index}>
              <img className='w-12' src={assets.parcel_icon} />
              <div>

                <div>
                  {order.items.map((item, index) => (
                    <div className='py-0.5' key={index}>
                      <p>{item.name} × {item.quantity} <span className='text-gray-500'>({item.size})</span></p>
                      {item.custom && (
                        <div className='ml-3 my-1 pl-3 border-l-2 border-pink-400 text-xs text-gray-600 flex flex-col gap-0.5'>
                          <b className='text-pink-700'>Personalised</b>
                          {item.custom.cakeFlavour && <span>Cake: <b>{item.custom.cakeFlavour}</b>{item.custom.eggless ? ' · eggless' : ''}</span>}
                          {item.custom.cakeMessage && <span>On the cake: “{item.custom.cakeMessage}”</span>}
                          {item.custom.deliveryDate && <span className='text-pink-700 font-semibold'>Deliver: {item.custom.deliveryDate}{item.custom.timeSlot ? `, ${item.custom.timeSlot}` : ''}</span>}
                          {item.custom.printText && <span>Print: “{item.custom.printText}”</span>}
                          {item.custom.printColour && <span>Colour: {item.custom.printColour}</span>}
                          {item.custom.name && <span>For: {item.custom.name}</span>}
                          {item.custom.message && <span className='italic'>“{item.custom.message}”</span>}
                          {item.custom.ribbon && <span>Ribbon: {item.custom.ribbon}</span>}
                          {item.custom.wrap && <span>Wrapping: {item.custom.wrap}</span>}
                          {item.custom.addOns?.length > 0 && <span>Add-ons: {item.custom.addOns.join(', ')}</span>}
                          {item.custom.photo && <a href={item.custom.photo} target='_blank' rel='noreferrer' className='flex items-center gap-2 text-pink-700 underline'><img src={item.custom.photo} alt='' className='w-10 h-10 object-cover rounded' />Customer photo</a>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className='mt-3 mb-2 font-medium'>{order.address.firstName + " " + order.address.lastName} <span className='font-mono text-gray-400 font-normal'>#{String(order._id).slice(-8).toUpperCase()}</span></p>
                <div>
                  <p>{order.address.street + ", "}</p>
                  <p>{order.address.city + ", " + order.address.state + " ," + order.address.country + " ," + order.address.zipcode}</p>
                </div>
                <p>{order.address.phone}</p>
                <p>{order.address.email}</p>
                {order.address.giftNote && <p className='mt-2 p-2 bg-pink-50 rounded text-pink-700'><b>Gift note:</b> {order.address.giftNote}</p>}
              </div>
              <div>
                <p className='text-sm sm:text-[15px]'>Items : {order.items.length}</p>
                <p className='mt-3'>Method : {order.paymentMethod}</p>
                <p>Payment : <span className={order.payment ? 'text-green-600' : 'text-amber-600'}>{order.payment ? 'Done' : 'Pending'}</span></p>
                <p>Date : {new Date(order.date).toLocaleDateString()}</p>
              </div>
              <p className='text-sm sm:text-[15px]'>{currency}{Number(order.amount).toFixed(2)}</p>
              <select onChange={(event)=>statusHandler(event, order._id)} value={order.status} className='p-2 font-semibold'>
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipped">Shipped</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

          ))
        }
      </div>
    </div>
  )

}

export default Orders
