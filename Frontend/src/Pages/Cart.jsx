import React, { useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {ShopContext, splitKey, priceOf} from '../Context/ShopContext'
import CustomSummary from '../Components/CustomSummary'
import CartTotal from '../Components/CartTotal';
import Icon from '../Components/Icons';
import { prettify } from '../Components/ProductItem';

const sizeLabels = { S: 'Small', M: 'Medium', L: 'Large' }

const Cart = () => {

  const {products,currency,cartItems, cartCustoms, extrasOf, updateQuantity,navigate} = useContext(ShopContext);

  const cartData = useMemo(() => {
    const rows = [];
    for(const itemId in cartItems){
      for(const key in cartItems[itemId]){
        const product = products.find((p)=>p._id === itemId)
        if (cartItems[itemId][key] > 0 && product) {
          const { size, customId } = splitKey(key)
          const custom = customId ? cartCustoms[customId] : null
          rows.push({ product, key, size, custom, unit: priceOf(product, size) + extrasOf(custom), quantity: cartItems[itemId][key] })
        }
      }
    }
    return rows
  },[cartItems,cartCustoms,products,extrasOf])

  return (
    <div className='pt-10'>
      <h1 className='font-display font-semibold text-[2.6rem] sm:text-[3.2rem] mb-8'>Your <span className='italic text-berry'>bag</span></h1>

      {cartData.length === 0 ? (
        <div className='rounded-[28px] border border-dashed border-rose-300 bg-white py-16 px-6 text-center flex flex-col items-center gap-4'>
          <Icon name='bag' size={40} className='text-berry' />
          <p className='font-display text-3xl font-semibold'>Your bag is empty</p>
          <p className='text-mauve'>Find something lovely for someone special.</p>
          <Link to='/collection' className='btn-primary mt-2'>Browse gifts</Link>
        </div>
      ) : (
        <div className='grid lg:grid-cols-[1.7fr_1fr] gap-10 items-start'>
          <ul className='flex flex-col'>
            {cartData.map(({ product, key, size, custom, unit, quantity })=>(
              <li key={product._id + key} className='py-6 border-b border-line first:border-t flex gap-5'>
                <Link to={`/product/${product._id}`} className='w-24 sm:w-32 shrink-0 self-start rounded-2xl overflow-hidden bg-blush aspect-square'>
                  <img className='w-full h-full object-cover' src={product.image[0]} alt={product.name} />
                </Link>
                <div className='flex-1 min-w-0 flex flex-col gap-2'>
                  <div className='flex justify-between gap-4'>
                    <div className='min-w-0'>
                      <p className='text-xs font-semibold text-muted'>{prettify(product.category)}</p>
                      <Link to={`/product/${product._id}`} className='font-bold text-lg hover:text-berry'>{product.name}</Link>
                      <p className='text-sm text-mauve mt-1'>Size: {sizeLabels[size] || size}</p>
                      <CustomSummary custom={custom} />
                    </div>
                    <p className='font-semibold whitespace-nowrap'>{currency}{(unit * quantity).toLocaleString('en-LK')}</p>
                    {product.trackStock && quantity > product.stock && <p className='text-xs font-semibold text-rose-700'>{product.stock ? `Only ${product.stock} left — please reduce` : 'Sold out — please remove'}</p>}
                  </div>
                  <div className='flex items-center justify-between mt-auto'>
                    <div className='flex items-center h-10 rounded-full border border-rose-300 bg-white'>
                      <button onClick={()=>quantity > 1 && updateQuantity(product._id,key,quantity - 1)} disabled={quantity <= 1} aria-label='Decrease quantity' className='w-10 h-full flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-default'><Icon name='minus' size={16} /></button>
                      <span className='w-7 text-center text-sm font-bold'>{quantity}</span>
                      <button onClick={()=>updateQuantity(product._id,key,quantity + 1)} disabled={product.trackStock && quantity >= product.stock} aria-label='Increase quantity' className='w-10 h-full flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-default'><Icon name='plus' size={16} /></button>
                    </div>
                    <button onClick={()=>updateQuantity(product._id,key,0)} className='flex items-center gap-1.5 text-sm text-muted hover:text-berry cursor-pointer'>
                      <Icon name='trash' size={16} /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className='bg-white border border-line rounded-[28px] p-6 sm:p-8 lg:sticky lg:top-28 flex flex-col gap-6'>
            <CartTotal />
            <button onClick={()=>navigate('/place-order')} className='btn-primary w-full'>Checkout securely <Icon name='lock' size={18} /></button>
            <Link to='/collection' className='text-center text-sm font-semibold text-berry'>Continue shopping</Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart
