import React, { useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { AdminLogo } from './Navbar'

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


    return (
        <div className='min-h-screen flex items-center justify-center w-full px-4'>
            <div className='bg-white border border-line rounded-3xl px-8 py-10 w-full max-w-md shadow-sm'>
                <AdminLogo size={44} />
                <h1 className='font-display text-4xl font-semibold mt-8 mb-1'>Admin sign in</h1>
                <p className='text-sm text-mauve mb-6'>Manage products, orders and customer messages.</p>
                <form onSubmit={onSubmitHandler} className='flex flex-col gap-4'>
                    <label className='flex flex-col gap-2 text-sm font-semibold'>Email address
                        <input onChange={(e) => setEmail(e.target.value)} value={email} className='w-full px-4 py-3' type="email" autoComplete='username' required />
                    </label>
                    <label className='flex flex-col gap-2 text-sm font-semibold'>Password
                        <input onChange={(e) => setPassword(e.target.value)} value={password} className='w-full px-4 py-3' type="password" autoComplete='current-password' required />
                    </label>
                    <button disabled={loading} className='btn-dark mt-2 w-full py-3' type='submit'>{loading ? 'Signing in…' : 'Sign in'}</button>
                </form>
            </div>
        </div>
    )
}

export default Login
