import React, { useContext, useEffect } from 'react'
import { ShopContext } from '../Context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'

const Verify = () => {

    const { navigate, token, clearCart, backendUrl } = useContext(ShopContext)
    const [searchParams] = useSearchParams()

    const success = searchParams.get('success')
    const orderId = searchParams.get('orderId')


    const verifyPayment = async () => {
        try {
            if (!token) {
                return null
            }
            const response = await axios.post(backendUrl + '/api/orders/verifyStripe', { success, orderId }, { headers: { token } })
            if (response.data.success) {
                clearCart()
                navigate(`/order-success/${orderId}`, { replace: true })
            }else{
                toast.error(success === 'true' ? (response.data.message || 'Payment could not be verified') : 'Payment cancelled')
                navigate('/cart', { replace: true })
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        verifyPayment()
    }, [token])

    return (
        <div className='min-h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-600'>
            <div className='w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin'></div>
            <p>Confirming your payment, please wait...</p>
        </div>
    )
}

export default Verify
