import React from 'react'
import badge from '../assets/logo-badge.webp'

// The round Surprise Heaven badge (gift box, bow and hearts)
export const LogoMark = ({ size = 44, className = '' }) => (
  <img src={badge} width={size} height={size} alt='' aria-hidden='true' className={`shrink-0 select-none drop-shadow-sm ${className}`} draggable='false' />
)

// Badge plus the name, so it stays readable at header sizes
const Logo = ({ size = 44, light = false, showName = true }) => (
  <span className='flex items-center gap-3'>
    <LogoMark size={size} />
    {showName && (
      <span className='flex flex-col leading-none'>
        <span className={`font-display italic font-semibold ${light ? 'text-[#FFB3D4]' : 'text-berry'}`} style={{ fontSize: size * 0.56 }}>Surprise</span>
        <span className={`font-bold tracking-[0.42em] mt-[3px] ${light ? 'text-white' : 'text-ink'}`} style={{ fontSize: Math.max(10, size * 0.22) }}>HEAVEN</span>
      </span>
    )}
  </span>
)

export default Logo
