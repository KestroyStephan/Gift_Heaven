import React, { useContext } from 'react'
import { ShopContext } from '../Context/ShopContext'

const HEART = 'M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.6a4.3 4.3 0 017.5 2.7c0 5.6-7.5 10.2-7.5 10.2z'

// Heart toggle; on cards it sits over the photo, so it must not open the product link
const WishlistButton = ({ productId, name = 'this gift', variant = 'icon', className = '' }) => {
    const { inWishlist, toggleWishlist } = useContext(ShopContext)
    const saved = inWishlist(productId)
    const onClick = (e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(productId) }
    const heart = (size) => (
        <svg width={size} height={size} viewBox='0 0 24 24' aria-hidden='true'>
            <path d={HEART} fill={saved ? '#E84F93' : 'none'} stroke={saved ? '#E84F93' : 'currentColor'} strokeWidth='1.8' strokeLinejoin='round' />
        </svg>
    )

    if (variant === 'button') return (
        <button type='button' onClick={onClick} aria-pressed={saved} className={`h-[3.25rem] px-5 rounded-full border-[1.5px] flex items-center gap-2 font-semibold cursor-pointer transition ${saved ? 'border-berry text-berry bg-rose-50' : 'border-rose-300 text-ink bg-white hover:bg-rose-50'} ${className}`}>
            {heart(20)}{saved ? 'Saved' : 'Save'}
        </button>
    )
    return (
        <button type='button' onClick={onClick} aria-pressed={saved} aria-label={saved ? `Remove ${name} from your wishlist` : `Save ${name} to your wishlist`}
            className={`w-9 h-9 rounded-full bg-white/95 text-ink shadow-sm flex items-center justify-center cursor-pointer transition hover:scale-110 ${className}`}>
            {heart(19)}
        </button>
    )
}

export default WishlistButton
