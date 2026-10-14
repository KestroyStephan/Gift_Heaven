import React from 'react'

const steps = ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered']

// Horizontal progress bar of an order's delivery status
const OrderTracker = ({ order }) => {

    if (order.status === 'Cancelled') {
        return <p className='text-sm text-red-600 font-medium'>This order has been cancelled.</p>
    }

    const current = steps.indexOf(order.status)
    const reachedAt = (step) => (order.statusHistory || []).findLast?.(h => h.status === step)?.date

    return (
        <ol className='flex flex-col sm:flex-row gap-3 sm:gap-0 w-full'>
            {steps.map((step, index) => {
                const done = index <= current
                const date = reachedAt(step)
                return (
                    <li key={step} className='flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 flex-1'>
                        <div className='flex items-center sm:w-full'>
                            <span className={`w-4 h-4 rounded-full shrink-0 border-2 ${done ? 'bg-rose-600 border-rose-600' : 'bg-white border-gray-300'}`}></span>
                            {index < steps.length - 1 && (
                                <span className={`hidden sm:block h-[2px] flex-1 ${index < current ? 'bg-rose-600' : 'bg-gray-200'}`}></span>
                            )}
                        </div>
                        <div className='text-xs'>
                            <p className={done ? 'text-gray-800 font-medium' : 'text-gray-400'}>{step}</p>
                            {done && date && <p className='text-gray-400'>{new Date(date).toLocaleString()}</p>}
                        </div>
                    </li>
                )
            })}
        </ol>
    )
}

export default OrderTracker
