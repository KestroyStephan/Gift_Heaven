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
    const { setShowSearch, getCartCount, navigate, token, logout, publicCoupons, offers, wishlist, products } = useContext(ShopContext);
    const wishCount = products.length ? wishlist.filter(id => products.some(p => p._id === id)).length : wishlist.length
    const promo = publicCoupons.find(c => c.firstOrderOnly) || publicCoupons[0]
    const location = useLocation()

    // Close menus whenever the page changes
    useEffect(() => { setVisible(false); setMenuOpen(false) }, [location.pathname])

    const iconButton = 'icon-btn'

    // Glass header gets a shadow once the page scrolls
    const [scrolled, setScrolled] = useState(false)
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Promotions that scroll across the top bar
    const tickerItems = [
        'Same-day delivery in Colombo for orders before 2 pm',
        ...(promo ? [`${promo.description} — use code ${promo.code}`] : []),
        ...offers.slice(0, 3).map(o => `${o.name}: ${o.type === 'percent' ? `${o.value}% off` : `Rs. ${o.value} off`}`),
        'Free hand-lettered gift note with every order',
        'Build your own surprise box — gifts, cake & photo album',
        'Cash on delivery available',
    ]

    const leftLinks = links.filter(l => ['/collection', '/brands', '/offers', '/build-a-box', '/gift-guide'].includes(l.to))
    const rightLinks = links.filter(l => ['/cakes', '/custom-studio'].includes(l.to))
    const navItem = (link) => <NavLink key={link.to} to={link.to} end={link.to === '/'} className='nav-link'>{link.label}</NavLink>

    return (
        <>
            <div className='ticker relative overflow-hidden bg-gradient-to-r from-berry via-[#C9327A] to-berry-dark text-white text-[13px] font-semibold py-2.5'>
                <Link to='/offers' aria-label='See all offers' className='ticker-track animate-ticker flex w-max gap-12 whitespace-nowrap'>
                    {[0, 1].map(copy => (
                        <span key={copy} aria-hidden={copy === 1} className='flex gap-12 pr-12'>
                            {tickerItems.map((text, i) => <span key={i} className='flex items-center gap-12'>{text}<span className='text-white/70' aria-hidden='true'>✦</span></span>)}
                        </span>
                    ))}
                </Link>
            </div>

            <header className={`glass-header sticky top-0 z-40 border-b border-line ${scrolled ? 'is-scrolled' : ''}`}>
                <div className={`shell flex xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center justify-between gap-3 sm:gap-6 transition-all duration-500 ${scrolled ? 'py-2' : 'py-3.5'}`}>
                    {/* Left: logo on small screens, links on wide screens */}
                    <Link to='/' aria-label='Surprise Heaven home' className='shrink-0 xl:hidden'>
                        <span className='sm:hidden'><Logo size={46} showName={false} /></span>
                        <span className='hidden sm:block'><Logo size={52} /></span>
                    </Link>
                    <nav aria-label='Main' className='hidden xl:flex items-center gap-7 justify-self-start'>{leftLinks.map(navItem)}</nav>

                    {/* Centre: the round badge, like a shop sign */}
                    <Link to='/' aria-label='Surprise Heaven home' className='hidden xl:block justify-self-center'>
                        <span className={`block rounded-full transition-all duration-500 ring-2 ring-rose-200 shadow-[0_6px_24px_-6px_rgba(232,79,147,.55)] hover:ring-brand ${scrolled ? 'p-0.5' : 'p-1'}`}>
                            <Logo size={scrolled ? 50 : 64} showName={false} />
                        </span>
                    </Link>

                    {/* Right: links on wide screens, then icons */}
                    <div className='flex items-center gap-7 justify-self-end'>
                        <nav aria-label='More' className='hidden xl:flex items-center gap-7'>{rightLinks.map(navItem)}</nav>
                        <div className='flex items-center gap-1.5'>
                            <button aria-label='Search gifts' onClick={() => { setShowSearch(true); navigate('/collection') }} className='icon-btn hidden sm:flex'>
                                <Icon name='search' size={19} />
                            </button>

                            <Link to='/wishlist' aria-label={`Wishlist, ${wishCount} saved`} className='icon-btn'>
                                <Icon name='heart' size={19} />
                                {wishCount > 0 && <span className='absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-berry text-white text-[10px] font-bold flex items-center justify-center'>{wishCount}</span>}
                            </Link>

                            <div className='relative'>
                                <button aria-label='Account' aria-expanded={menuOpen} onClick={() => token ? setMenuOpen(!menuOpen) : navigate('/login')} className='icon-btn'>
                                    <Icon name='user' size={19} />
                                </button>
                                {token && menuOpen && (
                                    <div className='absolute right-0 top-13 w-52 bg-white border border-line rounded-2xl shadow-[0_20px_50px_-20px_rgba(107,25,64,.35)] py-2 text-sm'>
                                        <button onClick={() => navigate('/profile')} className='w-full text-left px-4 py-2.5 hover:bg-rose-50 cursor-pointer'>My profile</button>
                                        <button onClick={() => navigate('/orders')} className='w-full text-left px-4 py-2.5 hover:bg-rose-50 cursor-pointer'>My orders</button>
                                        <button onClick={() => navigate('/wishlist')} className='w-full text-left px-4 py-2.5 hover:bg-rose-50 cursor-pointer'>My wishlist</button>
                                        <hr className='my-1 border-line' />
                                        <button onClick={() => logout()} className='w-full text-left px-4 py-2.5 hover:bg-rose-50 text-berry cursor-pointer'>Log out</button>
                                    </div>
                                )}
                            </div>

                            <Link to='/cart' aria-label={`Shopping bag, ${getCartCount()} items`} className='ml-1 h-11 px-4 rounded-full bg-berry hover:bg-berry-dark text-white flex items-center gap-2 text-sm font-bold shadow-[0_8px_20px_-8px_rgba(210,58,127,.8)] transition hover:-translate-y-0.5'>
                                <Icon name='bag' size={18} />
                                <span>{getCartCount()}</span>
                            </Link>

                            <button aria-label='Open menu' onClick={() => setVisible(true)} className='icon-btn xl:hidden'>
                                <Icon name='menu' size={19} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className='hidden md:block'><DepartmentBar /></div>
            </header>

            {/* Drawer menu for small screens */}
            {visible && <div className='fixed inset-0 bg-ink/40 z-50 xl:hidden' onClick={() => setVisible(false)} />}
            <aside aria-hidden={!visible} className={`fixed z-50 top-0 right-0 bottom-0 w-[82%] max-w-sm bg-white shadow-xl transition-transform duration-300 xl:hidden ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className='flex items-center justify-between p-4 border-b border-line'>
                    <Logo size={44} />
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
