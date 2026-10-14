import React from 'react'
import { NavLink } from 'react-router-dom'

const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
    add: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
    list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
    orders: <><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></>,
    messages: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
    chats: <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.4A8 8 0 1121 12z" />,
}

const links = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/add', label: 'Add product', icon: 'add' },
    { to: '/list', label: 'Products', icon: 'list' },
    { to: '/orders', label: 'Orders', icon: 'orders' },
    { to: '/chats', label: 'Chats', icon: 'chats' },
    { to: '/messages', label: 'Messages', icon: 'messages' },
]

const Sidebar = () => {
    return (
        <aside className='w-[18%] min-h-screen border-r border-line bg-[#FCF9FA]'>
            <nav className='flex flex-col gap-2 pt-6 pl-[16%] text-[15px]'>
                {links.map(link => (
                    <NavLink key={link.to} to={link.to} className='side-link flex items-center gap-3 border border-transparent border-r-0 px-3 py-2.5 rounded-l-xl text-mauve hover:bg-white'>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[link.icon]}</svg>
                        <span className='hidden md:block'>{link.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}

export default Sidebar
