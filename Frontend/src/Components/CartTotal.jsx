import React, { useContext, useState } from 'react'
import { ShopContext } from '../Context/ShopContext'
import Icon from './Icons'

const money = (currency, n) => `${currency}${Math.round(n).toLocaleString('en-LK')}`

const CartTotal = ({ showCoupon = true }) => {

    const { currency, delivery_fee, getCartAmount, getCartCount, couponCode, couponResult, couponError, couponChecking, applyCoupon, removeCoupon, publicCoupons } = useContext(ShopContext);
    const [code, setCode] = useState('')
    const subtotal = getCartAmount()
    const discount = couponResult?.discount || 0
    const shipping = subtotal === 0 ? 0 : couponResult ? couponResult.deliveryFee : delivery_fee
    const hint = publicCoupons.find(c => !c.firstOrderOnly) || publicCoupons[0]

  return (
    <div className='w-full flex flex-col gap-3 text-[15px]'>
        <h2 className='font-display text-3xl font-semibold mb-2'>Order summary</h2>
        <div className='flex justify-between text-mauve'>
            <p>Subtotal ({getCartCount()} {getCartCount() === 1 ? 'item' : 'items'})</p>
            <p>{money(currency, subtotal)}</p>
        </div>
        {discount > 0 && (
            <div className='flex justify-between text-[#2F5A37] font-semibold'>
                <p>Coupon {couponResult.coupon.code}</p>
                <p>−{money(currency, discount)}</p>
            </div>
        )}
        <div className='flex justify-between text-mauve'>
            <p>Delivery</p>
            {shipping === 0 && subtotal > 0 ? <p className='text-[#2F5A37] font-semibold'>Free</p> : <p>{money(currency, shipping)}</p>}
        </div>
        <div className='flex justify-between text-mauve'>
            <p>Gift note</p>
            <p className='text-[#2F5A37] font-semibold'>Free</p>
        </div>

        {showCoupon && subtotal > 0 && (
            couponCode ? (
                <div className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${couponResult ? 'bg-[#EAF3EA] text-[#2F5A37]' : 'bg-rose-50 text-berry'}`}>
                    <Icon name={couponResult ? 'check' : 'close'} size={18} className='mt-0.5 shrink-0' />
                    <span className='flex-1'>
                        <b className='tracking-wide'>{couponCode}</b>
                        <span className='block text-xs'>{couponChecking ? 'Checking…' : couponResult ? couponResult.message : couponError}</span>
                    </span>
                    <button type='button' onClick={removeCoupon} className='text-xs font-bold underline underline-offset-2 cursor-pointer'>Remove</button>
                </div>
            ) : (
                <div className='flex flex-col gap-1.5'>
                    <form onSubmit={(e) => { e.preventDefault(); applyCoupon(code); setCode('') }} className='flex gap-2'>
                        <label className='sr-only' htmlFor='coupon-code'>Coupon code</label>
                        <input id='coupon-code' value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder='Coupon code' className='flex-1 min-w-0 h-11 px-4 rounded-full border border-rose-300 bg-white uppercase tracking-wide text-sm' />
                        <button type='submit' disabled={!code.trim()} className='h-11 px-5 rounded-full bg-berry text-white text-sm font-bold cursor-pointer disabled:opacity-40'>Apply</button>
                    </form>
                    {hint && <p className='text-xs text-muted'>Try <button type='button' onClick={() => applyCoupon(hint.code)} className='font-bold text-berry underline underline-offset-2 cursor-pointer'>{hint.code}</button> — {hint.description}</p>}
                </div>
            )
        )}

        <hr className='border-line my-1' />
        <div className='flex justify-between text-lg font-bold'>
            <p>Total</p>
            <p>{money(currency, subtotal - discount + shipping)}</p>
        </div>
        {discount > 0 && <p className='text-sm text-[#2F5A37] font-semibold text-right -mt-2'>You save {money(currency, discount)}</p>}
    </div>
  )
}

export default CartTotal
