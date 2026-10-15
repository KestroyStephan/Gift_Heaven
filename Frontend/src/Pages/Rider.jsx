import React, { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../Context/ShopContext'
import Icon from '../Components/Icons'

const SEND_EVERY_MS = 5000

// The rider's phone: share GPS while delivering, then mark the gift delivered.
// Opened from the private link the admin sends; the link itself is the key.
const Rider = () => {
    const { token } = useParams()
    const { backendUrl, currency } = useContext(ShopContext)
    const [delivery, setDelivery] = useState(null)
    const [error, setError] = useState('')
    const [sharing, setSharing] = useState(false)
    const [gps, setGps] = useState(null)        // last reading from the phone
    const [sentAt, setSentAt] = useState(null)  // last time the server accepted a position
    const [problem, setProblem] = useState('')
    const watchId = useRef(null)
    const lastSent = useRef(0)
    const wakeLock = useRef(null)

    const load = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/delivery/rider/${token}`)
            if (data.success) { setDelivery(data.delivery); setSentAt(data.delivery.lastSentAt) }
            else setError(data.message)
        } catch (err) { setError(err.message) }
    }
    useEffect(() => { load(); return () => stop() }, [token])

    const send = async (pos) => {
        const { latitude: lat, longitude: lng, accuracy, heading, speed } = pos.coords
        setGps({ lat, lng, accuracy })
        if (Date.now() - lastSent.current < SEND_EVERY_MS) return
        lastSent.current = Date.now()
        try {
            const { data } = await axios.post(`${backendUrl}/api/delivery/rider/${token}/location`, { lat, lng, accuracy, heading, speed })
            if (data.success) { setSentAt(data.at); setProblem('') }
            else { setProblem(data.message); if (data.stopped) stop() }
        } catch { setProblem('No internet — will keep trying') }
    }

    const start = async () => {
        if (!('geolocation' in navigator)) return setProblem("This phone's browser can't share location")
        if (!window.isSecureContext) return setProblem('Location needs a secure (https) link — ask the shop for the https version')
        setProblem('')
        watchId.current = navigator.geolocation.watchPosition(send, (err) => {
            setProblem(err.code === 1 ? 'Location permission was denied — allow it in the browser settings and try again' : 'Waiting for a GPS signal…')
            if (err.code === 1) stop()
        }, { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 })
        setSharing(true)
        try { wakeLock.current = await navigator.wakeLock?.request('screen') } catch { /* screen may sleep */ }
    }

    function stop() {
        if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
        watchId.current = null
        wakeLock.current?.release?.().catch(() => {})
        wakeLock.current = null
        setSharing(false)
    }

    const delivered = async () => {
        if (!window.confirm('Mark this gift as delivered? The customer will be notified.')) return
        try {
            const { data } = await axios.post(`${backendUrl}/api/delivery/rider/${token}/delivered`, {})
            if (data.success) { stop(); toast.success(data.message); load() }
            else toast.error(data.message)
        } catch (err) { toast.error(err.message) }
    }

    if (error) return (
        <div className='py-24 text-center flex flex-col items-center gap-3'>
            <p className='font-display text-4xl font-semibold'>Delivery link not available</p>
            <p className='text-mauve'>{error}. Please ask the shop for a new link.</p>
        </div>
    )
    if (!delivery) return <div className='min-h-[60vh]'></div>

    const done = delivery.status === 'Delivered'
    const ended = !delivery.active && !done

    return (
        <div className='max-w-lg mx-auto pt-8 pb-16 flex flex-col gap-5'>
            <div>
                <p className='eyebrow'>Rider · order #{delivery.orderNo}</p>
                <h1 className='font-display text-[2.4rem] leading-tight font-semibold mt-3'>Hi {String(delivery.riderName).split(' ')[0]}, deliver to <span className='italic text-brand'>{delivery.recipient}</span></h1>
            </div>

            {done ? (
                <div className='rounded-[24px] bg-gradient-to-br from-berry to-berry-dark text-white p-5 flex items-center gap-3 shadow-[0_18px_40px_-20px_rgba(210,58,127,.9)]'>
                    <span className='w-11 h-11 rounded-full bg-white text-berry flex items-center justify-center'><Icon name='check' size={20} /></span>
                    <p className='font-bold'>Delivered. Thank you — location sharing is off.</p>
                </div>
            ) : ended ? (
                <p className='rounded-[24px] bg-[#F6EEF2] p-5 text-sm text-mauve'>The shop has stopped live tracking for this delivery.</p>
            ) : (
                <div className={`rounded-[28px] p-6 flex flex-col gap-4 text-white ${sharing ? 'bg-gradient-to-br from-berry to-berry-dark glow-pulse' : 'bg-gradient-to-br from-berry-dark via-[#9A2459] to-[#5E1238]'}`}>
                    <div className='flex items-center gap-3'>
                        <span className='relative flex w-3 h-3'>
                            {sharing && <span className='absolute inset-0 rounded-full bg-white animate-ping'></span>}
                            <span className={`relative w-3 h-3 rounded-full ${sharing ? 'bg-white' : 'bg-white/40'}`}></span>
                        </span>
                        <p className='font-bold text-lg'>{sharing ? 'Sharing your location' : 'Location sharing is off'}</p>
                    </div>
                    <p className='text-sm text-white/85'>
                        {sharing
                            ? `The customer can see you on a live map. Keep this page open while you ride.${sentAt ? ` Last sent ${new Date(sentAt).toLocaleTimeString('en-LK', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}.` : ''}${gps?.accuracy ? ` GPS accuracy about ${Math.round(gps.accuracy)} m.` : ''}`
                            : 'Turn it on when you leave with the gift so the customer can follow you.'}
                    </p>
                    <button onClick={sharing ? stop : start} className={`h-14 rounded-full font-bold text-base cursor-pointer transition ${sharing ? 'bg-white/15 border border-white/40 hover:bg-white/25' : 'bg-white text-berry hover:bg-rose-50'}`}>
                        {sharing ? 'Pause sharing' : 'Start sharing my location'}
                    </button>
                    {problem && <p role='alert' className='text-sm font-semibold bg-white/15 rounded-xl px-3 py-2'>{problem}</p>}
                </div>
            )}

            <section className='rounded-[24px] bg-white border border-line p-5 flex flex-col gap-3 text-sm'>
                {delivery.surprise && <p className='rounded-xl bg-rose-50 text-berry font-bold px-3 py-2'>SURPRISE delivery — don't reveal it's coming; call the sender if you need help.</p>}
                {delivery.scheduled && <p><b className='text-ink'>Deliver on:</b> {delivery.scheduled.date}{delivery.scheduled.slot ? `, ${delivery.scheduled.slot}` : ''}</p>}
                <p className='flex gap-2'><Icon name='pin' size={18} className='text-berry shrink-0 mt-0.5' /><span><b className='text-ink'>{delivery.recipient}</b><br />{delivery.address}</span></p>
                <div className='flex flex-wrap gap-2'>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.address)}`} target='_blank' rel='noreferrer' className='btn-outline !h-11 !px-4 text-sm'><Icon name='pin' size={16} />Directions</a>
                    <a href={`tel:${delivery.phone}`} className='btn-outline !h-11 !px-4 text-sm'><Icon name='phone' size={16} />Call {delivery.phone}</a>
                </div>
                {delivery.giftNote && <p><b className='text-ink'>Gift note:</b> “{delivery.giftNote}”</p>}
                <div>
                    <p className='font-bold text-ink mb-1'>In the bag</p>
                    <ul className='flex flex-col gap-1'>
                        {delivery.items.map((i, k) => (
                            <li key={k}>• {i.name} ({i.size}) × {i.quantity}{i.inBox.length > 0 && <span className='block ml-4 text-xs text-muted'>{i.inBox.join(', ')}</span>}</li>
                        ))}
                    </ul>
                </div>
                {delivery.cashToCollect > 0 && <p className='rounded-xl bg-white border-[1.5px] border-dashed border-brand text-berry font-bold px-3 py-2'>Collect cash: {currency}{delivery.cashToCollect.toLocaleString('en-LK')}</p>}
            </section>

            {!done && delivery.status === 'Out for delivery' && (
                <button onClick={delivered} className='btn-primary !h-14 text-base'><Icon name='check' size={20} /> Mark as delivered</button>
            )}
        </div>
    )
}

export default Rider
