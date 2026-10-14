import React, { useContext, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../Context/ShopContext'

const ResetPassword = () => {

    const { token: resetToken } = useParams()
    const { backendUrl, setToken, navigate } = useContext(ShopContext)
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        if (password !== confirm) return toast.error('Passwords do not match')

        try {
            const { data } = await axios.post(backendUrl + '/api/user/reset-password', { token: resetToken, password })
            if (data.success) {
                toast.success(data.message)
                localStorage.setItem('token', data.token)
                setToken(data.token)
                navigate('/')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-700'>
            <div className='inline-flex items-center gap-2 mb-2 mt-10'>
                <p className='prata-regular text-3xl'>New Password</p>
                <hr className='border-none h-[1.5px] w-8 bg-rose-800' />
            </div>
            <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" minLength={8} className='w-full px-3 py-2 border border-rose-300' placeholder='New password (min 8 characters)' required />
            <input onChange={(e) => setConfirm(e.target.value)} value={confirm} type="password" minLength={8} className='w-full px-3 py-2 border border-rose-300' placeholder='Confirm new password' required />
            <button className='bg-rose-600 text-white font-light px-8 py-2 mt-4 cursor-pointer'>Update Password</button>
        </form>
    )
}

export default ResetPassword
