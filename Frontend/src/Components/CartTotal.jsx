import React from 'react'
import { useContext } from 'react'
import { ShopContext } from '../Context/ShopContext'

const CartTotal = () => {

    const {currency,delivery_fee,getCartAmount,getCartCount} = useContext(ShopContext);
    const subtotal = getCartAmount()
    const shipping = subtotal === 0 ? 0 : delivery_fee

  return (
    <div className='w-full flex flex-col gap-3 text-[15px]'>
        <h2 className='font-display text-3xl font-semibold mb-2'>Order summary</h2>
        <div className='flex justify-between text-mauve'>
            <p>Subtotal ({getCartCount()} {getCartCount() === 1 ? 'item' : 'items'})</p>
            <p>{currency}{subtotal.toLocaleString('en-LK')}</p>
        </div>
        <div className='flex justify-between text-mauve'>
            <p>Delivery</p>
            <p>{currency}{shipping.toLocaleString('en-LK')}</p>
        </div>
        <div className='flex justify-between text-mauve'>
            <p>Gift note</p>
            <p className='text-[#2F5A37] font-semibold'>Free</p>
        </div>
        <hr className='border-line my-1' />
        <div className='flex justify-between text-lg font-bold'>
            <p>Total</p>
            <p>{currency}{(subtotal + shipping).toLocaleString('en-LK')}</p>
        </div>
    </div>
  )
}

export default CartTotal
