import React, { useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {ShopContext} from '../Context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem';
import Icon from './Icons';

const BestSeller = () => {

    const {products} = useContext(ShopContext);
    const bestSeller = useMemo(() => products.filter((item)=>(item.bestseller)).slice(0,8), [products])

    if (bestSeller.length === 0) return null

  return (
    <section className='shell py-20'>
        <div className='flex flex-wrap items-end justify-between gap-4 mb-8'>
            <div>
                <Title eyebrow='Most loved' text1={'Best'} text2={'sellers'}/>
                <p className='text-mauve max-w-xl -mt-1'>The gifts our customers keep coming back for.</p>
            </div>
            <Link to='/collection' className='font-bold text-sm text-berry flex items-center gap-1'>Shop all <Icon name='arrow' size={16} /></Link>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-9'>
            {
                bestSeller.map((item)=>(
                    <ProductItem key={item._id} id={item._id} name={item.name} image={item.image} price={item.price} category={item.category} bestseller sizePrices={item.sizePrices} brand={item.brand} />
                ))
            }
        </div>
    </section>
  )
}

export default BestSeller
