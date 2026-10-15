import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import Icon from './Icons'
import { LogoMark } from './Logo'

const Hero = () => {

    const { products, brands, currency } = useContext(ShopContext)
    const featured = [...products.filter(p => p.bestseller), ...products.filter(p => !p.bestseller)]
    const main = featured[0], thumb = featured[1]
    const brandCount = brands.filter(b => b.productCount > 0).length

    return (
        <section className='relative overflow-hidden'>
            {/* soft pink glows behind the hero */}
            <span aria-hidden='true' className='pointer-events-none absolute -top-40 -right-32 w-[560px] h-[560px] rounded-full bg-[radial-gradient(circle,rgba(232,79,147,.28),transparent_68%)] blur-2xl animate-pulse-soft'></span>
            <span aria-hidden='true' className='pointer-events-none absolute -bottom-48 -left-40 w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle,rgba(239,123,174,.22),transparent_70%)] blur-2xl animate-pulse-soft [animation-delay:2s]'></span>

            <div className='shell relative grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center pt-12 pb-20 sm:pt-16 sm:pb-24'>
                <div className='flex flex-col gap-6'>
                    <p className='eyebrow animate-hero-in'>Gifts · hampers · cakes</p>
                    <h1 className='font-display font-semibold text-[3.1rem] sm:text-[4.6rem] leading-[0.98] tracking-tight animate-hero-in [animation-delay:.12s]'>
                        Little boxes of
                        <span className='block italic text-brand'>big feelings,</span>
                        delivered.
                    </h1>
                    <p className='text-lg leading-relaxed text-mauve max-w-xl animate-hero-in [animation-delay:.24s]'>
                        Hand-packed chocolate buckets, bouquets and keepsake hampers for birthdays,
                        anniversaries and every surprise in between — with a handwritten note from you.
                    </p>
                    <div className='flex flex-wrap gap-3 mt-2 animate-hero-in [animation-delay:.36s]'>
                        <Link to='/collection' className='btn-primary'>Shop gifts <Icon name='arrow' size={18} /></Link>
                        <Link to='/build-a-box' className='btn-outline'><Icon name='gift' size={18} /> Build a surprise box</Link>
                    </div>
                    <ul className='grid sm:grid-cols-3 gap-3 mt-4 animate-hero-in [animation-delay:.48s]'>
                        {[
                            ['truck', 'Same-day delivery', 'Colombo, before 2 pm'],
                            ['lock', 'Secure payments', 'Card or cash on delivery'],
                            ['heart', 'Hand-written note', 'Free with every gift'],
                        ].map(([icon, title, text]) => (
                            <li key={title} className='flex items-start gap-3 rounded-2xl border border-line bg-white/70 p-3.5 card-lift'>
                                <span className='w-9 h-9 rounded-xl bg-rose-50 text-berry flex items-center justify-center shrink-0'><Icon name={icon} size={18} /></span>
                                <span className='leading-tight'><b className='block text-sm text-ink'>{title}</b><span className='text-xs text-muted'>{text}</span></span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className='relative sr sr-left'>
                    {/* Big rounded photo with a pink glow */}
                    {main ? (
                        <Link to={`/product/${main._id}`} className='group relative block overflow-hidden rounded-[2.5rem] glow-card aspect-[4/4.6] bg-blush'>
                            <img src={main.image[0]} alt={main.name} className='absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105' />
                            <span className='absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent'></span>
                            <span className='absolute left-6 right-6 bottom-6 text-white'>
                                <span className='block text-[11px] font-bold tracking-[0.22em] uppercase text-white/80'>Best seller</span>
                                <span className='block font-display text-[1.9rem] leading-tight font-semibold'>{main.name}</span>
                            </span>
                        </Link>
                    ) : (
                        <div className='rounded-[2.5rem] bg-blush aspect-[4/4.6] flex items-center justify-center glow-card'><LogoMark size={200} /></div>
                    )}

                    {/* Floating thumbnail */}
                    {thumb && (
                        <Link to={`/product/${thumb._id}`} className='absolute -top-6 -left-4 sm:-left-8 w-28 sm:w-32 rounded-3xl bg-white border border-line p-2 shadow-[0_18px_40px_-18px_rgba(107,25,64,.45)] animate-float-slow'>
                            <img src={thumb.image[0]} alt={thumb.name} className='w-full aspect-square rounded-2xl object-cover' />
                            <span className='block text-[11px] font-bold text-ink truncate mt-1.5 px-1'>{thumb.name}</span>
                            <span className='block text-[11px] text-berry font-bold px-1'>{currency}{thumb.price.toLocaleString('en-LK')}</span>
                        </Link>
                    )}

                    {/* Floating stat card */}
                    <div className='absolute -bottom-7 right-3 sm:-right-6 rounded-3xl bg-white border border-line px-5 py-4 shadow-[0_18px_44px_-18px_rgba(107,25,64,.45)] animate-float'>
                        <p className='flex items-baseline gap-1.5'><b className='font-display text-4xl text-ink leading-none'>{products.length || '180+'}</b><span className='text-sm font-semibold text-mauve'>gifts</span></p>
                        <p className='text-xs text-muted mt-1'>from {brandCount || 17} brands, ready to wrap</p>
                    </div>

                    {/* Round badge peeking from the side */}
                    <span className='hidden sm:block absolute top-1/2 -right-10 -translate-y-1/2 rounded-full bg-white p-1.5 shadow-[0_12px_30px_-10px_rgba(232,79,147,.6)] glow-pulse'>
                        <LogoMark size={78} />
                    </span>
                </div>
            </div>
        </section>
    )
}

export default Hero
