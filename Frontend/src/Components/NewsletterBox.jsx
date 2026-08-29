import React from 'react'

const NewsletterBox = () => {

    const onSUbmitHandler = (event)=>{
        event.preventDefault(); /* when submit it will not reload webpage */
    }



  return (
    <div className='text-center'>
        <p className='text-2xl font-medium text-rose-900'>Subscribe Now & Get 20% Off</p>
        <p className='text-gray-400 mt-3'>Never miss a reason to celebrate. Thank you for shopping with us!
             Follow us on social media for new arrivals and exclusive offers <br />© 2026 Amora Gifts – Gifts for Lovers & Anniversaries.
        </p>
        <form onSubmit={onSUbmitHandler} className='w- sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3 '>
            <input className='w-full sm:flex-1 outline-none' type="email" placeholder='Enter Your Email' required />
            <button type='submit' className='bg-rose-600 text-white text-xs px-10 py-4'>Subscribe</button>
        </form>
    </div>
  )
}

export default NewsletterBox
