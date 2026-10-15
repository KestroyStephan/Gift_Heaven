import React, { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext, fromPrice, fromListPrice, stockLabel, available } from '../Context/ShopContext'
import Title from '../Components/Title'
import Icon from '../Components/Icons'
import { Stars } from '../Components/Stars'
import WishlistButton from '../Components/WishlistButton'
import { prettify } from '../Components/ProductItem'

// Gifts that need choices (size, cake details, photos…) are added from their own page
const needsOptions = (p) => {
  const c = p.customization || {}
  return p.sizes.length > 1 || c.cake || c.photo || c.print || c.album || c.box
}

const SavedCard = ({ product, owner }) => {
  const { currency, addToCart, brandOf } = useContext(ShopContext)
  const sale = fromPrice(product), was = fromListPrice(product)
  const stock = stockLabel(product)
  const soldOut = available(product) <= 0
  const link = product.customization?.box ? '/build-a-box' : `/product/${product._id}`

  return (
    <div className='group flex flex-col gap-3'>
      <Link to={link} className='relative overflow-hidden rounded-[22px] bg-blush aspect-square'>
        <img src={product.image[0]} alt={product.name} loading='lazy' className={`absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105 ${soldOut ? 'opacity-60' : ''}`} />
        {owner && <WishlistButton productId={product._id} name={product.name} className='absolute top-3 right-3' />}
        {stock && stock.tone !== 'in' && <span className={`absolute bottom-3 left-3 text-[11px] font-bold px-2.5 py-1.5 rounded-xl ${stock.tone === 'out' ? 'bg-berry text-white' : 'bg-amber-100 text-amber-900'}`}>{stock.text.toUpperCase()}</span>}
      </Link>
      <div className='flex flex-col gap-1'>
        <p className='text-xs font-semibold text-muted'>{brandOf(product.brand)?.name ? <span className='text-berry'>{brandOf(product.brand).name}</span> : null}{brandOf(product.brand) ? ' · ' : ''}{prettify(product.category)}</p>
        <Link to={link} className='font-bold leading-snug hover:text-berry'>{product.name}</Link>
        {product.ratingCount > 0 && <p className='flex items-center gap-1.5 text-xs text-muted'><Stars value={product.ratingAvg} size={13} />({product.ratingCount})</p>}
        <p className='text-[15px] flex flex-wrap items-baseline gap-x-2'>
          <span className={sale < was ? 'font-bold text-berry' : ''}>{product.sizes.length > 1 ? 'From ' : ''}{currency}{sale.toLocaleString('en-LK')}</span>
          {sale < was && <s className='text-sm text-muted'>{currency}{was.toLocaleString('en-LK')}</s>}
        </p>
      </div>
      {soldOut ? (
        <span className='h-11 rounded-full bg-stone-100 text-stone-500 text-sm font-bold flex items-center justify-center'>Sold out</span>
      ) : needsOptions(product) ? (
        <Link to={link} className='h-11 rounded-full border-[1.5px] border-rose-300 bg-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-50'>Choose options <Icon name='arrow' size={16} /></Link>
      ) : (
        <button onClick={() => addToCart(product._id, product.sizes[0], 1)} className='h-11 rounded-full bg-berry hover:bg-berry-dark text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer'><Icon name='bag' size={16} />{owner ? 'Add to bag' : 'Buy this gift'}</button>
      )}
    </div>
  )
}

const Grid = ({ items, owner }) => (
  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10'>
    {items.map(p => <SavedCard key={p._id} product={p} owner={owner} />)}
  </div>
)

// Share panel: a private link friends and family can open
const SharePanel = () => {
  const { wishlistShare, setWishlistShared } = useContext(ShopContext)
  const link = wishlistShare.shareId ? `${window.location.origin}/wishlist/shared/${wishlistShare.shareId}` : ''
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); toast.success('Link copied') } catch { toast.info(link) }
  }
  return (
    <div className='rounded-[28px] bg-white border border-line p-6 flex flex-col gap-4'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='font-display text-2xl font-semibold'>Share your wishlist</p>
          <p className='text-sm text-mauve mt-1'>Birthday coming up? Send your list so friends and family know exactly what you'd love. They'll only see your first name and the gifts.</p>
        </div>
        <label className='relative inline-flex items-center cursor-pointer shrink-0 mt-1'>
          <input type='checkbox' className='sr-only peer' checked={wishlistShare.shared} onChange={(e) => setWishlistShared(e.target.checked)} aria-label='Share my wishlist' />
          <span className='w-12 h-7 rounded-full bg-stone-300 peer-checked:bg-berry transition'></span>
          <span className='absolute left-1 top-1 w-5 h-5 rounded-full bg-white shadow transition peer-checked:translate-x-5'></span>
        </label>
      </div>
      {wishlistShare.shared && link && (
        <div className='flex flex-col gap-2'>
          <div className='flex gap-2'>
            <input readOnly value={link} aria-label='Wishlist link' onFocus={(e) => e.target.select()} className='flex-1 min-w-0 h-11 px-4 rounded-full border border-rose-300 bg-shell text-sm' />
            <button onClick={copy} className='h-11 px-5 rounded-full bg-berry text-white text-sm font-bold cursor-pointer'>Copy</button>
          </div>
          <a href={`https://wa.me/?text=${encodeURIComponent(`My Surprise Heaven wishlist 🎁 ${link}`)}`} target='_blank' rel='noreferrer' className='self-start text-sm font-bold text-[#2F5A37] hover:underline underline-offset-4'>Share on WhatsApp ↗</a>
        </div>
      )}
    </div>
  )
}

