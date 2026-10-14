import React, { useContext, useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import Logo from './Logo'
import Icon from './Icons'
import { DepartmentBar, departments, departmentLink } from './Mall'

const links = [
    { to: '/', label: 'Home' },
    { to: '/collection', label: 'Shop' },
    { to: '/brands', label: 'Brands' },
    { to: '/offers', label: 'Offers' },
    { to: '/build-a-box', label: 'Build a box' },
    { to: '/cakes', label: 'Cakes' },
    { to: '/custom-studio', label: 'Custom studio' },
    { to: '/gift-guide', label: 'Gift guide' },
    { to: '/contact', label: 'Contact' },
]

const Navbar = () => {

    const [visible, setVisible] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const { setShowSearch, getCartCount, navigate, token, logout, publicCoupons, wishlist, products } = useContext(ShopContext);
    const wishCount = products.length ? wishlist.filter(id => products.some(p => p._id === id)).length : wishlist.length
    const promo = publicCoupons.find(c => c.firstOrderOnly) || publicCoupons[0]
    const location = useLocation()

    // Close menus whenever the page changes
    useEffect(() => { setVisible(false); setMenuOpen(false) }, [location.pathname])

    const iconButton = 'w-11 h-11 rounded-full flex items-center justify-center text-ink hover:bg-rose-50 cursor-pointer'

    return (
        <>
            <div className='bg-ink text-[#F6E9EE] text-[13px] px-4 py-2.5 flex flex-wrap justify-center gap-x-8 gap-y-1 text-center'>
                <span>Same-day delivery in Colombo for orders before 2 pm</span>
                {promo
                    ? <Link to='/offers' className='text-gold-light hidden sm:inline hover:underline underline-offset-4'>{promo.description} — use <b className='tracking-wider'>{promo.code}</b></Link>
                    : <span className='text-gold-light hidden sm:inline'>Free hand-lettered gift note with every order</span>}
            </div>

            <header className='sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-line'>
                <div className='shell flex items-center justify-between gap-6 py-3.5'>
                    <Link to='/' aria-label='Surprise Heaven home'><Logo size={42} /></Link>

                    <nav aria-label='Main' className='hidden lg:flex gap-7 text-sm font-semibold'>
                        {links.map(link => (
                            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={`nav-link hover:text-berry ${link.to === '/offers' ? 'text-berry' : 'text-ink'}`}>{link.label}</NavLink>
                        ))}
                    </nav>

                    <div className='flex items-center gap-1'>
                        <button aria-label='Search gifts' onClick={() => { setShowSearch(true); navigate('/collection') }} className={iconButton}>
                            <Icon name='search' />
                        </button>

                        <Link to='/wishlist' aria-label={`Wishlist, ${wishCount} saved`} className={`${iconButton} relative`}>
                            <Icon name='heart' />
                            {wishCount > 0 && <span className='absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-berry text-white text-[10px] font-bold flex items-center justify-center'>{wishCount}</span>}
                        </Link>

                        <div className='relative'>
                            <button aria-label='Account' aria-expanded={menuOpen} onClick={() => token ? setMenuOpen(!menuOpen) : navigate('/login')} className={iconButton}>
                                <Icon name='user' />
                            </button>
                            {token && menuOpen && (
                                <div className='absolute right-0 top-12 w-48 bg-white border border-line rounded-2xl shadow-lg py-2 text-sm'>
                                    <button onClick={() => navigate('/profile')} className='w-full text-left px-4 py-2.5 hover:bg-rose-50 cursor-pointer'>My profile</button>
                                    <button onClick={() => navigate('/orders')} className='w-full text-left px-4 py-2.5 hover:bg-rose-50 cursor-pointer'>My orders</button>
                                    <button onClick={() => navigate('/wishlist')} className='w-full text-left px-4 py-2.5 hover:bg-rose-50 cursor-pointer'>My wishlist</button>
                                    <hr className='my-1 border-line' />
                                    <button onClick={() => logout()} className='w-full text-left px-4 py-2.5 hover:bg-rose-50 text-berry cursor-pointer'>Log out</button>
                                </div>
                            )}
                        </div>

                        <Link to='/cart' aria-label={`Shopping bag, ${getCartCount()} items`} className='ml-1 h-11 px-4 rounded-full bg-berry hover:bg-berry-dark text-white flex items-center gap-2 text-sm font-bold'>
                            <Icon name='bag' size={18} />
                            <span>{getCartCount()}</span>
                        </Link>

                        <button aria-label='Open menu' onClick={() => setVisible(true)} className={`${iconButton} lg:hidden`}>
                            <Icon name='menu' />
                        </button>
                    </div>
                </div>
                <div className='hidden md:block'><DepartmentBar /></div>
            </header>

            {/* Drawer menu for small screens */}
            {visible && <div className='fixed inset-0 bg-ink/40 z-50 lg:hidden' onClick={() => setVisible(false)} />}
            <aside aria-hidden={!visible} className={`fixed z-50 top-0 right-0 bottom-0 w-[82%] max-w-sm bg-white shadow-xl transition-transform duration-300 lg:hidden ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className='flex items-center justify-between p-4 border-b border-line'>
                    <Logo size={36} />
                    <button aria-label='Close menu' onClick={() => setVisible(false)} className={iconButton}><Icon name='close' /></button>
                </div>
                <nav className='flex flex-col p-2 text-base font-semibold'>
                    {links.map(link => (
                        <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `px-4 py-3.5 rounded-xl ${isActive ? 'bg-rose-50 text-berry' : 'text-ink'}`}>{link.label}</NavLink>
                    ))}
                    <hr className='my-2 border-line' />
                    <p className='px-4 pt-2 pb-1 text-xs font-bold tracking-[0.14em] text-muted'>DEPARTMENTS</p>
                    {departments.map(d => <Link key={d.slug} to={departmentLink(d)} className='px-4 py-2.5 rounded-xl text-[15px] font-medium text-mauve'>{d.name}</Link>)}
                    <hr className='my-2 border-line' />
                    {token ? (
                        <>
                            <NavLink to='/profile' className='px-4 py-3.5 rounded-xl text-ink'>My profile</NavLink>
                            <NavLink to='/orders' className='px-4 py-3.5 rounded-xl text-ink'>My orders</NavLink>
                            <button onClick={() => logout()} className='text-left px-4 py-3.5 rounded-xl text-berry cursor-pointer'>Log out</button>
                        </>
                    ) : (
                        <NavLink to='/login' className='px-4 py-3.5 rounded-xl text-ink'>Log in / Sign up</NavLink>
                    )}
                </nav>
            </aside>
        </>
    )
}

export default Navbar
