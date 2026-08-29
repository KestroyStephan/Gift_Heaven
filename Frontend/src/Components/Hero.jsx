import React from 'react'
import { assets } from '../assets/assets'

const Hero = () => {
  return (
    <div className='flex flex-col sm:flex-row border border-rose-200'>
        {/** Hero left */}
        <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
            <div className='text-rose-900'>
                <div className='flex items-center gap-2'>
                    <p className='w-8 md:w-11 h-[2px] bg-rose-500'></p>
                    <p className='font=medium text-sm md:text-base tracking-wide'>MADE FOR YOUR LOVED ONE</p>
                </div>
                <h1 className='prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed'>Gifts That Say<br/>I Love You</h1>
                <div className='flex items-center gap-2'>
                    <p className='font-semibold text-sm md:text-base'>SHOP NOW</p>
                    <p className='w-8 md:w-11 h-[1px] bg-rose-500'></p>
                </div>
            </div>
        </div>
        {/* Hero right side */}
        <img className='w-full sm:w-1/2' src={assets.hero_img} alt="" />
      
    </div>
  )
}

export default Hero
