import React, { useContext } from 'react'
import { ShopContext } from '../Context/ShopContext'
import {Link} from 'react-router-dom'
import { fromPrice } from '../Context/ShopContext'

// Display names for the category / occasion values stored on products
export const catalogNames = {
    ChocolateBucket: 'Chocolate Buckets', Bouquet: 'Bouquets', GiftHamper: 'Gift Hampers',
    Teddy: 'Teddy & Plush', LoveFocil: 'Love Boxes', Personalised: 'Personalised Gifts',
    CustomPrint: 'Custom Printing', Cake: 'Cakes', Festive: 'Festive & Cultural',
    Toys: 'Kids & Toys', Baby: 'Baby', Jewellery: 'Jewellery', Plants: 'Plants & Pots', HomeDecor: 'Home & Décor',
    Stationery: 'Pens & Key Tags', ArtSupplies: 'Art & Drawing', Games: 'Games & Puzzles', GiftPackage: 'Gift Packages', Accessories: 'Fashion Accessories', KitchenDining: 'Kitchen & Dining', Fragrances: 'Perfumes & Fragrances', Watches: 'Watches', BagsWallets: 'Bags & Wallets', Footwear: 'Shoes', Eyewear: 'Sunglasses', Beauty: 'Makeup & Beauty', Tech: 'Tech Accessories', Gaming: 'Gaming Accessories',
    BirthdayGift: 'Birthday', AnniversaryGift: 'Anniversary', SurpriseGift: 'Surprise',
    ValentineGift: "Valentine's", WeddingGift: 'Wedding', ThankYouGift: 'Thank You',
    HousewarmingGift: 'Housewarming', BabyGift: 'New Baby', GraduationGift: 'Graduation',
    AvuruduGift: 'Sinhala & Tamil New Year', DiwaliGift: 'Diwali', PongalGift: 'Thai Pongal', EidGift: 'Eid', ChristmasGift: 'Christmas',
}

// Who a gift is for
export const recipientNames = {
    her: 'For her', him: 'For him', couples: 'For couples', kids: 'For kids',
    teens: 'For teens', elders: 'For elders', baby: 'For baby',
}

// Unknown values: "ChocolateBucket" -> "Chocolate Bucket"
export const prettify = (value) => catalogNames[value] || String(value || '').replace(/([a-z])([A-Z])/g, '$1 $2')

const ProductItem = ({id,image,name,price,category,bestseller,sizePrices}) => {

    const {currency} = useContext(ShopContext)

  return (
    <Link className='group flex flex-col gap-3 text-ink' to={`/product/${id}`}>
        <div className='relative overflow-hidden rounded-[22px] bg-blush aspect-square'>
            {image?.[0] && <img className='absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105' src={image[0]} alt={name} loading='lazy' />}
            {bestseller && <span className='absolute top-3 left-3 bg-white text-berry text-[11px] font-bold tracking-[0.08em] px-2.5 py-1.5 rounded-xl'>BEST SELLER</span>}
            <span className='absolute bottom-3 right-3 bg-white/95 text-ink text-xs font-bold px-3 py-2 rounded-full opacity-0 translate-y-2 transition group-hover:opacity-100 group-hover:translate-y-0'>View gift</span>
        </div>
        <div className='flex flex-col gap-1'>
            {category && <p className='text-xs font-semibold text-muted'>{prettify(category)}</p>}
            <p className='font-bold leading-snug group-hover:text-berry'>{name}</p>
            <p className='text-[15px]'>{sizePrices ? 'From ' : ''}{currency}{fromPrice({ price, sizePrices }).toLocaleString('en-LK')}</p>
        </div>
    </Link>
  )
}

export default ProductItem
