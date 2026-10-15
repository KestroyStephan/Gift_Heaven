import React, { useContext, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { ShopContext } from '../Context/ShopContext'
import Title from '../Components/Title'
import Icon from '../Components/Icons'
import OrderTracker, { statusClass } from '../Components/OrderTracker'

// Track a gift with the order number and the email or phone used at checkout — no login needed
const Track = () => {
  const { backendUrl, token, openChat } = useContext(ShopContext)
  const [params] = useSearchParams()
  const [orderNo, setOrderNo] = useState((params.get('order') || '').toUpperCase())
  const [contact, setContact] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const lookup = async (e) => {
    e?.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post(backendUrl + '/api/orders/track', { orderNo, contact })
      if (data.success) setResult(data.order)
      else { setResult(null); setError(data.message) }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Keep the result fresh while the gift is on its way
  useEffect(() => {
    if (!result || ['Delivered', 'Cancelled'].includes(result.status)) return
    const id = setInterval(() => lookup(), 60000)
    return () => clearInterval(id)
  }, [result])

  return (
    <div className='pt-10 pb-16 max-w-3xl mx-auto'>
      <Title as='h1' eyebrow='Delivery tracking' text1='Track your' text2='gift' />
      <p className='text-mauve -mt-1 mb-8'>Enter the order number from your confirmation email (e.g. <b className='text-ink'>#9EB926A2</b>) and the email or phone number used at checkout.</p>

      <form onSubmit={lookup} className='rounded-[28px] bg-white border border-line p-6 sm:p-7 grid sm:grid-cols-[1fr_1.3fr_auto] gap-3 items-end shadow-[0_20px_50px_-36px_rgba(107,25,64,.45)]'>
        <label className='flex flex-col gap-2 text-sm font-bold'>Order number
          <input value={orderNo} onChange={e => setOrderNo(e.target.value.replace(/[^0-9a-f#]/gi, '').toUpperCase())} maxLength={9} placeholder='#9EB926A2' className='field font-normal font-mono tracking-wider' required />
        </label>
        <label className='flex flex-col gap-2 text-sm font-bold'>Email or phone
          <input value={contact} onChange={e => setContact(e.target.value)} placeholder='you@email.com or 077 123 4567' className='field font-normal' required />
        </label>
        <button disabled={loading} className='btn-primary !h-12'>{loading ? 'Checking…' : <><Icon name='truck' size={18} /> Track</>}</button>
      </form>

      {error && <p role='alert' className='mt-4 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-berry font-semibold'>{error}</p>}

      {result && (
        <section className='mt-8 rounded-[28px] bg-white border border-line overflow-hidden shadow-[0_24px_60px_-36px_rgba(107,25,64,.5)] sr sr-up'>
          <header className='flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4 bg-[#FFF6FA] border-b border-line'>
            <span className='font-mono font-bold text-ink'>#{result.orderNo}</span>
            <span className='text-sm text-muted'>Placed {new Date(result.date).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })} · {result.itemCount} gift{result.itemCount === 1 ? '' : 's'}{result.city ? ` · to ${result.city}` : ''}</span>
            <span className='flex-1'></span>
            <span className={statusClass(result.status)}>{result.status}</span>
          </header>
          <div className='p-6'><OrderTracker order={result} loadLive={async () => (await axios.post(backendUrl + '/api/orders/track', { orderNo, contact })).data.order?.live} /></div>
          <footer className='px-6 pb-6 flex flex-wrap gap-2 text-sm'>
            <button onClick={() => openChat(`Order #${result.orderNo}`)} className='btn-outline !h-10 !px-4 text-sm'>Ask about this order</button>
            {token && <Link to='/orders' className='btn-outline !h-10 !px-4 text-sm'>My orders</Link>}
          </footer>
        </section>
      )}
    </div>
  )
}

export default Track
