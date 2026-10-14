import React, { useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Logo from '../Components/Logo';
import Icon from '../Components/Icons';

const Login = () => {

  const [currentState, setCurrentState] = useState('Login');
  const {token, setToken, navigate, backendUrl} = useContext(ShopContext)
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [name,setName] = useState('')
  const [password,setPassword] = useState('')
  const [email,setEmail] = useState('')
  const [loading, setLoading] = useState(false)


  const onSubmitHandler = async(event) =>{
    event.preventDefault();
    setLoading(true)

    try {

      if (currentState === 'Forgot Password') {
        const response = await axios.post(backendUrl + '/api/user/forgot-password', {email})
        if (response.data.success) {
          toast.success(response.data.message)
          setCurrentState('Login')
        } else {
          toast.error(response.data.message)
        }

      } else if (currentState === "Sign Up") {
        const response = await axios.post(backendUrl + '/api/user/register', {name,email,password})
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token',response.data.token)
          toast.success('Welcome to Surprise Heaven!')

        }else{
          toast.error(response.data.message)
        }

      } else {
        const response = await axios.post(backendUrl + '/api/user/login', {email,password})
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token',response.data.token)

        }else{
          toast.error(response.data.message)
        }

      }


    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }


  useEffect(()=>{
    if (token) {
      navigate(redirect.startsWith('/') ? redirect : '/')

    }
  },[token])



  const title = { 'Login': 'Welcome back', 'Sign Up': 'Create your account', 'Forgot Password': 'Reset your password' }[currentState]
  const subtitle = {
    'Login': 'Sign in to check out faster and track your orders.',
    'Sign Up': 'Save your bag, track orders and get member offers.',
    'Forgot Password': "Enter your email and we'll send you a reset link.",
  }[currentState]

  return (
    <div className='py-12 grid lg:grid-cols-2 gap-10 items-stretch'>
      <div className='hidden lg:flex rounded-[32px] bg-ink text-[#F6E9EE] p-12 flex-col justify-between'>
        <Logo size={48} light />
        <div>
          <p className='font-display text-5xl text-white leading-tight'>Every surprise <span className='italic text-[#F2B8C9]'>starts here</span>.</p>
          <ul className='mt-8 flex flex-col gap-3 text-[#D9C6CE]'>
            {['Track every order to the door', 'Save your bag across devices', 'Member-only offers'].map(item => (
              <li key={item} className='flex items-center gap-3'><Icon name='check' size={18} className='text-gold-light' strokeWidth={2.2} />{item}</li>
            ))}
          </ul>
        </div>
        <p className='text-sm text-[#D9C6CE]'>Secure sign-in · your details stay private</p>
      </div>

      <form onSubmit={onSubmitHandler} className='bg-white border border-line rounded-[32px] p-8 sm:p-12 flex flex-col gap-5 justify-center'>
        <div className='flex flex-col gap-2 mb-2'>
          <h1 className='font-display font-semibold text-4xl sm:text-5xl'>{title}</h1>
          <p className='text-mauve'>{subtitle}</p>
        </div>

        {currentState === 'Sign Up' && (
          <label className='flex flex-col gap-2 text-sm font-semibold'>Full name
            <input onChange={(e)=>setName(e.target.value)} value={name} type="text" autoComplete='name' className='field' required />
          </label>
        )}
        <label className='flex flex-col gap-2 text-sm font-semibold'>Email
          <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" autoComplete='email' className='field' required />
        </label>
        {currentState !== 'Forgot Password' && (
          <label className='flex flex-col gap-2 text-sm font-semibold'>
            <span className='flex justify-between'>Password
              {currentState === 'Login' && <button type='button' onClick={()=>setCurrentState('Forgot Password')} className='font-semibold text-berry cursor-pointer'>Forgot password?</button>}
            </span>
            <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" autoComplete={currentState === 'Sign Up' ? 'new-password' : 'current-password'} minLength={currentState === 'Sign Up' ? 8 : undefined} className='field' required />
            {currentState === 'Sign Up' && <span className='text-xs font-medium text-muted'>At least 8 characters</span>}
          </label>
        )}

        <button disabled={loading} className='btn-primary w-full mt-2'>
          {loading ? 'Please wait…' : currentState === 'Login' ? 'Sign in' : currentState === 'Sign Up' ? 'Create account' : 'Send reset link'}
        </button>

        <p className='text-sm text-center text-mauve'>
          {currentState === 'Login'
            ? <>New to Surprise Heaven? <button type='button' onClick={()=>setCurrentState('Sign Up')} className='font-bold text-berry cursor-pointer'>Create an account</button></>
            : <>Already have an account? <button type='button' onClick={()=>setCurrentState('Login')} className='font-bold text-berry cursor-pointer'>Sign in</button></>}
        </p>
      </form>
    </div>
  )
}

export default Login
