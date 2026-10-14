import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../Context/ShopContext'
import Title from '../Components/Title'

const Profile = () => {

    const { backendUrl, token, navigate, logout, handleAuthError } = useContext(ShopContext)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')

    useEffect(() => {
        if (!token) return navigate('/login?redirect=/profile')
        axios.post(backendUrl + '/api/user/profile', {}, { headers: { token } })
            .then(({ data }) => {
                if (handleAuthError(data)) return
                if (data.success) {
                    setName(data.user.name)
                    setEmail(data.user.email)
                }
            })
            .catch(error => toast.error(error.message))
    }, [token])

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        try {
            const { data } = await axios.post(backendUrl + '/api/user/profile/update', { name, currentPassword, newPassword }, { headers: { token } })
            if (handleAuthError(data)) return
            if (data.success) {
                toast.success(data.message)
                setCurrentPassword('')
                setNewPassword('')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className='border-t pt-14'>
            <div className='text-2xl'>
                <Title text1={'MY'} text2={'PROFILE'} />
            </div>

            <form onSubmit={onSubmitHandler} className='flex flex-col gap-4 max-w-md mt-6 text-gray-700'>
                <label className='text-sm'>Name
                    <input value={name} onChange={(e) => setName(e.target.value)} className='mt-1 w-full px-3 py-2 border border-rose-300' required />
                </label>
                <label className='text-sm'>Email
                    <input value={email} disabled className='mt-1 w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500' />
                </label>

                <p className='mt-4 font-medium'>Change password <span className='text-gray-400 font-normal text-sm'>(optional)</span></p>
                <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type='password' placeholder='Current password' className='w-full px-3 py-2 border border-rose-300' />
                <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type='password' minLength={8} placeholder='New password (min 8 characters)' className='w-full px-3 py-2 border border-rose-300' />

                <div className='flex gap-4 mt-4'>
                    <button type='submit' className='bg-rose-600 text-white px-8 py-3 text-sm cursor-pointer'>SAVE CHANGES</button>
                    <button type='button' onClick={() => navigate('/orders')} className='border border-rose-600 text-rose-600 px-8 py-3 text-sm cursor-pointer'>MY ORDERS</button>
                </div>
                <button type='button' onClick={() => logout()} className='text-sm text-gray-500 underline self-start mt-2 cursor-pointer'>Log out</button>
            </form>
        </div>
    )
}

export default Profile
