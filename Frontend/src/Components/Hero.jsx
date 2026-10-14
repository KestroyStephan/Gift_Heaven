import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import Icon from './Icons'
import { LogoMark } from './Logo'

// Photo tile that shows a real product image when one exists
const Tile = ({ product, tint, className = '' }) => (
    product ? (
        <Link to={`/product/${product._id}`} className={`group relative overflow-hidden rounded-[28px] ${tint} ${className}`}>
            <img src={product.image[0]} alt={product.name} className='absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105' />
            <span className='absolute left-4 bottom-4 right-4 bg-white/90 backdrop-blur rounded-2xl px-4 py-2.5 text-sm font-semibold text-ink truncate'>{product.name}</span>
        </Link>
    ) : (
        <div className={`rounded-[28px] ${tint} flex items-center justify-center ${className}`}>
            <LogoMark size={72} />
        </div>
    )
)

const Hero = () => {

    const { products } = useContext(ShopContext)
    const featured = [...products.filter(p => p.bestseller), ...products.filter(p => !p.bestseller)].slice(0, 2)

    return (
        <section className='shell grid lg:grid-cols-2 gap-12 items-center pt-12 pb-16 sm:pt-16 sm:pb-20'>
            <div className='flex flex-col gap-6'>
                <p className='eyebrow'>Gifts &amp; chocolate hampers</p>
                <h1 className='font-display font-semibold text-[3rem] sm:text-[4.25rem] leading-[1.02] tracking-tight'>
                    Little boxes of <span className='italic text-berry'>big feelings</span>, delivered.
                </h1>
                <p className='text-lg leading-relaxed text-mauve max-w-xl'>
                    Hand-packed chocolate buckets, bouquets and keepsake hampers for birthdays,
                    anniversaries and every surprise in between — with a handwritten note from you.
                </p>
                <div className='flex flex-wrap gap-3 mt-2'>
                    <Link to='/collection' className='btn-primary'>Shop gifts <Icon name='arrow' size={18} /></Link>
                    <a href='#occasions' className='btn-outline'>Find by occasion</a>
                </div>
                <ul className='flex flex-wrap gap-x-7 gap-y-3 mt-3 text-sm text-mauve'>
                    {['Secure card payments', 'Cash on delivery', 'Live order tracking'].map(item => (
                        <li key={item} className='flex items-center gap-2'><Icon name='check' size={18} className='text-berry' strokeWidth={2.2} />{item}</li>
                    ))}
                </ul>
            </div>

            <div className='grid grid-cols-2 gap-4'>
                <Tile product={featured[0]} tint='bg-blush' className='row-span-2 min-h-[300px] sm:min-h-[460px]' />
                <Tile product={featured[1]} tint='bg-cream' className='min-h-[140px] sm:min-h-[222px]' />
                <div className='rounded-[28px] bg-ink text-[#F6E9EE] p-6 flex flex-col justify-between min-h-[140px] sm:min-h-[222px]'>
                    <span className='text-xs font-bold tracking-[0.16em] text-gold-light'>NEW HERE?</span>
                    <span className='font-display italic text-2xl sm:text-3xl leading-tight'>20% off your first gift</span>
                    <a href='#newsletter' className='text-sm underline underline-offset-4 hover:text-white'>Join the newsletter</a>
                </div>
            </div>
        </section>
    )
}

export default Hero