const Wishlist = () => {
  const { wishlist, products, productsLoading, token, addToCart } = useContext(ShopContext)
  const items = wishlist.map(id => products.find(p => p._id === id)).filter(Boolean)
  const quickAdd = items.filter(p => !needsOptions(p) && available(p) > 0)

  const addAll = async () => {
    for (const p of quickAdd) await addToCart(p._id, p.sizes[0], 1)
  }

  return (
    <div className='pt-10 pb-16'>
      <div className='flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 mb-8'>
        <div>
          <Title as='h1' eyebrow='Saved for later' text1='My' text2='wishlist' />
          <p className='text-mauve -mt-1'>{productsLoading ? 'Loading…' : `${items.length} saved gift${items.length === 1 ? '' : 's'}`}</p>
        </div>
        {quickAdd.length > 1 && <button onClick={addAll} className='btn-outline'><Icon name='bag' size={18} /> Add {quickAdd.length} to bag</button>}
      </div>

      {!productsLoading && items.length === 0 ? (
        <div className='rounded-[28px] border border-dashed border-rose-300 bg-white py-16 px-6 text-center flex flex-col items-center gap-3'>
          <Icon name='heart' size={36} className='text-berry' />
          <p className='font-display text-3xl font-semibold'>Nothing saved yet</p>
          <p className='text-mauve text-sm max-w-md'>Tap the heart on any gift to save it here — handy for planning birthdays, or for dropping hints.</p>
          <Link to='/collection' className='btn-primary mt-2'>Browse gifts</Link>
        </div>
      ) : (
        <div className='grid lg:grid-cols-[minmax(0,1fr)_340px] gap-10 items-start'>
          <Grid items={items} owner />
          <aside className='lg:sticky lg:top-28 flex flex-col gap-4'>
            {token ? <SharePanel /> : (
              <div className='rounded-[28px] bg-white border border-line p-6'>
                <p className='font-display text-2xl font-semibold'>Keep your wishlist</p>
                <p className='text-sm text-mauve mt-1 mb-4'>It's saved on this device for now. Log in to keep it on every device and share it with friends.</p>
                <Link to='/login?redirect=/wishlist' className='btn-primary'>Log in or sign up</Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}

// Someone else's shared wishlist
export const SharedWishlist = () => {
  const { shareId } = useParams()
  const { backendUrl, products, productsLoading } = useContext(ShopContext)
  const [data, setData] = useState(null)

  useEffect(() => {
    axios.get(`${backendUrl}/api/user/wishlist/shared/${shareId}`)
      .then(({ data }) => setData(data))
      .catch(error => setData({ success: false, message: error.message }))
  }, [shareId])

  if (!data || productsLoading) return <div className='min-h-[50vh]'></div>
  if (!data.success) return (
    <div className='py-24 text-center flex flex-col items-center gap-4'>
      <p className='font-display text-4xl font-semibold'>Wishlist not available</p>
      <p className='text-mauve'>{data.message}</p>
      <Link to='/collection' className='btn-primary mt-2'>Browse gifts</Link>
    </div>
  )
  const items = data.productIds.map(id => products.find(p => p._id === id)).filter(Boolean)

  return (
    <div className='pt-10 pb-16'>
      <div className='rounded-[32px] bg-gradient-to-br from-berry-dark via-[#9A2459] to-[#5E1238] text-white p-8 sm:p-10 mb-10 relative overflow-hidden'>
        <span className='absolute -right-10 -top-10 w-48 h-48 rounded-full bg-berry/40'></span>
        <p className='relative text-gold-light text-xs font-bold tracking-[0.2em] uppercase'>A wishlist from</p>
        <h1 className='relative font-display text-[2.8rem] sm:text-[3.6rem] leading-none font-semibold mt-2'>{data.name}'s <i>wishlist</i></h1>
        <p className='relative text-white/75 mt-3 max-w-xl'>{items.length} gift{items.length === 1 ? '' : 's'} {data.name} would love. Pick one, add a hand-lettered card, and we'll deliver it beautifully wrapped.</p>
      </div>
      {items.length === 0 ? <p className='text-mauve text-center py-12'>This wishlist is empty right now.</p> : <Grid items={items} owner={false} />}
    </div>
  )
}

export default Wishlist
