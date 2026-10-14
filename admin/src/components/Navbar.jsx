import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from './ui'

export { AdminLogo } from './ui'

const titles = {
  '/dashboard': 'Dashboard', '/list': 'Products', '/add': 'Add product', '/brands': 'Brands', '/inventory': 'Inventory', '/reports': 'Sales & income', '/promotions': 'Offers & coupons',
  '/orders': 'Orders', '/chats': 'Live chats', '/messages': 'Messages',
}

// Top bar: section name, today's date and a quick "add product" action
const Navbar = ({ onMenu }) => {
  const { pathname } = useLocation()
  const today = new Date().toLocaleDateString('en-LK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <header className='sticky top-0 z-30 bg-[#FAF6F7]/85 backdrop-blur border-b border-line'>
      <div className='flex items-center gap-3 h-16 px-4 sm:px-8'>
        <button onClick={onMenu} aria-label='Open menu' className='lg:hidden w-10 h-10 -ml-2 rounded-xl hover:bg-white flex items-center justify-center cursor-pointer'><Icon name='menu' /></button>
        <p className='text-sm text-mauve'>
          <span className='hidden sm:inline'>Admin <span className='mx-1.5 text-line'>/</span></span>
          <b className='text-ink font-semibold'>{titles[pathname] || 'Admin'}</b>
        </p>
        <span className='flex-1'></span>
        <span className='hidden md:flex items-center gap-2 text-sm text-mauve'><Icon name='calendar' size={17} />{today}</span>
        {pathname !== '/add' && (
          <Link to='/add' className='btn-dark flex items-center gap-2 px-4 py-2 text-sm'><Icon name='plus' size={17} strokeWidth={2.2} /><span className='hidden sm:inline'>New product</span></Link>
        )}
      </div>
    </header>
  )
}

export default Navbar
