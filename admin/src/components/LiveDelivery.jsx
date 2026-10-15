import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl } from '../App'
import { Icon } from './ui'

const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:5173'
const ago = (ms) => { const s = Math.round((Date.now() - ms) / 1000); return s < 60 ? `${s}s ago` : s < 3600 ? `${Math.round(s / 60)} min ago` : `${Math.round(s / 3600)} h ago` }

// Assign a rider and share the private link that turns their phone into a live tracker
const LiveDelivery = ({ order, token, onChanged }) => {
  const live = order.liveTracking
  const [riderName, setRiderName] = useState(live?.riderName || '')
  const [riderPhone, setRiderPhone] = useState(live?.riderPhone || '')
  const [busy, setBusy] = useState(false)
  if (['Delivered', 'Cancelled'].includes(order.status)) return null

  const link = live?.active && live.riderToken ? `${storeUrl}/rider/${live.riderToken}` : ''

  const start = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/delivery/start', { orderId: order._id, riderName, riderPhone }, { headers: { token } })
      if (data.success) { toast.success(data.message); onChanged() } else toast.error(data.message)
    } catch (error) { toast.error(error.message) } finally { setBusy(false) }
  }
  const stop = async () => {
    if (!window.confirm('Stop live tracking for this order? The customer will no longer see the map.')) return
    const { data } = await axios.post(backendUrl + '/api/delivery/stop', { orderId: order._id }, { headers: { token } })
    if (data.success) { toast.success(data.message); onChanged() } else toast.error(data.message)
  }
  const copy = async () => { try { await navigator.clipboard.writeText(link); toast.success('Rider link copied') } catch { toast.info(link) } }
  const whatsapp = `https://wa.me/${riderPhone.replace(/\D/g, '').replace(/^0/, '94')}?text=${encodeURIComponent(`Surprise Heaven delivery #${String(order._id).slice(-8).toUpperCase()} for ${order.address.firstName}. Open this link and tap "Start sharing my location" when you leave: ${link}`)}`

  return (
    <div className='mx-5 mt-4 rounded-2xl border border-pink-100 bg-[#FFF8FB] p-4 text-sm'>
      <p className='font-bold text-ink flex items-center gap-2 mb-3'><Icon name='pin' size={16} />Live map tracking</p>
      {link ? (
        <div className='flex flex-col gap-3'>
          <p className='flex flex-wrap items-center gap-x-2 gap-y-1'>
            <span className={`w-2 h-2 rounded-full ${live.last && Date.now() - live.last.at < 120000 ? 'bg-brand animate-pulse' : 'bg-rose-300'}`}></span>
            <b className='text-ink'>{live.riderName}</b>{live.riderPhone ? ` · ${live.riderPhone}` : ''}
            <span className='text-mauve'>· {live.last ? `last seen ${ago(live.last.at)} (${live.last.lat.toFixed(4)}, ${live.last.lng.toFixed(4)})` : "waiting for the rider's phone"}</span>
          </p>
          <div className='flex flex-wrap gap-2'>
            <input readOnly value={link} onFocus={(e) => e.target.select()} aria-label='Rider link' className='field !py-1.5 text-xs font-mono flex-1 min-w-[220px]' />
            <button onClick={copy} className='btn-ghost px-4 py-1.5 text-xs'>Copy link</button>
            {riderPhone && <a href={whatsapp} target='_blank' rel='noreferrer' className='btn-ghost px-4 py-1.5 text-xs'>Send on WhatsApp</a>}
            <button onClick={stop} className='px-3 py-1.5 text-xs text-mauve hover:text-rose-700 cursor-pointer'>Stop</button>
          </div>
          <p className='text-xs text-mauve'>The customer sees the rider on a live map until the rider taps "Mark as delivered" (or you change the status).</p>
        </div>
      ) : (
        <form onSubmit={start} className='flex flex-wrap gap-2'>
          <input value={riderName} onChange={(e) => setRiderName(e.target.value)} placeholder='Rider name' aria-label='Rider name' maxLength={60} className='field !py-1.5 !w-44' required />
          <input value={riderPhone} onChange={(e) => setRiderPhone(e.target.value)} placeholder='Rider phone (for WhatsApp)' aria-label='Rider phone' maxLength={20} className='field !py-1.5 !w-56' />
          <button disabled={busy} className='btn-dark px-4 py-1.5 text-xs'>{busy ? 'Starting…' : 'Send out with live tracking'}</button>
          <span className='w-full text-xs text-mauve'>Sets the order to "Out for delivery" and gives you a private link for the rider's phone.</span>
        </form>
      )}
    </div>
  )
}

export default LiveDelivery
