import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import Title from '../Components/Title';
import OrderTracker from '../Components/OrderTracker';
import CustomSummary from '../Components/CustomSummary';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {

  const {backendUrl, token, currency, navigate, handleAuthError} = useContext(ShopContext);

  const [orders, setOrders] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [tracking, setTracking] = useState(null)

  const loadOrderData = async ()=>{
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(backendUrl+'/api/orders/userorders',{},{headers:{token}})
      if (handleAuthError(response.data)) return
      if(response.data.success){
        setOrders(response.data.orders)
      } else {
        toast.error(response.data.message)
      }


    } catch (error) {
      console.log(error.message)
      toast.error(error.message)
    } finally {
      setLoaded(true)
    }
  }

  useEffect(()=>{
    if (!token && !localStorage.getItem('token')) navigate('/login?redirect=/orders')
    loadOrderData()
  },[token])

  const trackOrder = async (orderId) => {
    if (tracking === orderId) return setTracking(null)
    await loadOrderData()
    setTracking(orderId)
  }

  return (
    <div className='border-t pt-16'>

      <div className='text-2xl'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      {loaded && orders.length === 0 && (
        <div className='text-center py-16 text-gray-500'>
          <p>You haven't placed any orders yet.</p>
          <Link to='/collection' className='inline-block mt-4 bg-rose-600 text-white px-8 py-3 text-sm'>START SHOPPING</Link>
        </div>
      )}

      <div className='' >
        {
          orders.map((order)=>(
            <div key={order._id} className='border-t border-b py-4 text-gray-700'>
              <div className='flex flex-wrap justify-between gap-2 text-xs text-gray-500 mb-2'>
                <p>Order <b className='text-gray-700'>#{String(order._id).slice(-8).toUpperCase()}</b> · {new Date(order.date).toDateString()}</p>
                <p>Total: <b className='text-gray-700'>{currency}{order.amount.toFixed(2)}</b> · {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod} · <span className={order.payment ? 'text-green-600' : 'text-amber-600'}>{order.payment ? 'Paid' : 'Payment pending'}</span></p>
              </div>

              {order.items.map((item,index)=>(
                <div key={index} className='py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                    <div className='flex items-start gap-6 text-sm'>
                      <img src={item.image[0]} className='w-16 sm:w-20' alt={item.name} />
                      <div>
                        <p className='sm:text-base font-medium'>{item.name}</p>
                        <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                          <p >{currency}{item.price}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Size: {item.size}</p>
                        </div>
                        <CustomSummary custom={item.custom} />
                      </div>
                    </div>

                    {index === 0 && (
                      <div className='md:w-1/2 flex justify-between'>
                          <div className='flex items-center gap-2'>
                              <p className={`min-w-2 h-2 rounded-full ${order.status === 'Cancelled' ? 'bg-red-500' : order.status === 'Delivered' ? 'bg-green-500' : 'bg-amber-400'}`}></p>
                              <p className='text-sm md:text-base'>{order.status}</p>
                          </div>

                          <button onClick={()=>trackOrder(order._id)} className='border px-4 py-2 text-sm font-medium rounded-sm cursor-pointer hover:bg-rose-50'>
                            {tracking === order._id ? 'Hide Tracking' : 'Track Order'}
                          </button>
                      </div>
                    )}
                </div>
              ))}

              {tracking === order._id && (
                <div className='mt-3 p-4 bg-rose-50/50 border border-rose-100'>
                  <OrderTracker order={order} />
                </div>
              )}
            </div>
          ))
        }
      </div>

    </div>
  )
}

export default Orders
