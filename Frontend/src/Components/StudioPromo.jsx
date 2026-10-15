import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import Icon from './Icons'

// Home-page band for the cake studio, custom printing and live chat
const StudioPromo = () => {

    const { products, openChat } = useContext(ShopContext)
    const cake = products.find(p => p.category === 'Cake' && p.bestseller) || products.find(p => p.category === 'Cake')
    const print = products.find(p => p.category === 'CustomPrint' && p.bestseller) || products.find(p => p.category === 'CustomPrint')

    const box = products.find(p => p.name === 'Build-Your-Own Surprise Box')

    const tiles = [
        { to: '/build-a-box', eyebrow: 'New', title: 'Build a surprise box', text: 'Fill one box with their favourite gifts, a cake and a handmade photo album.', image: box?.image?.[0], tint: 'bg-blush' },
        { to: '/cakes', eyebrow: 'Cake studio', title: 'Design your cake', text: 'Pick a design, flavour, message or photo and the delivery day.', image: cake?.image?.[0], tint: 'bg-rose-100' },
        { to: '/custom-studio', eyebrow: 'Custom studio', title: 'Print your memories', text: 'Photos on frames, canvas, mugs, T-shirts and cushions.', image: print?.image?.[0], tint: 'bg-lilac' },
    ]

    return (
        <section className='shell py-16 grid md:grid-cols-2 xl:grid-cols-4 gap-5'>
            {tiles.map((tile, i) => (
                <Link key={tile.to} to={tile.to} className={`group rounded-[28px] overflow-hidden ${tile.tint} grid grid-cols-[1fr_42%] min-h-[230px] border border-line card-lift sr sr-up sr-d${i + 1}`}>
                    <span className='p-6 flex flex-col gap-2'>
                        <span className='eyebrow'>{tile.eyebrow}</span>
                        <span className='font-display text-3xl font-semibold leading-tight'>{tile.title}</span>
                        <span className='text-sm text-mauve'>{tile.text}</span>
                        <span className='mt-auto text-sm font-bold text-berry flex items-center gap-1'>Start <Icon name='arrow' size={16} /></span>
                    </span>
                    <span className='relative'>
                        {tile.image && <img src={tile.image} alt='' className='absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105' />}
                    </span>
                </Link>
            ))}
            <button onClick={() => openChat()} className='relative overflow-hidden text-left rounded-[28px] bg-gradient-to-br from-berry via-[#C2337A] to-[#7E1F4E] text-white p-6 flex flex-col gap-2 min-h-[230px] cursor-pointer card-lift sr sr-up sr-d4'>
                <span aria-hidden='true' className='absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/15 animate-pulse-soft'></span>
                <span className='eyebrow eyebrow-dark'>Live chat</span>
                <span className='font-display text-3xl text-white leading-tight'>Create something one-of-a-kind</span>
                <span className='text-sm text-white/85'>Send us your photos and ideas — party return gifts, themed cakes, matching outfits or a surprise we haven't thought of yet.</span>
                <span className='mt-auto text-sm font-bold text-white flex items-center gap-1'>Chat with a designer <Icon name='arrow' size={16} /></span>
            </button>
        </section>
    )
}

export default StudioPromo
