import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { Icon, PageHeader, StatusBadge, Empty, orderNo } from '../components/ui'
import LiveDelivery from '../components/LiveDelivery'

const statuses = ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled']

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


  // optional note per order, shown to the customer on their tracking timeline
  const [notes, setNotes] = useState({})

  const statusHandler = async (event, orderId, status = event.target.value) =>{
    try {
      
      const response = await axios.post(backendUrl + '/api/orders/status', {orderId, status, note: notes[orderId] || ''}, {headers:{token}})
      if (response.data.success) {
        toast.success(response.data.message)
        setNotes(prev => ({ ...prev, [orderId]: '' }))
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
      <PageHeader title='Orders' subtitle={`${orders.length} orders · ${orders.filter(o => o.status === 'Order Placed').length} new`}>
        <label className='relative'>
          <Icon name='search' size={17} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-mauve' />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Name, email, phone or order #' aria-label='Search orders' className='field !pl-10 sm:!w-72' />
        </label>
      </PageHeader>
      <div className='overflow-x-auto mb-5 -mx-1 px-1'>
        <div className='tabs'>
          {['', ...statuses].map(s => (
            <button key={s || 'all'} aria-pressed={statusFilter === s} onClick={() => setStatusFilter(s)} className='tab'>
              {s || 'All'} <span className='opacity-60 ml-0.5'>{s ? orders.filter(o => o.status === s).length : orders.length}</span>
            </button>
          ))}
        </div>
      </div>
      {visibleOrders.length === 0 && <Empty icon='orders' title='No orders found' text='Orders matching this search or status will appear here.' />}
      <div className='flex flex-col gap-4'>
        {
          visibleOrders.map((order, index) => (
            <div className='card overflow-hidden text-sm' key={index}>
              <div className='flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 bg-[#FCF8F9] border-b border-line'>
                <span className='font-mono font-semibold text-ink'>{orderNo(order._id)}</span>
                <span className='flex items-center gap-1.5 text-mauve'><Icon name='calendar' size={15} />{new Date(order.date).toLocaleString('en-LK', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                <StatusBadge status={order.status} />
                <span className='flex-1'></span>
                <b className='text-base text-ink'>{currency}{Number(order.amount).toLocaleString('en-LK')}</b>
                <select onChange={(event)=>statusHandler(event, order._id)} value={order.status} aria-label={`Status of order ${orderNo(order._id)}`} className='field !w-auto !py-1.5 font-semibold text-ink'>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <LiveDelivery order={order} token={token} onChanged={fetchAllOrders} />
              <form onSubmit={(e) => { e.preventDefault(); statusHandler(null, order._id, order.status) }} className='flex flex-wrap items-center gap-2 px-5 pt-4'>
                <label className='relative flex-1 min-w-[240px]'>
                  <span className='sr-only'>Delivery note for order {orderNo(order._id)}</span>
                  <Icon name='truck' size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-mauve' />
                  <input value={notes[order._id] || ''} onChange={(e) => setNotes(prev => ({ ...prev, [order._id]: e.target.value }))} maxLength={200}
                    placeholder='Note for the customer, e.g. "With rider Kasun · 077 123 4567" — sent with the next status change' className='field !pl-9 !py-1.5 text-sm' />
                </label>
                <button disabled={!notes[order._id]?.trim()} className='btn-ghost px-4 py-1.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed'>Add to "{order.status}"</button>
              </form>
              {(order.statusHistory || []).some(h => h.note) && (
                <ul className='px-5 pt-2 flex flex-wrap gap-2 text-xs'>
                  {order.statusHistory.filter(h => h.note).map((h, i) => <li key={i} className='px-2.5 py-1 rounded-full bg-pink-50 text-pink-700'><b>{h.status}:</b> {h.note}</li>)}
                </ul>
              )}
              <div className='grid lg:grid-cols-[2fr_1fr_0.8fr] gap-6 p-5'>
                <div>
                  <p className='table-head mb-2'>Items ({order.items.length})</p>
                  {order.items.map((item, index) => (
                    <div className='py-0.5' key={index}>
                      <p className='text-ink'><b className='font-semibold'>{item.name}</b> × {item.quantity} <span className='text-mauve'>({item.size})</span>{item.offerName && <span className='ml-2 text-[11px] font-bold text-berry bg-pink-50 px-2 py-0.5 rounded-full'>{item.offerName}</span>}</p>
                      {item.custom && (
                        <div className='ml-1 my-2 p-3 rounded-xl bg-[#FCF8F9] border-l-[3px] border-berry text-xs text-mauve flex flex-col gap-1'>
                          <b className='text-berry tracking-wide'>{item.custom.boxItems ? 'SURPRISE BOX' : 'PERSONALISED'}</b>
                          {item.custom.cakeFlavour && <span>Cake: <b>{item.custom.cakeFlavour}</b>{item.custom.eggless ? ' · eggless' : ''}</span>}
                          {item.custom.cakeMessage && <span>On the cake: “{item.custom.cakeMessage}”</span>}
                          {item.custom.deliveryDate && !item.custom.boxItems && <span className='text-pink-700 font-semibold'>Deliver: {item.custom.deliveryDate}{item.custom.timeSlot ? `, ${item.custom.timeSlot}` : ''}</span>}
                          {item.custom.printText && <span>Print: “{item.custom.printText}”</span>}
                          {item.custom.printColour && <span>Colour: {item.custom.printColour}</span>}
                          {item.custom.name && <span>For: {item.custom.name}</span>}
                          {item.custom.message && <span className='italic'>“{item.custom.message}”</span>}
                          {item.custom.ribbon && <span>Ribbon: {item.custom.ribbon}</span>}
                          {item.custom.wrap && <span>Wrapping: {item.custom.wrap}</span>}
                          {item.custom.addOns?.length > 0 && <span>Add-ons: {item.custom.addOns.join(', ')}</span>}
                          {item.custom.photos?.length > 0 && (
                            <span className='flex flex-col gap-1'>
                              <span>Album ({item.custom.photos.length} photos){item.custom.albumTitle ? ` · “${item.custom.albumTitle}”` : ''}</span>
                              <span className='flex flex-wrap gap-1'>{item.custom.photos.map((url, i) => <a key={url} href={url} target='_blank' rel='noreferrer'><img src={url} alt={`Album photo ${i + 1}`} className='w-10 h-10 object-cover rounded' /></a>)}</span>
                            </span>
                          )}
                          {item.custom.albumQuotes && <span>Quotes to paper-cut: “{item.custom.albumQuotes}”</span>}
                          {item.custom.boxItems?.length > 0 && (
                            <span className='flex flex-col gap-1 mt-1 p-2 bg-white rounded border border-pink-100'>
                              <b className='text-ink'>Pack in the box:</b>
                              {item.custom.boxItems.map((b, i) => (
                                <span key={i} className='flex flex-col'>
                                  <span>☐ {b.name} ({b.size}) × {b.quantity}</span>
                                  {b.custom?.cakeFlavour && <span className='ml-4'>Cake: {b.custom.cakeFlavour}{b.custom.eggless ? ' · eggless' : ''}{b.custom.cakeMessage ? ` · “${b.custom.cakeMessage}”` : ''}</span>}
                                  {b.custom?.photos?.length > 0 && (
                                    <span className='ml-4 flex flex-col gap-1'>
                                      <span>Album: {b.custom.photos.length} photos{b.custom.albumTitle ? ` · “${b.custom.albumTitle}”` : ''}{b.custom.albumQuotes ? ` · quotes: “${b.custom.albumQuotes}”` : ''}</span>
                                      <span className='flex flex-wrap gap-1'>{b.custom.photos.map((url, j) => <a key={url} href={url} target='_blank' rel='noreferrer'><img src={url} alt={`Album photo ${j + 1}`} className='w-10 h-10 object-cover rounded' /></a>)}</span>
                                    </span>
                                  )}
                                </span>
                              ))}
                            </span>
                          )}
                          {item.custom.boxItems && item.custom.deliveryDate && <span className='text-pink-700 font-semibold'>Deliver box: {item.custom.deliveryDate}{item.custom.timeSlot ? `, ${item.custom.timeSlot}` : ''}</span>}
                          {item.custom.surprise && <span className='font-bold text-red-700'>SURPRISE — call the customer, not the recipient</span>}
                          {item.custom.photo && <a href={item.custom.photo} target='_blank' rel='noreferrer' className='flex items-center gap-2 text-pink-700 underline'><img src={item.custom.photo} alt='' className='w-10 h-10 object-cover rounded' />Customer photo</a>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className='flex flex-col gap-1.5'>
                  <p className='table-head mb-1'>Deliver to</p>
                  <p className='font-semibold text-ink'>{order.address.firstName} {order.address.lastName}</p>
                  <p className='flex gap-2'><Icon name='pin' size={16} className='shrink-0 mt-0.5 text-mauve' /><span>{order.address.street}, {order.address.city}, {order.address.state}, {order.address.country} {order.address.zipcode}</span></p>
                  <a href={`tel:${order.address.phone}`} className='flex gap-2 hover:text-berry'><Icon name='phone' size={16} className='text-mauve' />{order.address.phone}</a>
                  <a href={`mailto:${order.address.email}`} className='flex gap-2 hover:text-berry break-all'><Icon name='mail' size={16} className='shrink-0 text-mauve' />{order.address.email}</a>
                  {order.address.giftNote && <p className='mt-2 p-3 bg-pink-50 rounded-xl text-pink-700'><b>Gift note:</b> {order.address.giftNote}</p>}
                </div>
                <div className='flex flex-col gap-1.5'>
                  <p className='table-head mb-1'>Payment</p>
                  <p className='text-ink font-semibold'>{order.paymentMethod === 'COD' ? 'Cash on delivery' : order.paymentMethod}</p>
                  <p><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${order.payment ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{order.payment ? 'Paid' : 'Payment pending'}</span></p>
                  {order.discount > 0 && <p className='mt-2 text-emerald-700'>Coupon <b className='font-mono'>{order.couponCode}</b> −{currency}{order.discount.toLocaleString('en-LK')}</p>}
                  {order.deliveryFee === 0 && <p className='text-emerald-700'>Free delivery</p>}
                  <p className='mt-2'>Total <b className='text-ink'>{currency}{Number(order.amount).toLocaleString('en-LK')}</b></p>
                </div>
              </div>
            </div>

          ))
        }
      </div>
    </div>
  )

}

export default Orders
