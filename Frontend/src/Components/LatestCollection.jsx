import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'
import Icon from './Icons'

const LatestCollection = () => {

    const {products, productsLoading} = useContext(ShopContext);
    const latestProducts = products.slice(0,8)

  return (
    <section className='shell py-20'>
        <div className='flex flex-wrap items-end justify-between gap-4 mb-8'>
            <div>
                <Title eyebrow='Just in' text1={'Latest'} text2={'collection'} />
                <p className='text-mauve max-w-xl -mt-1'>Freshly added gifts for the people you love most.</p>
            </div>
            <Link to='/collection' className='font-bold text-sm text-berry flex items-center gap-1'>View all <Icon name='arrow' size={16} /></Link>
        </div>

        {!productsLoading && latestProducts.length === 0 && (
            <div className='rounded-[28px] border border-dashed border-rose-300 bg-white py-16 text-center text-mauve'>
                New gifts are being wrapped — check back soon.
            </div>
        )}

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-9'>
            {
                latestProducts.map((item)=>(
                    <ProductItem key={item._id} id={item._id} image={item.image} name={item.name} price={item.price} category={item.category} bestseller={item.bestseller} sizePrices={item.sizePrices} brand={item.brand} />
                ))
            }
        </div>
    </section>
  )
}

export default LatestCollection
