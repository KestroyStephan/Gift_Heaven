import React, { useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { AdminLogo, Icon } from './ui'

const Login = ({ setToken }) => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true)
        try {
            const response = await axios.post(backendUrl + '/api/user/admin', { email, password })
            if (response.data.success) {
                setToken(response.data.token)
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }


    const highlights = [
        { icon: 'revenue', text: 'Live sales, best sellers and payments at a glance' },
        { icon: 'gift', text: 'Pack surprise boxes, cakes and handmade albums from one list' },
        { icon: 'chats', text: 'Reply to customers planning their custom gifts' },
    ]

    return (
        <div className='min-h-screen grid lg:grid-cols-[1.05fr_1fr] w-full'>
            {/* Brand panel */}
            <div className='sidebar relative hidden lg:flex flex-col justify-between p-12 overflow-hidden text-white'>
                <svg className='absolute -right-24 -bottom-24 w-[460px] opacity-[0.07]' viewBox='0 0 48 48' aria-hidden='true'>
                    <path d='M24 15.5C24 15.5 14 10.8 14 6.4C14 3.6 16.4 2 18.7 2C20.9 2 22.6 3.4 24 5.4C25.4 3.4 27.1 2 29.3 2C31.6 2 34 3.6 34 6.4C34 10.8 24 15.5 24 15.5Z' fill='#fff' />
                    <rect x='6' y='16' width='36' height='8' rx='2.5' fill='#fff' /><rect x='8.5' y='24' width='31' height='20' rx='3' fill='#fff' />
                </svg>
                <AdminLogo size={44} light />
                <div className='relative max-w-md'>
                    <p className='text-gold text-xs font-bold tracking-[0.25em] uppercase mb-4'>Store management</p>
                    <h2 className='font-display text-5xl leading-[1.05] font-semibold'>Every gift, every order, <i>beautifully</i> in hand.</h2>
                    <ul className='mt-10 flex flex-col gap-4'>
                        {highlights.map(h => (
                            <li key={h.icon} className='flex items-center gap-3 text-white/80 text-[15px]'>
                                <span className='w-9 h-9 rounded-xl bg-white/10 text-gold flex items-center justify-center shrink-0'><Icon name={h.icon} size={18} /></span>{h.text}
                            </li>
                        ))}
                    </ul>
                </div>
                <p className='relative text-xs text-white/40'>© {new Date().getFullYear()} Surprise Heaven · Colombo, Sri Lanka</p>
            </div>

            {/* Sign-in form */}
            <div className='flex items-center justify-center px-5 py-12'>
                <div className='w-full max-w-[400px]'>
                    <div className='lg:hidden mb-10'><AdminLogo size={44} /></div>
                    <h1 className='font-display text-[2.6rem] leading-tight font-semibold text-ink'>Welcome back</h1>
                    <p className='text-sm text-mauve mt-1 mb-8'>Sign in to manage products, orders and customer messages.</p>
                    <form onSubmit={onSubmitHandler} className='flex flex-col gap-5'>
                        <label className='label'>Email address
                            <input onChange={(e) => setEmail(e.target.value)} value={email} className='w-full px-4 py-3 font-normal' type="email" autoComplete='username' placeholder='admin@surpriseheaven.lk' required />
                        </label>
                        <label className='label'>Password
                            <input onChange={(e) => setPassword(e.target.value)} value={password} className='w-full px-4 py-3 font-normal' type="password" autoComplete='current-password' required />
                        </label>
                        <button disabled={loading} className='btn-dark mt-2 w-full py-3.5' type='submit'>{loading ? 'Signing in…' : 'Sign in to dashboard'}</button>
                    </form>
                    <p className='mt-8 text-xs text-mauve flex items-center gap-2'><Icon name='sparkle' size={14} className='text-gold' />Admin access only. Customers sign in on the storefront.</p>
                </div>
            </div>
        </div>
    )
}

export default Login
