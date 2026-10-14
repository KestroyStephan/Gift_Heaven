import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import Title from '../Components/Title'
import ProductItem, { prettify, recipientNames } from '../Components/ProductItem'
import Icon from '../Components/Icons'

const FilterGroup = ({ title, options, selected, onToggle, names }) => (
  <fieldset className='flex flex-col gap-3'>
    <legend className='text-xs font-bold tracking-[0.14em] text-ink mb-3'>{title}</legend>
    {options.map(value => (
      <label key={value} className='flex items-center gap-3 text-[15px] text-mauve cursor-pointer hover:text-ink'>
        <input type="checkbox" className='w-4 h-4 accent-berry' value={value} checked={selected.includes(value)} onChange={() => onToggle(value)} />
        {names?.[value] || prettify(value)}
      </label>
    ))}
  </fieldset>
)

const Collection = () => {

  const {products ,search, showSearch, productsLoading} = useContext(ShopContext);
  const [searchParams] = useSearchParams()
  const [showFilter, setShowFilter] = useState(false);
  const [category,setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [recipient, setRecipient] = useState([]);
  const [sortType, setSortType] = useState('relevant')

  // Links like /collection?sub=BirthdayGift preselect a filter
  useEffect(() => {
    const sub = searchParams.get('sub')
    const cat = searchParams.get('category')
    const forWho = searchParams.get('for')
    setSubCategory(sub ? [sub] : [])
    setCategory(cat ? [cat] : [])
    setRecipient(forWho ? [forWho] : [])
  }, [searchParams])

  // Filter options come from the products that actually exist
  const categories = useMemo(() => [...new Set(products.map(item => item.category))].sort(), [products])
  const subCategories = useMemo(() => [...new Set(products.map(item => item.subCategory))].sort(), [products])
  const recipients = useMemo(() => Object.keys(recipientNames).filter(r => products.some(p => p.recipients?.includes(r))), [products])

  const toggle = (setter) => (value) => {
    setter(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value])
  }

  const filterProducts = useMemo(() => {
    let productsCopy = products.slice();

    if(showSearch && search){
      const term = search.toLowerCase()
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(term) || item.description?.toLowerCase().includes(term))
    }

    if(category.length > 0 ){
      productsCopy = productsCopy.filter(item => category.includes(item.category))
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory))
    }

    if (recipient.length > 0) {
      productsCopy = productsCopy.filter(item => item.recipients?.some(r => recipient.includes(r)))
    }

    if (sortType === 'low-high') productsCopy.sort((a,b)=>(a.price - b.price))
    if (sortType === 'high-low') productsCopy.sort((a,b)=>(b.price - a.price))

    return productsCopy
  }, [products, search, showSearch, category, subCategory, recipient, sortType])

  const activeFilters = category.length + subCategory.length + recipient.length

  return (
    <div className='pt-10 pb-4'>
      <div className='flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 mb-8'>
        <div>
          <Title as='h1' eyebrow='Shop' text1={'All'} text2={'gifts'} />
          <p className='text-mauve -mt-1'>{productsLoading ? 'Loading gifts…' : `${filterProducts.length} ${filterProducts.length === 1 ? 'gift' : 'gifts'}`}</p>
        </div>

        <div className='flex gap-3'>
          <button onClick={()=>setShowFilter(!showFilter)} aria-expanded={showFilter} className='md:hidden h-11 px-5 rounded-full border border-rose-300 bg-white text-sm font-semibold cursor-pointer'>
            Filters{activeFilters ? ` (${activeFilters})` : ''}
          </button>
          <label className='flex items-center gap-2 text-sm'>
            <span className='sr-only sm:not-sr-only text-mauve'>Sort by</span>
            <select value={sortType} onChange={(e)=>setSortType(e.target.value)} className='h-11 px-4 rounded-full border border-rose-300 bg-white font-semibold cursor-pointer'>
               <option value="relevant">Newest</option>
               <option value="low-high">Price: low to high</option>
               <option value="high-low">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>

      <div className='flex flex-col md:flex-row gap-10'>
        {/* Filter Options */}
        <aside className={`md:w-56 shrink-0 flex-col gap-8 ${showFilter ? 'flex' : 'hidden'} md:flex`}>
          {recipients.length > 0 && <FilterGroup title='GIFT FOR' options={recipients} selected={recipient} onToggle={toggle(setRecipient)} names={recipientNames} />}
          {categories.length > 0 && <FilterGroup title='CATEGORY' options={categories} selected={category} onToggle={toggle(setCategory)} />}
          {subCategories.length > 0 && <FilterGroup title='OCCASION' options={subCategories} selected={subCategory} onToggle={toggle(setSubCategory)} />}
          {activeFilters > 0 && (
            <button onClick={()=>{setCategory([]); setSubCategory([]); setRecipient([])}} className='self-start text-sm font-semibold text-berry underline underline-offset-4 cursor-pointer'>Clear all filters</button>
          )}
        </aside>

        {/* Products */}
        <div className='flex-1 min-w-0'>
          {!productsLoading && filterProducts.length === 0 && (
            <div className='rounded-[28px] border border-dashed border-rose-300 bg-white py-16 px-6 text-center flex flex-col items-center gap-3'>
              <Icon name='gift' size={36} className='text-berry' />
              <p className='font-display text-2xl font-semibold'>No gifts match your filters</p>
              <p className='text-mauve text-sm'>Try removing a filter or searching for something else.</p>
            </div>
          )}

          <div className='grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-9'>
            {
              filterProducts.map((item)=>(
                <ProductItem key={item._id} name={item.name} id={item._id} price={item.price} image={item.image} category={item.category} bestseller={item.bestseller} sizePrices={item.sizePrices}/>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Collection
