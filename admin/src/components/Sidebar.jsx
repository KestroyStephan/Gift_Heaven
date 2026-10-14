import React from 'react'
import { NavLink } from 'react-router-dom'
import { AdminLogo, Icon } from './ui'

const groups = [
  { label: 'Overview', links: [{ to: '/dashboard', label: 'Dashboard', icon: 'dashboard' }] },
  {
    label: 'Catalogue', links: [
      { to: '/list', label: 'Products', icon: 'list' },
      { to: '/add', label: 'Add product', icon: 'add' },
      { to: '/brands', label: 'Brands', icon: 'tag' },
      { to: '/inventory', label: 'Inventory', icon: 'box', badge: 'stock' },
    ]
  },
  {
    label: 'Sales', links: [
      { to: '/orders', label: 'Orders', icon: 'orders', badge: 'orders' },
      { to: '/reports', label: 'Sales & income', icon: 'chart' },
      { to: '/promotions', label: 'Offers & coupons', icon: 'gift' },
    ]
  },
  {
    label: 'Customers', links: [
      { to: '/chats', label: 'Live chats', icon: 'chats', badge: 'chats' },
      { to: '/messages', label: 'Messages', icon: 'messages', badge: 'messages' },
      { to: '/reviews', label: 'Reviews', icon: 'star', badge: 'reviews' },
    ]
  },
]

const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:5173'

const Sidebar = ({ badges = {}, open, onClose, onLogout }) => {
  return (
    <>
      {open && <div className='fixed inset-0 bg-black/40 z-40 lg:hidden' onClick={onClose}></div>}
      <aside className={`sidebar fixed lg:sticky top-0 left-0 z-50 h-screen w-[264px] shrink-0 flex flex-col transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className='px-6 pt-6 pb-5 flex items-center justify-between'>
          <AdminLogo size={38} light />
          <button onClick={onClose} aria-label='Close menu' className='lg:hidden text-white/70 hover:text-white cursor-pointer'><Icon name='close' /></button>
        </div>

        <nav className='flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-5'>
          {groups.map(group => (
            <div key={group.label} className='flex flex-col gap-1'>
              <p className='px-3 mb-1 text-[10.5px] font-bold tracking-[0.18em] uppercase text-white/40'>{group.label}</p>
              {group.links.map(link => (
                <NavLink key={link.to} to={link.to} onClick={onClose} className='side-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14.5px] font-medium'>
                  <Icon name={link.icon} size={19} />
                  <span className='flex-1'>{link.label}</span>
                  {badges[link.badge] > 0 && <span className='min-w-5 h-5 px-1.5 rounded-full bg-gold text-ink text-[11px] font-bold flex items-center justify-center'>{badges[link.badge]}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className='p-4 flex flex-col gap-3 border-t border-white/10'>
          <a href={storeUrl} target='_blank' rel='noreferrer' className='flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white/85 text-sm font-medium'>
            <Icon name='store' size={18} /> <span className='flex-1'>View storefront</span> <span aria-hidden='true'>↗</span>
          </a>
          <div className='flex items-center gap-3 px-2'>
            <span className='w-9 h-9 rounded-full bg-gradient-to-br from-gold to-[#E0B866] text-ink text-sm font-bold flex items-center justify-center'>SH</span>
            <span className='flex-1 leading-tight'>
              <span className='block text-sm font-semibold text-white'>Store admin</span>
              <span className='block text-xs text-white/50'>Surprise Heaven</span>
            </span>
            <button onClick={onLogout} aria-label='Log out' title='Log out' className='w-9 h-9 rounded-full text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer'><Icon name='logout' size={18} /></button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
