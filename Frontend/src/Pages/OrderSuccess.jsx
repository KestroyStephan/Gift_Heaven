import React, { useContext, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { ShopContext } from '../Context/ShopContext'
import OrderTracker from '../Components/OrderTracker'
import CustomSummary from '../Components/CustomSummary'

const OrderSuccess = () => {

    const { orderId } = useParams()
    const { backendUrl, token, currency, handleAuthError } = useContext(ShopContext)
    const [order, setOrder] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!token) return
        axios.post(backendUrl + '/api/orders/single', { orderId }, { headers: { token } })
            .then(({ data }) => {
                if (handleAuthError(data)) return
                if (data.success) setOrder(data.order)
                else setError(data.message)
            })
            .catch(err => setError(err.message))
    }, [token, orderId])

    if (error) return <p className='border-t pt-16 text-center text-gray-600'>{error}</p>
    if (!order) return <div className='min-h-[50vh]'></div>

    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return (
        <div className='border-t pt-14 max-w-3xl mx-auto'>
            <div className='text-center'>
                <div className='mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-3xl'>✓</div>
                <h1 className='prata-regular text-3xl mt-4 text-gray-800'>Thank you for your order!</h1>
                <p className='text-gray-500 mt-2'>
                    Order <b>#{String(order._id).slice(-8).toUpperCase()}</b> has been {order.payment ? 'paid and ' : ''}confirmed.
                    A confirmation has been sent to {order.address.email}.
                </p>
            </div>

            <div className='mt-10 border p-6'>
                <p className='font-medium mb-4'>Order status</p>
                <OrderTracker order={order} />
            </div>

            <div className='mt-6 grid sm:grid-cols-2 gap-6'>
                <div className='border p-6 text-sm text-gray-600'>
                    <p className='font-medium text-gray-800 mb-2'>Delivering to</p>
                    <p>{order.address.firstName} {order.address.lastName}</p>
                    <p>{order.address.street}</p>
                    <p>{order.address.city}, {order.address.state} {order.address.zipcode}</p>
                    <p>{order.address.country}</p>
                    <p>{order.address.phone}</p>
                </div>
                <div className='border p-6 text-sm text-gray-600'>
                    <p className='font-medium text-gray-800 mb-2'>Payment</p>
                    <p>Method: {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</p>
                    <p>Status: <span className={order.payment ? 'text-green-600' : 'text-amber-600'}>{order.payment ? 'Paid' : 'Pay on delivery'}</span></p>
                    <p>Date: {new Date(order.date).toLocaleString()}</p>
                </div>
            </div>

            <div className='mt-6 border p-6 text-sm'>
                {order.items.map((item, index) => (
                    <div key={index} className='flex items-center gap-4 py-3 border-b last:border-b-0'>
                        <img src={item.image[0]} className='w-14' alt={item.name} />
                        <div className='flex-1'>
                            <p className='font-medium'>{item.name}</p>
                            <p className='text-gray-500'>Size: {item.size} · Qty: {item.quantity}</p>
                            <CustomSummary custom={item.custom} />
                        </div>
                        <p>{currency}{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
                <div className='flex justify-between mt-4 text-gray-600'><p>Subtotal</p><p>{currency}{subtotal.toFixed(2)}</p></div>
                <div className='flex justify-between text-gray-600'><p>Shipping</p><p>{currency}{(order.amount - subtotal).toFixed(2)}</p></div>
                <div className='flex justify-between font-semibold mt-1'><p>Total</p><p>{currency}{order.amount.toFixed(2)}</p></div>
            </div>

            <div className='flex justify-center gap-4 mt-10'>
                <Link to='/orders' className='bg-rose-600 text-white px-8 py-3 text-sm'>VIEW MY ORDERS</Link>
                <Link to='/collection' className='border border-rose-600 text-rose-600 px-8 py-3 text-sm'>CONTINUE SHOPPING</Link>
            </div>
        </div>
    )
}

export default OrderSuccess
