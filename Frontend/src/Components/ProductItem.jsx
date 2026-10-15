import React, { useContext } from 'react'
import { ShopContext } from '../Context/ShopContext'
import {Link} from 'react-router-dom'
import { fromPrice, fromListPrice, stockLabel, offerOf } from '../Context/ShopContext'
import { Stars } from './Stars'
import WishlistButton from './WishlistButton'

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

const ProductItem = ({id,image,name,price,category,bestseller,sizePrices,brand}) => {

    const isBox = name === 'Build-Your-Own Surprise Box'

    const {currency, brandOf, products} = useContext(ShopContext)
    const product = products.find(p => p._id === id)
    const stock = stockLabel(product)
    const sale = product ? fromPrice(product) : fromPrice({ price, sizePrices })
    const was = product ? fromListPrice(product) : sale
    const deal = product && sale < was ? offerOf(product, was)?.offer : null
    const brandName = brandOf(brand)?.name

  return (
    <Link className='group flex flex-col gap-3 text-ink bg-white rounded-[26px] border border-line p-2.5 pb-4 card-lift sr sr-up' to={isBox ? '/build-a-box' : `/product/${id}`}>
        <div className='relative overflow-hidden rounded-[20px] bg-blush aspect-square'>
            {image?.[0] && <img className='absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105' src={image[0]} alt={name} loading='lazy' />}
            {stock?.tone === 'out' && <span className='absolute inset-0 bg-white/55 flex items-center justify-center'><span className='st st-off st-lg shadow-sm'>Sold out</span></span>}
            {stock?.tone === 'low' && <span className='absolute bottom-3 left-3 st st-warn shadow-sm'>{stock.text}</span>}
            <WishlistButton productId={id} name={name} className='absolute top-3 right-3 z-10' />
            {deal && <span className='absolute top-14 right-3 bg-gradient-to-br from-berry to-berry-dark text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl shadow-[0_6px_16px_-6px_rgba(210,58,127,.9)]'>{deal.type === 'percent' ? `−${deal.value}%` : `Rs. ${deal.value} off`}</span>}
            {bestseller && <span className='absolute top-3 left-3 bg-white text-berry text-[11px] font-bold tracking-[0.08em] px-2.5 py-1.5 rounded-xl'>BEST SELLER</span>}
            <span className='absolute bottom-3 right-3 bg-berry text-white text-xs font-bold px-3.5 py-2 rounded-full opacity-0 translate-y-2 transition duration-300 group-hover:opacity-100 group-hover:translate-y-0 shadow-[0_8px_18px_-6px_rgba(210,58,127,.8)]'>View gift →</span>
        </div>
        <div className='flex flex-col gap-1 px-2'>
            {(brandName || category) && <p className='text-xs font-semibold text-muted'>{brandName ? <span className='text-berry'>{brandName}</span> : null}{brandName && category ? ' · ' : ''}{category ? prettify(category) : ''}</p>}
            <p className='font-bold leading-snug group-hover:text-berry'>{name}</p>
            {product?.ratingCount > 0 && <p className='flex items-center gap-1.5 text-xs text-muted'><Stars value={product.ratingAvg} size={13} /><b className='text-ink'>{product.ratingAvg.toFixed(1)}</b>({product.ratingCount})</p>}
            <p className='text-[15px] flex flex-wrap items-baseline gap-x-2'>
                <span className={deal ? 'font-bold text-berry' : ''}>{sizePrices ? 'From ' : ''}{currency}{sale.toLocaleString('en-LK')}</span>
                {deal && <s className='text-sm text-muted'>{currency}{was.toLocaleString('en-LK')}</s>}
            </p>
            {deal && <p className='text-xs font-semibold text-berry -mt-0.5'>{deal.badge || deal.name}</p>}
        </div>
    </Link>
  )
}

export default ProductItem
