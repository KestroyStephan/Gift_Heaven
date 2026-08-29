import React from 'react'
import Title from '../Components/Title'
import {assets} from '../assets/assets'
import NewsletterBox from '../Components/NewsletterBox'

const About = () => {  
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-700'>
            <p>Amora Gifts began with a simple belief: the best gifts are the ones that make someone feel truly seen. We curate romantic gifts, anniversary keepsakes, and thoughtful surprises for the people who matter most — partners, spouses, and sweethearts near and far.</p>
            <p>From personalised keepsakes to classic roses-and-chocolates combos, every item in our collection is chosen to help you say "I love you" in your own way. Browse, customise, and check out online with secure payment, then let us handle fast, careful delivery so your gift arrives exactly when it should.</p>
            <b className='text-rose-950'>Our Mission</b>
            <p>To make it effortless to celebrate love — anniversaries, proposals, date nights, and every ordinary day worth making extraordinary — with gifts that feel personal, not generic.</p>
        </div>
      </div>

      <div className='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Thoughtfully Curated:</b>
            <p className='text-gray-700'>Every gift in our collection is hand-picked for romance — from anniversary keepsakes to sweet everyday surprises — so you can find something that truly fits your special someone.</p>
        </div>

        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Made for Milestones:</b>
            <p className='text-gray-700'>Anniversaries, Valentine's Day, proposals, or just because — browse by occasion, personalise your gift, and check out securely in just a few clicks.</p>
        </div>

        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Delivered with Care:</b>
            <p className='text-gray-700'>Fast, discreet delivery and a support team that's always ready to help you get the timing — and the moment — just right.</p>
        </div>

      </div>

      <NewsletterBox />
      
    </div>
  )
}

export default About
