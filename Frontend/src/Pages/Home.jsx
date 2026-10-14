import React from 'react'
import Hero from '../Components/Hero'
import Occasions, { ShopByCategory, Festivals, ShopByRecipient } from '../Components/Occasions'
import StudioPromo from '../Components/StudioPromo'
import LatestCollection from '../Components/LatestCollection'
import BestSeller from '../Components/BestSeller'
import OurPolicy from '../Components/OurPolicy'
import NewsletterBox from '../Components/NewsletterBox'

const Home = () => {
  return (
    <div>
      <Hero />
      <ShopByRecipient />
      <ShopByCategory />
      <Occasions />
      <StudioPromo />
      <BestSeller />
      <Festivals />
      <OurPolicy />
      <LatestCollection/>
      <NewsletterBox />
    </div>
  )
}

export default Home
