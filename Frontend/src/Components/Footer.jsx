import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div >
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-20 text-sm'>
        <div>
            <img src={assets.logo} className='mb-5 w-56' alt="" />
            <p className='w-full md:w-2/3 text-gray-600' >
               Our mission is to make gifting easy, joyful, and secure.
               Thank you for choosing us to be part of your love story. 
            </p>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>Home</li>
                <li>About Us</li>
                <li>Delivery</li>
                <li>Privacy Policy</li>
            </ul>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>+94 77 665 8765</li>
                <li>hello@amoragifts.com</li>
            </ul>
        </div>
           
      </div>
         <div>
            <hr />
            <p className='py-5 text-sm text-center'>Copyright © 2026 Amora Gifts. All rights reserved.</p>
         </div>
    </div>
  )
}

export default Footer
