import React from 'react'

export const AdminLogo = ({ size = 40 }) => (
  <span className='flex items-center gap-3'>
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 15.5C24 15.5 14 10.8 14 6.4C14 3.6 16.4 2 18.7 2C20.9 2 22.6 3.4 24 5.4C25.4 3.4 27.1 2 29.3 2C31.6 2 34 3.6 34 6.4C34 10.8 24 15.5 24 15.5Z" fill="#C9973B" />
      <rect x="6" y="16" width="36" height="8" rx="2.5" fill="#7E1A3D" />
      <rect x="8.5" y="24" width="31" height="20" rx="3" fill="#A3214F" />
      <rect x="22" y="16" width="4" height="28" fill="#C9973B" />
    </svg>
    <span className='flex flex-col leading-none'>
      <span className='font-display italic font-semibold text-berry' style={{ fontSize: size * 0.62 }}>Surprise</span>
      <span className='font-bold tracking-[0.4em] text-[10px] mt-[3px] text-ink'>HEAVEN · ADMIN</span>
    </span>
  </span>
)

const Navbar = ({setToken}) => {
  return (
    <header className='bg-white border-b border-line sticky top-0 z-30'>
      <div className='flex items-center py-3 px-[4%] justify-between'>
        <AdminLogo />
        <div className='flex items-center gap-4'>
          <a href={import.meta.env.VITE_STORE_URL || 'http://localhost:5173'} target='_blank' rel='noreferrer' className='hidden sm:inline text-sm font-semibold text-mauve hover:text-berry'>View store ↗</a>
          <button onClick={()=>setToken('')} className='border border-ink text-ink hover:bg-ink hover:text-white px-5 py-2 rounded-full text-sm font-semibold cursor-pointer'>Log out</button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
