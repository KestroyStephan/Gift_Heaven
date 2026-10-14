import React from 'react'
import Hero from '../Components/Hero'
import Occasions, { Festivals, ShopByRecipient } from '../Components/Occasions'
import StudioPromo from '../Components/StudioPromo'
import LatestCollection from '../Components/LatestCollection'
import BestSeller from '../Components/BestSeller'
import OurPolicy from '../Components/OurPolicy'
import NewsletterBox from '../Components/NewsletterBox'
import { ShopByDepartment, BrandStrip, BudgetDeals, BrandSpotlight, DealsStrip, CustomerLove } from '../Components/Mall'

const Home = () => {
  return (
    <div>
      <Hero />
      <DealsStrip />
      <ShopByDepartment />
      <BrandStrip />
      <BudgetDeals />
      <BrandSpotlight index={0} />
      <ShopByRecipient />
      <Occasions />
      <BrandSpotlight index={1} />
      <StudioPromo />
      <BestSeller />
      <BrandSpotlight index={2} />
      <Festivals />
      <CustomerLove />
      <OurPolicy />
      <LatestCollection/>
      <NewsletterBox />
    </div>
  )
}

export default Home
