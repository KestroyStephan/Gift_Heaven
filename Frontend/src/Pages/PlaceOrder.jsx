import React, { useContext, useEffect, useState } from 'react'
import Icon from '../Components/Icons'
import CartTotal from '../Components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext, splitKey } from '../Context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'


const loadRazorpayScript = () => new Promise((resolve) => {
   if (window.Razorpay) return resolve(true)
   const script = document.createElement('script')
   script.src = 'https://checkout.razorpay.com/v1/checkout.js'
   script.onload = () => resolve(true)
   script.onerror = () => resolve(false)
   document.body.appendChild(script)
})

const PlaceOrder = () => {


   const [method, setMethod] = useState('cod');
   const [loading, setLoading] = useState(false);
   const { navigate, backendUrl, token, cartItems, cartCustoms, clearCart, getCartAmount, getCartCount, products, handleAuthError, couponCode, couponResult } = useContext(ShopContext);


   const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      street: '',
      city: '',
      state: '',
      zipcode: '',
      country: '',
      phone: '',
      giftNote: ''

   })

   useEffect(() => {
      if (!token) {
         toast.info('Please log in to place your order')
         navigate('/login?redirect=/place-order')
      }
   }, [token])

   const onChangeHandler = (event) => {
      const name = event.target.name;
      const value = event.target.value;
      setFormData(data => ({ ...data, [name]: value }))
   }

   const orderPlaced = (orderId) => {
      clearCart()
      navigate(`/order-success/${orderId}`)
   }

   const payWithRazorpay = async ({ order, key, orderId }) => {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
         toast.error('Could not load Razorpay. Check your connection.')
         await axios.post(backendUrl + '/api/orders/cancel', { orderId }, { headers: { token } })
         return
      }

      const options = {
         key,
         amount: order.amount,
         currency: order.currency,
         name: 'Surprise Heaven',
         description: 'Gift order payment',
         order_id: order.id,
         prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone
         },
         theme: { color: '#e11d48' },
         handler: async (response) => {
            try {
               const { data } = await axios.post(backendUrl + '/api/orders/verifyRazorpay', response, { headers: { token } })
               if (data.success) {
                  orderPlaced(data.orderId)
               } else {
                  setLoading(false)
                  toast.error(data.message)
               }
            } catch (error) {
               setLoading(false)
               console.log(error)
               toast.error(error.message)
            }
         },
         modal: {
            ondismiss: async () => {
               setLoading(false)
               toast.info('Payment cancelled')
               await axios.post(backendUrl + '/api/orders/cancel', { orderId }, { headers: { token } })
            }
         }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => toast.error(response.error?.description || 'Payment failed'))
      rzp.open()
   }

   const onSubmitHandler = async (event) => {
      event.preventDefault()
      if (loading) return

      if (getCartCount() === 0) {
         toast.error('Your cart is empty')
         return navigate('/collection')
      }

      setLoading(true)
      let keepLoading = false
      try {

         let orderItems = []
         for (const items in cartItems) {
            for (const item in cartItems[items]) {
               if (cartItems[items][item] > 0) {
                  const itemInfo = structuredClone(products.find(product => product._id === items))
                  if (itemInfo) {
                     const { size, customId } = splitKey(item)
                     itemInfo.size = size
                     itemInfo.custom = customId ? cartCustoms[customId] || null : null
                     itemInfo.quantity = cartItems[items][item]
                     orderItems.push(itemInfo)

                  }

               }
            }
         }
         // The server recalculates the price from the database
         let orderData = {
            address: formData,
            items: orderItems.map(({ _id, size, quantity, custom }) => ({ _id, size, quantity, custom })),
            // the server checks the coupon again and works out the discount itself
            ...(couponResult && couponCode ? { couponCode } : {})
         }

         switch (method) {
            //api calls for Cash on delivery
            case 'cod': {
               const response = await axios.post(backendUrl + '/api/orders/place',orderData,{headers:{token}})
               if (handleAuthError(response.data)) break

               if (response.data.success) {
                  orderPlaced(response.data.orderId)
               }else{
                  toast.error(response.data.message)
               }
               break;
            }

            case 'stripe': {
               const responseStripe = await axios.post(backendUrl + '/api/orders/stripe', orderData, {headers:{token}})
               if (handleAuthError(responseStripe.data)) break

               if (responseStripe.data.success) {
                  keepLoading = true
                  const {session_url} = responseStripe.data
                  window.location.replace(session_url)
                  
               }else{
                  toast.error(responseStripe.data.message)
               }

               break
            }

            case 'razorpay': {
               const responseRazorpay = await axios.post(backendUrl + '/api/orders/razorpay', orderData, {headers:{token}})
               if (handleAuthError(responseRazorpay.data)) break

               if (responseRazorpay.data.success) {
                  keepLoading = true
                  await payWithRazorpay(responseRazorpay.data)
               } else {
                  toast.error(responseRazorpay.data.message)
               }
               break
            }

            default:
               break;
         }


      } catch (error) {
            console.log(error)
            toast.error(error.message)
      } finally {
         if (!keepLoading) setLoading(false)
      }
   }



   const field = (name, label, props = {}) => (
      <label className='flex flex-col gap-2 text-sm font-semibold'>
         {label}
         <input required onChange={onChangeHandler} name={name} value={formData[name]} className='field' {...props} />
      </label>
   )

   const methods = [
      { id: 'stripe', title: 'Card (Stripe)', note: 'Visa, Mastercard, Amex', logo: assets.stripe_logo },
      { id: 'razorpay', title: 'Razorpay', note: 'Cards, UPI & wallets', logo: assets.razorpay_logo },
      { id: 'cod', title: 'Cash on delivery', note: 'Pay when it arrives' },
   ]

   return (
      <form onSubmit={onSubmitHandler} className='pt-10'>
         <h1 className='font-display font-semibold text-[2.6rem] sm:text-[3.2rem] mb-8'>Secure <span className='italic text-berry'>checkout</span></h1>

         <div className='grid lg:grid-cols-[1.5fr_1fr] gap-10 items-start'>

            {/* -------------------left side--------------- */}
            <div className='flex flex-col gap-8'>
               <section className='bg-white border border-line rounded-[28px] p-6 sm:p-8 flex flex-col gap-4'>
                  <h2 className='font-display text-3xl font-semibold'>1. Delivery details</h2>
                  <div className='grid sm:grid-cols-2 gap-4'>
                     {field('firstName', 'First name', { autoComplete: 'given-name' })}
                     {field('lastName', 'Last name', { autoComplete: 'family-name' })}
                  </div>
                  <div className='grid sm:grid-cols-2 gap-4'>
                     {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
                     {field('phone', 'Phone', { type: 'tel', autoComplete: 'tel' })}
                  </div>
                  {field('street', 'Street address', { autoComplete: 'street-address' })}
                  <div className='grid sm:grid-cols-2 gap-4'>
                     {field('city', 'City', { autoComplete: 'address-level2' })}
                     {field('state', 'State / Province', { autoComplete: 'address-level1' })}
                  </div>
                  <div className='grid sm:grid-cols-2 gap-4'>
                     {field('zipcode', 'Postal code', { autoComplete: 'postal-code' })}
                     {field('country', 'Country', { autoComplete: 'country-name' })}
                  </div>
               </section>

               <section className='bg-white border border-line rounded-[28px] p-6 sm:p-8 flex flex-col gap-3'>
                  <h2 className='font-display text-3xl font-semibold'>2. Note for the delivery <span className='text-base font-sans font-medium text-muted'>(optional, free)</span></h2>
                  <label htmlFor='giftNote' className='text-sm text-mauve'>Anything we should know — a card message for the whole order, delivery instructions or timing. Personalise each gift on its product page.</label>
                  <textarea id='giftNote' name='giftNote' value={formData.giftNote} onChange={onChangeHandler} maxLength={300} rows={3} placeholder='Happy birthday! With love from…' className='field resize-y' />
                  <p className='text-xs text-muted text-right'>{formData.giftNote.length}/300</p>
               </section>

               <section className='bg-white border border-line rounded-[28px] p-6 sm:p-8 flex flex-col gap-4'>
                  <h2 className='font-display text-3xl font-semibold'>3. Payment</h2>
                  <div role='radiogroup' aria-label='Payment method' className='grid sm:grid-cols-3 gap-3'>
                     {methods.map(m => (
                        <button type='button' role='radio' aria-checked={method === m.id} key={m.id} onClick={() => setMethod(m.id)}
                           className={`text-left rounded-2xl p-4 flex flex-col gap-2 cursor-pointer ${method === m.id ? 'border-2 border-berry bg-rose-50' : 'border-[1.5px] border-rose-300 bg-white hover:border-ink'}`}>
                           <span className='flex items-center justify-between gap-2'>
                              {m.logo ? <img src={m.logo} alt='' className='h-5 object-contain' /> : <span className='font-bold'>{m.title}</span>}
                              <span className={`w-4 h-4 rounded-full border-2 shrink-0 ${method === m.id ? 'border-berry bg-berry shadow-[inset_0_0_0_2px_white]' : 'border-rose-300'}`}></span>
                           </span>
                           {m.logo && <span className='font-bold text-sm'>{m.title}</span>}
                           <span className='text-xs text-muted'>{m.note}</span>
                        </button>
                     ))}
                  </div>
                  <p className='flex items-center gap-2 text-xs text-muted'><Icon name='lock' size={14} /> Card payments are processed securely by the payment provider — we never see your card details.</p>
               </section>
            </div>

            {/* -----------------------Right Side-------------------------- */}
            <aside className='bg-white border border-line rounded-[28px] p-6 sm:p-8 lg:sticky lg:top-28 flex flex-col gap-6'>
               <CartTotal />
               <button type='submit' disabled={loading} className='btn-primary w-full'>
                  {loading ? 'Processing…' : method === 'cod' ? 'Place order' : 'Continue to payment'}
               </button>
               <p className='text-xs text-muted text-center'>By placing your order you agree to our delivery and exchange terms.</p>
            </aside>
         </div>
      </form>
   )
}

export default PlaceOrder
