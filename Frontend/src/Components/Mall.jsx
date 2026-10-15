import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { Stars } from './Stars'
import { Link, NavLink, useSearchParams, useLocation } from 'react-router-dom'
import { ShopContext, fromPrice } from '../Context/ShopContext'
import Title from './Title'
import Icon from './Icons'
import ProductItem from './ProductItem'
import { CouponTicket, offerText } from '../Pages/Offers'

// Departments group our categories the way a gift mall's floors would
export const departments = [
    { slug: 'flowers-cakes', name: 'Flowers & Cakes', categories: ['Bouquet', 'Cake', 'Plants'] },
    { slug: 'chocolates-hampers', name: 'Chocolates & Hampers', short: 'Chocolates', categories: ['ChocolateBucket', 'GiftHamper', 'GiftPackage', 'LoveFocil', 'Festive'] },
    { slug: 'fashion', name: 'Fashion & Accessories', short: 'Fashion', categories: ['Accessories', 'BagsWallets', 'Footwear', 'Eyewear'] },
    { slug: 'jewellery-watches', name: 'Jewellery & Watches', short: 'Jewellery', categories: ['Jewellery', 'Watches'] },
    { slug: 'beauty', name: 'Beauty & Fragrance', short: 'Beauty', categories: ['Beauty', 'Fragrances'] },
    { slug: 'tech-gaming', name: 'Tech & Gaming', categories: ['Tech', 'Gaming'] },
    { slug: 'kids', name: 'Kids & Baby', categories: ['Toys', 'Baby', 'Teddy', 'Games'] },
    { slug: 'home-kitchen', name: 'Home & Kitchen', short: 'Home', categories: ['HomeDecor', 'KitchenDining'] },
    { slug: 'personalised', name: 'Personalised & Print', short: 'Personalised', categories: ['Personalised', 'CustomPrint'] },
    { slug: 'art-stationery', name: 'Art & Stationery', short: 'Art', categories: ['ArtSupplies', 'Stationery'] },
]
export const departmentLink = (d) => `/collection?dept=${d.slug}`

export const budgets = [
    { label: 'Under Rs. 2,500', note: 'Sweet little thank-yous', max: 2500, tint: 'bg-sage' },
    { label: 'Rs. 2,500 – 5,000', note: 'Birthday favourites', min: 2500, max: 5000, tint: 'bg-cream' },
    { label: 'Rs. 5,000 – 10,000', note: 'Anniversaries & big days', min: 5000, max: 10000, tint: 'bg-blush' },
    { label: 'Rs. 10,000 & above', note: 'Luxury & premium gifts', min: 10000, tint: 'bg-lilac' },
]
const budgetLink = (b) => `/collection?${new URLSearchParams({ ...(b.min ? { min: b.min } : {}), ...(b.max ? { max: b.max } : {}) })}`

// Logo, or the brand name as a coloured wordmark
export const BrandMark = ({ brand, className = '', light = false }) => {
    if (!brand) return null
    if (brand.logo) {
        const img = <img src={brand.logo} alt={brand.name} className={`object-contain max-w-full w-auto h-14 ${light ? '' : className}`} />
        return light ? <span className='inline-flex bg-white rounded-2xl px-5 py-3 shadow-sm'>{img}</span> : img
    }
    return (
        <span className={`font-display italic font-semibold leading-none text-center ${className}`} style={{ color: light ? '#fff' : brand.colour }}>
            {brand.name}
        </span>
    )
}

// Thin strip of departments under the main navigation
export const DepartmentBar = () => {
    const { pathname } = useLocation()
    const [params] = useSearchParams()
    const active = pathname === '/collection' ? params.get('dept') : null
    return (
        <nav aria-label='Departments' className='bg-white border-b border-line'>
            <div className='shell flex items-center gap-0.5 overflow-x-auto no-scrollbar text-[13px] font-semibold'>
                {departments.map(d => (
                    <Link key={d.slug} to={departmentLink(d)} aria-current={active === d.slug ? 'page' : undefined}
                        className={`whitespace-nowrap px-3 py-2.5 border-b-2 transition ${active === d.slug ? 'border-berry text-berry' : 'border-transparent text-mauve hover:text-berry'}`}>
                        {d.short || d.name}
                    </Link>
                ))}
                <span className='flex-1'></span>
                <NavLink to='/brands' className={({ isActive }) => `whitespace-nowrap px-3 py-2.5 flex items-center gap-1.5 border-b-2 ${isActive ? 'border-berry text-berry' : 'border-transparent text-ink hover:text-berry'}`}>
                    <Icon name='star' size={14} className='text-gold' />All brands
                </NavLink>
            </div>
        </nav>
    )
}

