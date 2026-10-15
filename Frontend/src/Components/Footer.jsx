import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import Logo from './Logo'
import Icon from './Icons'
import { departments, departmentLink } from './Mall'

const columns = [
  {
    title: 'Shop', links: [
      ['/collection', 'All gifts'], ['/offers', 'Offers & coupons'], ['/brands', 'Brands A–Z'],
      ['/build-a-box', 'Build a surprise box'], ['/cakes', 'Cake studio'], ['/custom-studio', 'Custom printing'],
    ]
  },
  {
    title: 'Help', links: [
      ['/track', 'Track your gift'], ['/wishlist', 'My wishlist'], ['/contact', 'Contact us'],
      ['/contact#faq', 'Delivery & returns'], ['/gift-guide', 'Gift guide'], ['/about', 'About us'],
    ]
  },
]

const Footer = () => {
  const { openChat } = useContext(ShopContext)

  return (
    <footer className='relative overflow-hidden mt-24 bg-[#FFF3F8] border-t border-line'>
      {/* thin gradient strip and a soft glow */}
      <span aria-hidden='true' className='absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-rose-400 via-brand to-berry-dark'></span>
      <span aria-hidden='true' className='pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(232,79,147,.22),transparent_70%)] blur-3xl'></span>
      <span aria-hidden='true' className='pointer-events-none absolute bottom-10 -left-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(239,123,174,.18),transparent_70%)] blur-3xl'></span>

      <div className='shell relative pt-16 pb-6'>
        <div className='grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]'>
          <div className='flex flex-col gap-5 max-w-sm sr sr-up'>
            <Logo size={60} />
            <p className='text-sm leading-relaxed text-mauve'>
              Curated gifts, cakes and keepsake hampers — hand-packed in our boutique and delivered with care,
              so every surprise arrives exactly as you imagined it.
            </p>
            <span className='self-start inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-xs font-bold tracking-[0.14em] text-berry'>
              <span className='w-2 h-2 rounded-full bg-brand animate-pulse'></span>SAME-DAY DELIVERY · COLOMBO
            </span>
          </div>

          {columns.map((col, i) => (
            <div key={col.title} className={`flex flex-col gap-3 text-sm sr sr-up sr-d${i + 1}`}>
              <p className='text-xs font-extrabold tracking-[0.2em] text-ink mb-1 uppercase'>{col.title}</p>
              {col.links.map(([to, label]) => (
                <Link key={to} to={to} className='group self-start text-mauve hover:text-berry transition flex items-center gap-1.5'>
                  <span className='w-0 h-[2px] bg-brand rounded-full transition-all duration-300 group-hover:w-3'></span>{label}
                </Link>
              ))}
            </div>
          ))}

          <div className='flex flex-col gap-3 text-sm sr sr-up sr-d3'>
            <p className='text-xs font-extrabold tracking-[0.2em] text-ink mb-1 uppercase'>Get in touch</p>
            <a href='tel:+94775549857' className='flex items-center gap-3 text-mauve hover:text-berry'><span className='w-9 h-9 rounded-full bg-white border border-rose-200 text-berry flex items-center justify-center'><Icon name='phone' size={16} /></span>(+94) 77-554-9857</a>
            <a href='mailto:hello@surpriseheaven.com' className='flex items-center gap-3 text-mauve hover:text-berry'><span className='w-9 h-9 rounded-full bg-white border border-rose-200 text-berry flex items-center justify-center'><Icon name='mail' size={16} /></span>hello@surpriseheaven.com</a>
            <p className='flex items-center gap-3 text-mauve'><span className='w-9 h-9 rounded-full bg-white border border-rose-200 text-berry flex items-center justify-center shrink-0'><Icon name='pin' size={16} /></span>6700 Main Road, PillayarKovil Road</p>
            <button onClick={() => openChat()} className='btn-primary !h-11 !px-5 self-start mt-2 text-sm'>Chat with us</button>
          </div>
        </div>

        {/* Departments, separated like a store directory */}
        <div className='mt-14 pt-6 border-t border-line flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] font-semibold'>
          <span className='text-xs font-extrabold tracking-[0.2em] text-ink mr-2'>DEPARTMENTS</span>
          {departments.map((d, i) => (
            <React.Fragment key={d.slug}>
              {i > 0 && <span className='text-rose-300 text-[10px]' aria-hidden='true'>◆</span>}
              <Link to={departmentLink(d)} className='text-mauve hover:text-berry'>{d.name}</Link>
            </React.Fragment>
          ))}
        </div>

        <div className='mt-8 flex flex-wrap justify-between gap-3 text-xs text-muted'>
          <p>© {new Date().getFullYear()} SURPRISE HEAVEN. ALL RIGHTS RESERVED.</p>
          <p className='tracking-wide'>SECURE PAYMENTS · STRIPE · RAZORPAY · CASH ON DELIVERY</p>
        </div>

        {/* Big outline wordmark */}
        <p aria-hidden='true' className='select-none pointer-events-none mt-6 -mb-6 text-center font-display italic font-semibold leading-none text-[16vw] lg:text-[11rem] text-transparent [-webkit-text-stroke:1.5px_rgba(232,79,147,.35)] whitespace-nowrap'>
          Surprise Heaven
        </p>
      </div>
    </footer>
  )
}

export default Footer
