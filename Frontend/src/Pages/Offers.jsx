import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext, fromPrice, fromListPrice } from '../Context/ShopContext'
import Title from '../Components/Title'
import Icon from '../Components/Icons'
import ProductItem, { prettify } from '../Components/ProductItem'

const until = (ms) => ms ? `Ends ${new Date(ms).toLocaleDateString('en-LK', { day: 'numeric', month: 'long' })}` : 'While it lasts'

export const couponText = (c) => c.type === 'delivery' ? 'Free delivery' : c.type === 'percent' ? `${c.value}% off` : `Rs. ${c.value.toLocaleString('en-LK')} off`
export const offerText = (o) => o.type === 'percent' ? `${o.value}% off` : `Rs. ${o.value.toLocaleString('en-LK')} off`

// Copy-to-clipboard coupon ticket
export const CouponTicket = ({ coupon, compact = false }) => {
  const { applyCoupon } = useContext(ShopContext)
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(coupon.code) } catch { /* clipboard blocked: the code is still visible */ }
    applyCoupon(coupon.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className={`relative flex rounded-[22px] overflow-hidden bg-white border border-line ${compact ? '' : 'shadow-[0_10px_30px_-18px_rgba(43,27,36,.4)]'}`}>
      <div className='bg-berry text-white px-4 sm:px-5 py-4 flex flex-col justify-center min-w-[6.25rem] sm:min-w-[7.5rem] border-r-2 border-dashed border-white/40'>
        <span className='font-display text-[1.6rem] leading-none font-semibold'>{couponText(coupon)}</span>
        {coupon.maxDiscount > 0 && <span className='text-[11px] text-white/75 mt-1'>up to Rs. {coupon.maxDiscount.toLocaleString('en-LK')}</span>}
      </div>
      <div className='flex-1 min-w-0 px-4 py-3.5 flex flex-col gap-1.5'>
        <p className='text-sm text-ink leading-snug'>{coupon.description}</p>
        <p className='text-xs text-muted'>{coupon.minOrder ? `Min. order Rs. ${coupon.minOrder.toLocaleString('en-LK')} · ` : ''}{coupon.firstOrderOnly ? 'First order · ' : ''}{until(coupon.endsAt)}</p>
        <button type='button' onClick={copy} className='self-start max-w-full mt-0.5 flex flex-wrap items-center gap-x-2 rounded-full border-2 border-dashed border-rose-300 px-3 py-1 text-sm font-bold tracking-[0.12em] text-berry hover:bg-rose-50 cursor-pointer'>
          {coupon.code} <span className='text-[11px] tracking-normal font-semibold text-muted'>{copied ? 'Copied & applied ✓' : 'Tap to use'}</span>
        </button>
      </div>
    </div>
  )
}

const Offers = () => {
  const { offers, publicCoupons, products, brandOf } = useContext(ShopContext)
  const onSale = products.filter(p => fromPrice(p) < fromListPrice(p))
    .sort((a, b) => (1 - fromPrice(b) / fromListPrice(b)) - (1 - fromPrice(a) / fromListPrice(a)))
  const target = (o) => o.scope === 'all' ? 'Everything in the store'
    : o.scope === 'category' ? o.targets.map(prettify).join(', ')
    : o.scope === 'brand' ? o.targets.map(t => brandOf(t)?.name || t).join(', ')
    : `${o.targets.length} selected gift${o.targets.length === 1 ? '' : 's'}`
  const linkFor = (o) => o.scope === 'category' && o.targets.length === 1 ? `/collection?category=${o.targets[0]}`
    : o.scope === 'brand' && o.targets.length === 1 ? `/brand/${o.targets[0]}` : '#on-sale'

  return (
    <div className='pt-10 pb-16'>
      <div className='border-b border-line pb-6 mb-10'>
        <Title as='h1' eyebrow='Deals & coupons' text1='Offers' text2='this week' />
        <p className='text-mauve -mt-1'>Sale prices are already in the bag. Coupons go in at checkout — tap one to use it.</p>
      </div>

      {offers.length > 0 && (
        <section className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14'>
          {offers.map((o, i) => (
            <Link key={o._id} to={linkFor(o)} className={`group relative overflow-hidden rounded-[28px] p-7 min-h-[200px] flex flex-col justify-between text-white card-lift sr sr-up sr-d${i + 1} ${['bg-gradient-to-br from-berry to-berry-dark', 'bg-gradient-to-br from-ink to-[#5A2340]', 'bg-gradient-to-br from-[#B82D6E] to-[#6B1940]'][i % 3]}`}>
              <span className='absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/15 animate-pulse-soft'></span>
              <span className='relative text-[11px] font-bold tracking-[0.2em] uppercase text-white/70'>{o.badge || 'Offer'}</span>
              <span className='relative'>
                <span className='block font-display text-[2.6rem] leading-none font-semibold'>{offerText(o)}</span>
                <span className='block mt-2 text-white/85'>{o.name} · {target(o)}</span>
              </span>
              <span className='relative flex items-center justify-between text-sm mt-4'>
                <span className='text-white/70'>{until(o.endsAt)}</span>
                <span className='font-bold flex items-center gap-1'>Shop <Icon name='arrow' size={16} className='transition group-hover:translate-x-1' /></span>
              </span>
            </Link>
          ))}
        </section>
      )}

      {publicCoupons.length > 0 && (
        <section className='mb-14'>
          <h2 className='font-display text-3xl font-semibold mb-5'>Coupon codes</h2>
          <div className='grid md:grid-cols-2 gap-4'>
            {publicCoupons.map(c => <CouponTicket key={c.code} coupon={c} />)}
          </div>
        </section>
      )}

      <section id='on-sale' className='scroll-mt-32'>
        <h2 className='font-display text-3xl font-semibold mb-5'>On sale now <span className='text-lg text-muted font-sans font-medium'>{onSale.length} gifts</span></h2>
        {onSale.length === 0 ? <p className='text-mauve'>No sales running right now — check back soon.</p> : (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-9'>
            {onSale.map(item => <ProductItem key={item._id} id={item._id} name={item.name} price={item.price} image={item.image} category={item.category} bestseller={item.bestseller} sizePrices={item.sizePrices} brand={item.brand} />)}
          </div>
        )}
      </section>
    </div>
  )
}

export default Offers
