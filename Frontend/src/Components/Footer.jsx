import React from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import Icon from './Icons'

const Footer = () => {
  return (
    <footer className='bg-ink text-[#D9C6CE] mt-24'>
      <div className='shell py-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.4fr]'>
        <div className='flex flex-col gap-5 max-w-sm'>
          <Logo size={56} light />
          <p className='text-sm leading-relaxed'>
            Curated gifts and chocolate hampers, hand-packed in our boutique and delivered with care —
            so every surprise arrives exactly as you imagined it.
          </p>
        </div>

        <div className='flex flex-col gap-3 text-sm'>
          <p className='text-white font-bold tracking-[0.12em] text-xs mb-1'>SHOP</p>
          <Link to='/collection' className='hover:text-white'>All gifts</Link>
          <Link to='/collection?category=ChocolateBucket' className='hover:text-white'>Chocolate buckets</Link>
          <Link to='/collection?category=Bouquet' className='hover:text-white'>Bouquets</Link>
          <Link to='/collection?category=GiftHamper' className='hover:text-white'>Gift hampers</Link>
          <Link to='/collection?for=her' className='hover:text-white'>Gifts for her</Link>
          <Link to='/collection?for=him' className='hover:text-white'>Gifts for him</Link>
          <Link to='/collection?for=kids' className='hover:text-white'>Kids & toys</Link>
          <Link to='/cakes' className='hover:text-white'>Cakes</Link>
          <Link to='/custom-studio' className='hover:text-white'>Custom printing</Link>
        </div>

        <div className='flex flex-col gap-3 text-sm'>
          <p className='text-white font-bold tracking-[0.12em] text-xs mb-1'>HELP</p>
          <Link to='/orders' className='hover:text-white'>Track an order</Link>
          <Link to='/contact' className='hover:text-white'>Contact us</Link>
          <Link to='/contact#faq' className='hover:text-white'>Delivery &amp; returns</Link>
          <Link to='/gift-guide' className='hover:text-white'>Gift guide</Link>
          <Link to='/about' className='hover:text-white'>About us</Link>
        </div>

        <div className='flex flex-col gap-3 text-sm'>
          <p className='text-white font-bold tracking-[0.12em] text-xs mb-1'>GET IN TOUCH</p>
          <a href='tel:+94775549857' className='flex items-center gap-3 hover:text-white'><Icon name='phone' size={18} className='text-gold-light' />(+94) 77-554-9857</a>
          <a href='mailto:hello@surpriseheaven.com' className='flex items-center gap-3 hover:text-white'><Icon name='mail' size={18} className='text-gold-light' />hello@surpriseheaven.com</a>
          <p className='flex items-start gap-3'><Icon name='pin' size={18} className='text-gold-light shrink-0 mt-0.5' />6700 Main Road, PillayarKovil Road</p>
        </div>
      </div>

      <div className='border-t border-white/10'>
        <div className='shell py-6 flex flex-wrap justify-between gap-3 text-xs'>
          <p>© {new Date().getFullYear()} Surprise Heaven. All rights reserved.</p>
          <p>Secure payments · Stripe · Razorpay · Cash on delivery</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
