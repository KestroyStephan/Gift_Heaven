import React from 'react'
import Title from '../Components/Title'
import {assets} from '../assets/assets'
import NewsLetterBox from '../Components/NewsletterBox'


const Contact = () => {
  return (
    <div>

      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1={'CONTACT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
          <img className='w-full md:max-w-[480px]' src={assets.contact_img} alt="" />
          <div className='flex flex-col justify-center items-start gap-6'>
            <p className='font-semibold text-xl text-gray-700'>Our Boutique</p>
            <p className='text-gray-600'> 6700 Main Road, PillayarKovil Road,<br />Dubai Kurukkusanthu, Dubai</p>
            <p className='text-gray-600'>Tel:(+94) 77-554-9857 <br />Email: hello@surpriseheven.com</p>
            <p className='font-semibold text-xl text-gray-600'>Careers at Surprise Heven</p>
            <p className='text-gray-600'>Learn more about our teams and jobs.</p>
            <button className='border border-rose-500 px-8 py-4 text-sm hover:bg-rose-700 hover:text-white transition-all duration-500'>Explore Jobs</button>
          </div>
      
      </div>
      <NewsLetterBox />
      
    </div>
  )
}

export default Contact
