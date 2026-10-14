import React, { useContext, useMemo } from 'react'
import { ShopContext } from '../Context/ShopContext'
import Title from '../Components/Title'
import ProductItem from './ProductItem'

const RelatedProducts = ({category, subCategory, currentId}) => {

    const {products} = useContext(ShopContext);

    // Same category first, then same occasion
    const related = useMemo(() => {
        const others = products.filter(item => item._id !== currentId)
        const sameCategory = others.filter(item => item.category === category)
        const sameOccasion = others.filter(item => item.category !== category && item.subCategory === subCategory)
        return [...sameCategory, ...sameOccasion].slice(0, 4)
    }, [products, category, subCategory, currentId])

    if (related.length === 0) return null

  return (
    <section className='mt-24'>
        <Title text1={'You may'} text2={'also love'} className='mb-8' />
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-9'>
            {related.map((item)=>(
                <ProductItem key={item._id} id={item._id} name={item.name} price={item.price} image={item.image} category={item.category} bestseller={item.bestseller} sizePrices={item.sizePrices} />
            ))}
        </div>
    </section>
  )
}

export default RelatedProducts