// Big photo tiles, one per department
export const ShopByDepartment = () => {
    const { products } = useContext(ShopContext)
    const used = new Set()
    const tiles = departments.map(d => {
        const items = products.filter(p => d.categories.includes(p.category))
        const cover = (items.find(p => p.bestseller && !used.has(p.image?.[0])) || items.find(p => !used.has(p.image?.[0])) || items[0])?.image?.[0]
        used.add(cover)
        return { ...d, count: items.length, cover }
    }).filter(d => d.count)
    if (!tiles.length) return null

    return (
        <section className='shell py-16'>
            <div className='flex flex-wrap items-end justify-between gap-4 mb-8'>
                <div>
                    <Title eyebrow='Explore the mall' text1='Shop by' text2='department' />
                    <p className='text-mauve max-w-xl -mt-1'>Ten floors of gifts, from fresh flowers to the latest tech.</p>
                </div>
                <Link to='/collection' className='font-bold text-sm text-berry flex items-center gap-1'>Browse everything <Icon name='arrow' size={16} /></Link>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                {tiles.map((d, i) => (
                    <Link key={d.slug} to={departmentLink(d)} className={`group relative overflow-hidden rounded-[24px] bg-berry-dark card-lift sr sr-up sr-d${(i % 5) + 1} ${i < 2 ? 'md:col-span-2 lg:col-span-1' : ''} aspect-[4/5] md:aspect-auto md:h-64 lg:h-auto lg:aspect-[4/5]`}>
                        {d.cover && <img src={d.cover} alt='' loading='lazy' className='absolute inset-0 w-full h-full object-cover opacity-90 transition duration-500 group-hover:scale-105' />}
                        <span className='absolute inset-0 bg-gradient-to-t from-[#4A0F2E]/90 via-[#4A0F2E]/15 to-transparent'></span>
                        <span className='absolute left-4 right-4 bottom-4 text-white'>
                            <span className='block font-display text-[1.45rem] leading-tight font-semibold'>{d.name}</span>
                            <span className='flex items-center gap-1 text-xs text-white/75 mt-1'>{d.count} gifts <Icon name='arrow' size={13} className='transition group-hover:translate-x-1' /></span>
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    )
}

// Row of brand wordmarks / logos
export const BrandStrip = () => {
    const { brands } = useContext(ShopContext)
    const visible = brands.filter(b => b.productCount > 0)
    if (!visible.length) return null

    return (
        <section className='bg-white border-y border-line py-14'>
            <div className='shell'>
                <div className='flex flex-wrap items-end justify-between gap-4 mb-7'>
                    <Title eyebrow={`${visible.length} brands under one roof`} text1='Shop by' text2='brand' className='!mb-0' />
                    <Link to='/brands' className='font-bold text-sm text-berry flex items-center gap-1'>All brands A–Z <Icon name='arrow' size={16} /></Link>
                </div>
                <div className='flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 snap-x'>
                    {visible.map(b => (
                        <Link key={b.slug} to={`/brand/${b.slug}`} className='group snap-start shrink-0 w-44 sm:w-48 rounded-[22px] border border-line bg-shell card-lift flex flex-col overflow-hidden'>
                            <span className='h-24 flex items-center justify-center px-4 bg-rose-50'>
                                <BrandMark brand={b} className='text-[1.55rem] max-h-16' />
                            </span>
                            <span className='px-4 py-3 flex items-center justify-between text-xs'>
                                <span className='text-mauve'>{b.productCount} gift{b.productCount === 1 ? '' : 's'}</span>
                                <Icon name='arrow' size={14} className='text-berry transition group-hover:translate-x-1' />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

// Price bands, like a mall's "gifts under…" aisle
export const BudgetDeals = () => {
    const { products } = useContext(ShopContext)
    return (
        <section className='shell py-16'>
            <Title eyebrow='Shop your budget' text1='Gifts for every' text2='pocket' className='mb-8' />
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                {budgets.map(b => {
                    const items = products.filter(p => { const price = fromPrice(p); return (!b.min || price >= b.min) && (!b.max || price < b.max) })
                    return (
                        <Link key={b.label} to={budgetLink(b)} className={`group rounded-[24px] ${b.tint} border border-line p-5 sm:p-6 flex flex-col gap-4 card-lift sr sr-up`}>
                            <span className='flex -space-x-3'>
                                {items.slice(0, 3).map(p => <img key={p._id} src={p.image[0]} alt='' loading='lazy' className='w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-[3px] border-white' />)}
                            </span>
                            <span>
                                <span className='block font-display text-[1.5rem] sm:text-[1.8rem] leading-tight font-semibold text-ink'>{b.label}</span>
                                <span className='block text-sm text-mauve mt-1'>{b.note} · {items.length} gifts</span>
                            </span>
                            <span className='mt-auto text-sm font-bold text-berry flex items-center gap-1'>Shop now <Icon name='arrow' size={15} className='transition group-hover:translate-x-1' /></span>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}

// A featured brand's banner beside four of its gifts
export const BrandSpotlight = ({ index = 0 }) => {
    const { brands, products } = useContext(ShopContext)
    const eligible = brands.filter(b => b.featured && products.filter(p => p.brand === b.slug).length >= 4)
    const brand = eligible[index]
    if (!brand) return null
    const items = [...products.filter(p => p.brand === brand.slug)].sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0)).slice(0, 4)

    return (
        <section className='shell py-12'>
            <div className='grid lg:grid-cols-[340px_minmax(0,1fr)] gap-6 items-stretch'>
                <Link to={`/brand/${brand.slug}`} className='group relative overflow-hidden rounded-[28px] p-8 flex flex-col justify-between min-h-[280px] text-white glow-card sr sr-right' style={{ background: 'linear-gradient(150deg, #E84F93, #B82D6E 55%, #6B1940)' }}>
                    <span className='text-[11px] font-bold tracking-[0.2em] uppercase text-white/70'>Brand spotlight</span>
                    <span>
                        <BrandMark brand={brand} light className='block text-left text-[2.6rem] max-h-20' />
                        <span className='block mt-3 text-white/80'>{brand.tagline}</span>
                    </span>
                    <span className='self-start mt-6 px-5 py-2.5 rounded-full bg-white text-ink text-sm font-bold flex items-center gap-2'>Shop {brand.name} <Icon name='arrow' size={16} className='transition group-hover:translate-x-1' /></span>
                </Link>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8'>
                    {items.map(item => <ProductItem key={item._id} id={item._id} name={item.name} price={item.price} image={item.image} category={item.category} bestseller={item.bestseller} sizePrices={item.sizePrices} brand={item.brand} />)}
                </div>
            </div>
        </section>
    )
}

// This week's sales and coupon codes, near the top of the home page
export const DealsStrip = () => {
    const { offers, publicCoupons } = useContext(ShopContext)
    if (!offers.length && !publicCoupons.length) return null
    return (
        <section className='shell py-10'>
            <div className='relative overflow-hidden rounded-[32px] bg-white border border-line p-6 sm:p-8 shadow-[0_24px_60px_-34px_rgba(184,45,110,.45)]'>
                <span aria-hidden='true' className='pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(232,79,147,.16),transparent_70%)]'></span>
                <div className='flex flex-wrap items-end justify-between gap-4 mb-6'>
                    <Title eyebrow='Deals this week' text1='Offers &' text2='coupons' className='!mb-0' />
                    <Link to='/offers' className='font-bold text-sm text-berry flex items-center gap-1'>All offers <Icon name='arrow' size={16} /></Link>
                </div>
                <div className='grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-5'>
                    <div className='grid sm:grid-cols-3 gap-3'>
                        {offers.slice(0, 3).map((o, i) => (
                            <Link key={o._id} to='/offers' className={`relative overflow-hidden rounded-[22px] p-5 text-white flex flex-col justify-between min-h-[150px] card-lift sr sr-scale sr-d${i + 1} ${['bg-gradient-to-br from-berry to-berry-dark', 'bg-gradient-to-br from-[#9A2459] to-[#5E1238]', 'bg-gradient-to-br from-[#B82D6E] to-[#6B1940]'][i % 3]}`}>
                                <span aria-hidden='true' className='absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/15 animate-pulse-soft'></span>
                                <span className='text-[11px] font-bold tracking-[0.16em] uppercase text-white/70'>{o.badge || 'Offer'}</span>
                                <span className='font-display text-[2rem] leading-none font-semibold'>{offerText(o)}</span>
                                <span className='text-xs text-white/80'>{o.name}</span>
                            </Link>
                        ))}
                    </div>
                    <div className='flex flex-col gap-3'>
                        {publicCoupons.slice(0, 2).map(c => <CouponTicket key={c.code} coupon={c} compact />)}
                    </div>
                </div>
            </div>
        </section>
    )
}

// Recent 4–5 star reviews from verified customers (hidden until there are some)
export const CustomerLove = () => {
    const { backendUrl } = useContext(ShopContext)
    const [reviews, setReviews] = useState([])
    useEffect(() => {
        axios.get(backendUrl + '/api/review/highlights').then(({ data }) => data.success && setReviews(data.reviews)).catch(() => {})
    }, [])
    if (!reviews.length) return null
    return (
        <section className='bg-white border-y border-line py-16'>
            <div className='shell'>
                <Title eyebrow='Verified customer reviews' text1='What customers' text2='say' className='mb-8' />
                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-5'>
                    {reviews.slice(0, 6).map(r => (
                        <Link key={r._id} to={`/product/${r.product._id}#reviews`} className='rounded-[24px] bg-shell border border-line p-6 flex flex-col gap-3 card-lift sr sr-up'>
                            <Stars value={r.rating} size={18} />
                            {r.title && <p className='font-bold text-ink'>{r.title}</p>}
                            <p className='text-[15px] text-mauve leading-relaxed line-clamp-4'>“{r.comment}”</p>
                            <span className='mt-auto pt-2 flex items-center gap-3 text-sm'>
                                {r.product.image && <img src={r.product.image} alt='' loading='lazy' className='w-10 h-10 rounded-xl object-cover' />}
                                <span className='min-w-0'>
                                    <span className='block font-semibold text-ink'>{r.name} <span className='text-[#2F5A37] text-xs font-semibold'>✓ Verified</span></span>
                                    <span className='block text-xs text-muted truncate'>{r.product.name}</span>
                                </span>
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
