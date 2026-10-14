import React, { useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../Context/ShopContext'

const NewsletterBox = () => {

    const { backendUrl } = useContext(ShopContext)
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const onSubmitHandler = async (event)=>{
        event.preventDefault();
        setLoading(true)
        try {
            const { data } = await axios.post(backendUrl + '/api/newsletter/subscribe', { email })
            if (data.success) {
                toast.success(data.message)
                setEmail('')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

  return (
    <section id='newsletter' className='shell pt-20 scroll-mt-24'>
      <div className='bg-blush rounded-[32px] px-6 py-14 sm:px-12 text-center flex flex-col items-center gap-4'>
        <p className='eyebrow'>The gift list</p>
        <h2 className='font-display font-semibold text-[2rem] sm:text-[2.6rem] leading-tight'>Get 20% off your first gift</h2>
        <p className='text-mauve max-w-lg leading-relaxed'>New arrivals, seasonal hampers and member-only offers. No spam — unsubscribe anytime.</p>
        <form onSubmit={onSubmitHandler} className='w-full max-w-lg flex flex-col sm:flex-row gap-3 mt-3'>
            <label htmlFor='newsletter-email' className='sr-only'>Email address</label>
            <input id='newsletter-email' value={email} onChange={(e)=>setEmail(e.target.value)} className='field flex-1 !h-[3.25rem] !rounded-full !px-5' type="email" placeholder='you@example.com' required />
            <button type='submit' disabled={loading} className='btn-primary !bg-ink hover:!bg-black'>{loading ? 'Subscribing…' : 'Subscribe'}</button>
        </form>
      </div>
    </section>
  )
}

export default NewsletterBox
