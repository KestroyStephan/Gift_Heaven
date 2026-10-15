import React, { useEffect } from 'react'
import {Routes,Route, useLocation, Link} from 'react-router-dom'

import Home from './Pages/Home'
import Collection from './Pages/Collection'
import About from './Pages/About'
import Contact from './Pages/Contact'
import Product from './Pages/Product'
import Cart from './Pages/Cart'
import Login from './Pages/Login'
import PlaceOrder from './Pages/PlaceOrder'
import Orders from './Pages/Orders'

import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import Searchbar from './Components/Searchbar'
import Verify from './Pages/Verify'
import OrderSuccess from './Pages/OrderSuccess'
import Profile from './Pages/Profile'
import ResetPassword from './Pages/ResetPassword'
import Cakes from './Pages/Cakes'
import CustomStudio from './Pages/CustomStudio'
import GiftGuide from './Pages/GiftGuide'
import BuildBox from './Pages/BuildBox'
import Brands from './Pages/Brands'
import Brand from './Pages/Brand'
import Offers from './Pages/Offers'
import Track from './Pages/Track'
import Rider from './Pages/Rider'
import Wishlist, { SharedWishlist } from './Pages/Wishlist'
import ChatWidget from './Components/ChatWidget'
import useReveal from './Components/useReveal'
import ErrorBoundary from './Components/ErrorBoundary'

import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

// Pages that draw their own full-width bands
const fullBleed = ['/', '/about', '/contact', '/cakes', '/custom-studio', '/gift-guide', '/build-a-box']

const NotFound = () => (
  <div className='py-24 text-center flex flex-col items-center gap-4'>
    <p className='font-display text-5xl font-semibold'>Page not found</p>
    <p className='text-mauve'>The page you're looking for has moved or no longer exists.</p>
    <Link to='/' className='btn-primary mt-2'>Back to home</Link>
  </div>
)

const App = () => {

  const { pathname } = useLocation()

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  useReveal(pathname)

  return (
    <div className='min-h-screen flex flex-col'>
      <ToastContainer position='top-right' autoClose={3000} />
      <Navbar />
      <Searchbar />
      <main className={`flex-1 ${fullBleed.includes(pathname) ? '' : 'shell w-full'}`}>
        <ErrorBoundary resetKey={pathname}>
        <Routes>

          <Route path='/' element={<Home />} />
          <Route path='/collection' element={<Collection />} />
          <Route path='/cakes' element={<Cakes />} />
          <Route path='/custom-studio' element={<CustomStudio />} />
          <Route path='/gift-guide' element={<GiftGuide />} />
          <Route path='/build-a-box' element={<BuildBox />} />
          <Route path='/brands' element={<Brands />} />
          <Route path='/offers' element={<Offers />} />
          <Route path='/track' element={<Track />} />
          <Route path='/rider/:token' element={<Rider />} />
          <Route path='/wishlist' element={<Wishlist />} />
          <Route path='/wishlist/shared/:shareId' element={<SharedWishlist />} />
          <Route path='/brand/:slug' element={<Brand />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/product/:productId' element={<Product />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/login' element={<Login />} />
          <Route path='/place-order' element={<PlaceOrder />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/order-success/:orderId' element={<OrderSuccess />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/reset-password/:token' element={<ResetPassword />} />
          <Route path='*' element={<NotFound />} />

        </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}

export default App
