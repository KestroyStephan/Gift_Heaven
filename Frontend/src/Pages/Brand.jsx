import React, { useContext, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ShopContext, fromPrice } from '../Context/ShopContext'
import ProductItem, { prettify } from '../Components/ProductItem'
import Icon from '../Components/Icons'
import { BrandMark } from '../Components/Mall'

// One brand's store front: banner, story and all its gifts
const Brand = () => {
  const { slug } = useParams()
  const { brands, products, productsLoading } = useContext(ShopContext)
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('featured')

  const brand = brands.find(b => b.slug === slug)
  if (!brand) {
    return productsLoading || brands.length === 0 ? <div className='min-h-[50vh]'></div> : (
      <div className='py-24 text-center flex flex-col items-center gap-4'>
        <p className='font-display text-4xl font-semibold'>Brand not found</p>
        <Link to='/brands' className='btn-primary mt-2'>See all brands</Link>
      </div>
    )
  }

  const all = products.filter(p => p.brand === brand.slug)
  const categories = [...new Set(all.map(p => p.category))]
  let items = all.filter(p => !category || p.category === category)
  if (sort === 'featured') items = [...items].sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0))
  if (sort === 'low-high') items = [...items].sort((a, b) => fromPrice(a) - fromPrice(b))
  if (sort === 'high-low') items = [...items].sort((a, b) => fromPrice(b) - fromPrice(a))
  const others = brands.filter(b => b.slug !== brand.slug && b.productCount > 0).slice(0, 6)

  return (
    <div className='pt-8 pb-16'>
      <nav aria-label='Breadcrumb' className='flex flex-wrap gap-2 text-sm text-muted mb-6'>
        <Link to='/' className='hover:text-berry'>Home</Link><span aria-hidden='true'>/</span>
        <Link to='/brands' className='hover:text-berry'>Brands</Link><span aria-hidden='true'>/</span>
        <span className='text-ink font-semibold'>{brand.name}</span>
      </nav>

      <section className='relative overflow-hidden rounded-[32px] text-white p-8 sm:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-end' style={{ background: 'linear-gradient(135deg, #E84F93 0%, #B82D6E 50%, #6B1940 100%)' }}>
        <div className='relative max-w-2xl'>
          <p className='text-[11px] font-bold tracking-[0.22em] uppercase text-white/70 mb-4'>Official brand store</p>
          <h1><BrandMark brand={brand} light className='block !text-left text-[3rem] sm:text-[4rem] max-h-28' /></h1>
          {brand.tagline && <p className='text-xl text-white/90 mt-4'>{brand.tagline}</p>}
          {brand.description && <p className='text-white/70 mt-3 leading-relaxed'>{brand.description}</p>}
        </div>
        <div className='relative flex gap-6 text-sm'>
          <span><b className='block font-display text-4xl'>{all.length}</b>gifts</span>
          <span><b className='block font-display text-4xl'>{categories.length}</b>categories</span>
        </div>
      </section>

      <div className='flex flex-wrap items-center justify-between gap-4 my-8'>
        <div className='flex flex-wrap gap-2'>
          {['', ...categories].map(c => (
            <button key={c || 'all'} onClick={() => setCategory(c)} aria-pressed={category === c}
              className={`h-10 px-4 rounded-full text-sm font-semibold border cursor-pointer ${category === c ? 'bg-berry text-white border-berry' : 'bg-white border-line hover:border-berry'}`}>
              {c ? prettify(c) : `All (${all.length})`}
            </button>
          ))}
        </div>
        <label className='flex items-center gap-2 text-sm'>
          <span className='text-mauve'>Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className='h-10 px-4 rounded-full border border-rose-300 bg-white font-semibold cursor-pointer'>
            <option value='featured'>Featured</option>
            <option value='low-high'>Price: low to high</option>
            <option value='high-low'>Price: high to low</option>
          </select>
        </label>
      </div>

      {items.length === 0 ? <p className='text-mauve py-12 text-center'>No gifts from {brand.name} yet.</p> : (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-9'>
          {items.map(item => <ProductItem key={item._id} id={item._id} name={item.name} price={item.price} image={item.image} category={item.category} bestseller={item.bestseller} sizePrices={item.sizePrices} brand={item.brand} />)}
        </div>
      )}

      {others.length > 0 && (
        <section className='mt-20'>
          <div className='flex items-end justify-between gap-4 mb-5'>
            <h2 className='font-display text-3xl font-semibold'>More brands to explore</h2>
            <Link to='/brands' className='font-bold text-sm text-berry flex items-center gap-1'>All brands <Icon name='arrow' size={16} /></Link>
          </div>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3'>
            {others.map(b => (
              <Link key={b.slug} to={`/brand/${b.slug}`} className='h-24 rounded-2xl border border-line bg-white flex items-center justify-center px-3 hover:border-berry'>
                <BrandMark brand={b} className='text-xl max-h-14' />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default Brand
