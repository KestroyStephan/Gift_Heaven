import React from 'react'
import Icon from './Icons'
import LiveMap from './LiveMap'

const steps = [
    { status: 'Order Placed', label: 'Order placed', text: "We've received your order", icon: 'check' },
    { status: 'Packing', label: 'Packing', text: 'Hand-packing and wrapping your gift', icon: 'gift' },
    { status: 'Shipped', label: 'Shipped', text: 'On its way to our delivery hub', icon: 'bag' },
    { status: 'Out for delivery', label: 'Out for delivery', text: 'With our rider today', icon: 'truck' },
    { status: 'Delivered', label: 'Delivered', text: 'Handed over with a smile', icon: 'heart' },
]

const when = (ms) => new Date(ms).toLocaleString('en-LK', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })

// The scheduled delivery of a cake or surprise box in the order, if any
export const scheduledDelivery = (order) => {
    if (order.deliveryDate) return { date: order.deliveryDate, slot: order.timeSlot, surprise: order.surprise }
    for (const item of Array.isArray(order.items) ? order.items : []) {
        const found = [item.custom, ...(item.custom?.boxItems || []).map(b => b.custom)].find(c => c?.deliveryDate)
        if (found) return { date: found.deliveryDate, slot: found.timeSlot, surprise: !!item.custom?.surprise }
    }
    return null
}

// Delivery progress: a step bar on wide screens and a timeline on phones, with times and notes
const OrderTracker = ({ order, loadLive }) => {
    const history = order.statusHistory || []
    const lastFor = (status) => [...history].reverse().find(h => h.status === status)
    const scheduled = scheduledDelivery(order)

    if (order.status === 'Cancelled') {
        const cancelled = lastFor('Cancelled')
        return (
            <div className='rounded-2xl border border-line bg-white p-5 flex items-start gap-4'>
                <span className='w-10 h-10 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center shrink-0'><Icon name='close' size={18} /></span>
                <div className='text-sm'>
                    <p className='font-bold text-ink'>This order was cancelled{cancelled ? ` on ${when(cancelled.date)}` : ''}.</p>
                    {cancelled?.note && <p className='text-mauve mt-0.5'>{cancelled.note}</p>}
                    <p className='text-muted mt-1'>If you paid online, the refund goes back to your card. Questions? Chat with us any time.</p>
                </div>
            </div>
        )
    }

    const current = Math.max(0, steps.findIndex(s => s.status === order.status))
    const progress = (current / (steps.length - 1)) * 100

    return (
        <div className='flex flex-col gap-5'>
            {scheduled && (
                <div className='flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm'>
                    <Icon name='clock' size={18} className='text-berry' />
                    <span>Scheduled delivery: <b className='text-ink'>{new Date(scheduled.date + 'T00:00:00').toLocaleDateString('en-LK', { weekday: 'long', day: 'numeric', month: 'long' })}</b>{scheduled.slot ? `, ${scheduled.slot}` : ''}</span>
                    {scheduled.surprise && <span className='text-berry font-semibold'>· Surprise delivery — we'll call you, not the recipient</span>}
                </div>
            )}

            {order.status === 'Out for delivery' && order.live?.active && <LiveMap initial={order.live} load={loadLive} />}

            {/* Wide screens: horizontal steps with a filling line */}
            <ol className='hidden sm:grid grid-cols-5 relative'>
                <span aria-hidden='true' className='absolute top-5 left-[10%] right-[10%] h-1 rounded-full bg-rose-100'></span>
                <span aria-hidden='true' className='absolute top-5 left-[10%] h-1 rounded-full bg-gradient-to-r from-brand to-berry-dark transition-all duration-1000' style={{ width: `${progress * 0.8}%` }}></span>
                {steps.map((step, i) => {
                    const done = i <= current, now = i === current, entry = lastFor(step.status)
                    return (
                        <li key={step.status} className='relative flex flex-col items-center text-center gap-2 px-1'>
                            <span className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition ${done ? 'bg-berry border-berry text-white shadow-[0_8px_20px_-8px_rgba(210,58,127,.9)]' : 'bg-white border-rose-200 text-rose-300'} ${now && order.status !== 'Delivered' ? 'glow-pulse' : ''}`}>
                                <Icon name={step.icon} size={18} />
                            </span>
                            <span className={`text-sm font-bold ${done ? 'text-ink' : 'text-muted'}`}>{step.label}</span>
                            {done && entry && <span className='text-[11px] text-muted -mt-1.5'>{when(entry.date)}</span>}
                            {entry?.note && <span className='text-[11px] text-berry font-semibold leading-snug'>{entry.note}</span>}
                        </li>
                    )
                })}
            </ol>

            {/* Phones: vertical timeline */}
            <ol className='sm:hidden flex flex-col'>
                {steps.map((step, i) => {
                    const done = i <= current, now = i === current, entry = lastFor(step.status)
                    return (
                        <li key={step.status} className='flex gap-3'>
                            <span className='flex flex-col items-center'>
                                <span className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 ${done ? 'bg-berry border-berry text-white' : 'bg-white border-rose-200 text-rose-300'} ${now && order.status !== 'Delivered' ? 'glow-pulse' : ''}`}><Icon name={step.icon} size={16} /></span>
                                {i < steps.length - 1 && <span className={`w-0.5 flex-1 min-h-6 ${i < current ? 'bg-berry' : 'bg-rose-100'}`}></span>}
                            </span>
                            <span className='pb-4 pt-1.5 text-sm'>
                                <span className={`block font-bold ${done ? 'text-ink' : 'text-muted'}`}>{step.label}</span>
                                <span className='block text-xs text-muted'>{done && entry ? when(entry.date) : step.text}</span>
                                {entry?.note && <span className='block text-xs text-berry font-semibold mt-0.5'>{entry.note}</span>}
                            </span>
                        </li>
                    )
                })}
            </ol>

            {order.status !== 'Delivered' && <p className='text-sm text-mauve'><b className='text-ink'>Now:</b> {steps[current].text}.</p>}
        </div>
    )
}

export default OrderTracker
