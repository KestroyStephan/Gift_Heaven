import React from 'react'

// Gift box whose bow is a heart
export const LogoMark = ({ size = 44, light = false }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path d="M24 15.5C24 15.5 14 10.8 14 6.4C14 3.6 16.4 2 18.7 2C20.9 2 22.6 3.4 24 5.4C25.4 3.4 27.1 2 29.3 2C31.6 2 34 3.6 34 6.4C34 10.8 24 15.5 24 15.5Z" fill={light ? '#E7C987' : '#C9973B'} />
    <rect x="6" y="16" width="36" height="8" rx="2.5" fill={light ? '#F2B8C9' : '#7E1A3D'} />
    <rect x="8.5" y="24" width="31" height="20" rx="3" fill={light ? '#FFFFFF' : '#A3214F'} />
    <rect x="22" y="16" width="4" height="28" fill={light ? '#E7C987' : '#C9973B'} />
  </svg>
)

const Logo = ({ size = 44, light = false }) => (
  <span className='flex items-center gap-3'>
    <LogoMark size={size} light={light} />
    <span className='flex flex-col leading-none'>
      <span className={`font-display italic font-semibold ${light ? 'text-[#F2B8C9]' : 'text-berry'}`} style={{ fontSize: size * 0.64 }}>Surprise</span>
      <span className={`font-bold tracking-[0.42em] mt-[3px] ${light ? 'text-white' : 'text-ink'}`} style={{ fontSize: Math.max(10, size * 0.25) }}>HEAVEN</span>
    </span>
  </span>
)

export default Logo
