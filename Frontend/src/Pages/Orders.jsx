import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import Title from '../Components/Title';
import OrderTracker, { statusClass } from '../Components/OrderTracker';
import CustomSummary from '../Components/CustomSummary';
import Icon from '../Components/Icons';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {

  const {backendUrl, token, currency, navigate, handleAuthError} = useContext(ShopContext);

  const [orders, setOrders] = useState([])
  const [loaded, setLoaded] = useState(false)
  // which order cards have their tracker open (orders on their way start open)
  const [toggled, setToggled] = useState({})

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

  // Delivered gifts the customer hasn't reviewed yet
  const [toReview, setToReview] = useState([])
  useEffect(() => {
    if (!token) return
    axios.post(backendUrl + '/api/review/to-review', {}, { headers: { token } })
      .then(({ data }) => data.success && setToReview(data.pending)).catch(() => {})
  }, [token])

  useEffect(()=>{
    if (!token && !localStorage.getItem('token')) navigate('/login?redirect=/orders')
    loadOrderData()
  },[token])

  const trackOrder = async (orderId, isOpen) => {
    setToggled(prev => ({ ...prev, [orderId]: !isOpen }))
    if (!isOpen) await loadOrderData()
  }

  // Refresh every minute while a gift is still on its way
  useEffect(() => {
    if (!orders.some(o => !['Delivered', 'Cancelled'].includes(o.status))) return
    const id = setInterval(loadOrderData, 60000)
    return () => clearInterval(id)
  }, [orders, token])

  const active = (order) => !['Delivered', 'Cancelled'].includes(order.status)

  return (
    <div className='pt-10 pb-16'>
      <div className='flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 mb-8'>
        <div>
          <Title as='h1' eyebrow='Track & manage' text1='My' text2='orders' />
          <p className='text-mauve -mt-1'>Gifts on their way show live tracking. Need to share it? Use the order number on the <Link to='/track' className='font-semibold text-berry underline underline-offset-4'>tracking page</Link>.</p>
        </div>
      </div>

      {loaded && orders.length === 0 && (
        <div className='rounded-[28px] border border-dashed border-rose-300 bg-white py-16 px-6 text-center flex flex-col items-center gap-3'>
          <Icon name='bag' size={34} className='text-berry' />
          <p className='font-display text-3xl font-semibold'>No orders yet</p>
          <p className='text-mauve text-sm'>When you send a gift, you can follow it here from packing to the doorstep.</p>
          <Link to='/collection' className='btn-primary mt-2'>Start shopping</Link>
        </div>
      )}

      <div className='flex flex-col gap-6'>
        {orders.map(order => {
          const open = toggled[order._id] ?? active(order)
          return (
            <article key={order._id} className='rounded-[28px] bg-white border border-line overflow-hidden shadow-[0_20px_50px_-36px_rgba(107,25,64,.45)]'>
              <header className='flex flex-wrap items-center gap-x-4 gap-y-2 px-5 sm:px-6 py-4 bg-[#FFF6FA] border-b border-line'>
                <span className='font-mono font-bold text-ink'>#{String(order._id).slice(-8).toUpperCase()}</span>
                <span className='text-sm text-muted'>{new Date(order.date).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className={statusClass(order.status)}>{order.status}</span>
                <span className='flex-1'></span>
                <span className='text-sm'>
                  <b className='text-ink'>{currency}{order.amount.toLocaleString('en-LK')}</b>
                  <span className='text-muted'> · {order.paymentMethod === 'COD' ? 'Cash on delivery' : order.paymentMethod} </span>
                  {order.status === 'Cancelled' && !order.payment ? <span className='st st-off'>Not charged</span> : <span className={order.payment ? 'st st-done' : 'st st-warn'}>{order.payment ? 'Paid' : 'Payment pending'}</span>}
                </span>
              </header>

              {open && <div className='px-5 sm:px-6 pt-6 pb-2'><OrderTracker order={order} loadLive={async () => (await axios.post(backendUrl + '/api/orders/single', { orderId: order._id }, { headers: { token } })).data.order?.live} /></div>}

              <ul className='px-5 sm:px-6 py-3 divide-y divide-line'>
                {order.items.map((item, index) => (
                  <li key={index} className='py-3 flex items-start gap-4 text-sm'>
                    <img src={item.image[0]} className='w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-line' alt={item.name} />
                    <div className='flex-1 min-w-0'>
                      <p className='sm:text-base font-bold text-ink'>{item.name}</p>
                      <p className='text-muted mt-0.5'>{currency}{Number(item.price).toLocaleString('en-LK')} · Qty {item.quantity} · {item.size}</p>
                      {order.discount > 0 && index === 0 && <p className='text-xs text-berry font-semibold mt-0.5'>Saved {currency}{order.discount.toLocaleString('en-LK')} with {order.couponCode}</p>}
                      <CustomSummary custom={item.custom} />
                      {order.status === 'Delivered' && toReview.includes(String(item._id)) && (
                        <Link to={`/product/${item._id}#write-review`} className='inline-flex items-center gap-1.5 mt-2 px-3.5 py-1.5 rounded-full bg-rose-50 text-berry text-sm font-bold hover:bg-rose-100'>★ Rate this gift</Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <footer className='flex flex-wrap gap-2 px-5 sm:px-6 pb-5'>
                <button onClick={() => trackOrder(order._id, open)} aria-expanded={open} className='btn-outline !h-10 !px-4 text-sm'>
                  <Icon name='truck' size={16} />{open ? 'Hide tracking' : 'Track order'}
                </button>
                <Link to={`/order-success/${order._id}`} className='btn-outline !h-10 !px-4 text-sm'>Order details</Link>
              </footer>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default Orders
