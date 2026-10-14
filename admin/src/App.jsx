import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import Dashboard from './pages/Dashboard'
import Messages from './pages/Messages'
import Chats from './pages/Chats'
import Brands from './pages/Brands'
import Inventory from './pages/Inventory'
import Reports from './pages/Reports'
import Login from './components/Login'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
// Must match STORE_CURRENCY in the backend .env
export const currency = import.meta.env.VITE_CURRENCY_SYMBOL || 'Rs. '

// Shared product options for Add / Edit
export const categories = [
  { value: 'ChocolateBucket', label: 'Chocolate Bucket' },
  { value: 'Bouquet', label: 'Bouquet' },
  { value: 'GiftHamper', label: 'Gift Hamper' },
  { value: 'Teddy', label: 'Teddy & Plush' },
  { value: 'LoveFocil', label: 'Love Box' },
  { value: 'Personalised', label: 'Personalised' },
  { value: 'CustomPrint', label: 'Custom Printing' },
  { value: 'Cake', label: 'Cake' },
  { value: 'Festive', label: 'Festive & Cultural' },
  { value: 'GiftPackage', label: 'Gift Packages' },
  { value: 'Toys', label: 'Kids & Toys' },
  { value: 'Baby', label: 'Baby' },
  { value: 'Jewellery', label: 'Jewellery' },
  { value: 'Plants', label: 'Plants & Pots' },
  { value: 'HomeDecor', label: 'Home & Décor' },
  { value: 'Stationery', label: 'Pens & Key Tags' },
  { value: 'ArtSupplies', label: 'Art & Drawing' },
  { value: 'Games', label: 'Games & Puzzles' },
  { value: 'Accessories', label: 'Fashion Accessories' },
  { value: 'KitchenDining', label: 'Kitchen & Dining' },
  { value: 'Fragrances', label: 'Perfumes & Fragrances' },
  { value: 'Watches', label: 'Watches' },
  { value: 'BagsWallets', label: 'Bags & Wallets' },
  { value: 'Footwear', label: 'Shoes' },
  { value: 'Eyewear', label: 'Sunglasses' },
  { value: 'Beauty', label: 'Makeup & Beauty' },
  { value: 'Tech', label: 'Tech Accessories' },
  { value: 'Gaming', label: 'Gaming Accessories' },
]
export const recipientOptions = [
  { value: 'her', label: 'Her' }, { value: 'him', label: 'Him' }, { value: 'couples', label: 'Couples' },
  { value: 'kids', label: 'Kids' }, { value: 'teens', label: 'Teens' }, { value: 'elders', label: 'Elders' }, { value: 'baby', label: 'Baby' },
]
export const subCategories = [
  { value: 'BirthdayGift', label: 'Birthday' },
  { value: 'AnniversaryGift', label: 'Anniversary' },
  { value: 'WeddingGift', label: 'Wedding' },
  { value: 'HousewarmingGift', label: 'Housewarming' },
  { value: 'BabyGift', label: 'New Baby' },
  { value: 'GraduationGift', label: 'Graduation' },
  { value: 'ValentineGift', label: "Valentine's" },
  { value: 'SurpriseGift', label: 'Surprise' },
  { value: 'ThankYouGift', label: 'Thank You' },
  { value: 'AvuruduGift', label: 'Sinhala & Tamil New Year' },
  { value: 'PongalGift', label: 'Thai Pongal' },
  { value: 'DiwaliGift', label: 'Diwali' },
  { value: 'EidGift', label: 'Eid' },
  { value: 'ChristmasGift', label: 'Christmas' },
]
export const sizeOptions = ["S", "M", "L"]


const App = () => {

  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '');

  useEffect(() => {
    localStorage.setItem('token', token)
  }, [token])

  // Send the admin back to the login screen when the session expires
  useEffect(() => {
    const id = axios.interceptors.response.use((response) => {
      if (response.data?.success === false && /Login Again/i.test(response.data?.message || '')) {
        toast.info('Session expired, please log in again')
        setToken('')
      }
      return response
    })
    return () => axios.interceptors.response.eject(id)
  }, [])


  // Sidebar badges: new orders, unread chats and messages (refreshed every 30 s)
  const [badges, setBadges] = useState({})
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    if (!token) return
    const load = () => axios.post(backendUrl + '/api/orders/stats', {}, { headers: { token } })
      .then(({ data }) => data.success && setBadges({ orders: data.stats.byStatus['Order Placed'], chats: data.stats.unreadChats, messages: data.stats.unreadMessages, stock: data.stats.stockAlerts }))
      .catch(() => {})
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [token])


  return (
    <div className='min-h-screen'>
      <ToastContainer position='top-right' autoClose={2500} />

      {token === "" ? <Login setToken={setToken} /> :
        <div className='flex'>
          <Sidebar badges={badges} open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={() => setToken('')} />
          <div className='flex-1 min-w-0 flex flex-col'>
            <Navbar onMenu={() => setMenuOpen(true)} />
            <main className='w-full max-w-[1240px] mx-auto px-4 sm:px-8 py-8 text-mauve text-[15px]'>

              <Routes>
                <Route path='/' element={<Navigate to='/dashboard' replace />} />
                <Route path='/dashboard' element={<Dashboard token={token} />} />
                <Route path='/add' element={<Add token={token} />} />
                <Route path='/list' element={<List token={token} />} />
                <Route path='/orders' element={<Orders token={token} />} />
                <Route path='/messages' element={<Messages token={token} />} />
                <Route path='/chats' element={<Chats token={token} />} />
                <Route path='/brands' element={<Brands token={token} />} />
                <Route path='/inventory' element={<Inventory token={token} />} />
                <Route path='/reports' element={<Reports token={token} />} />
                <Route path='*' element={<Navigate to='/dashboard' replace />} />
              </Routes>

            </main>
          </div>
        </div>
      }

    </div>
  )
}

export default App
