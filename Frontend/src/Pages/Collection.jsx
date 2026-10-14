import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { departments, budgets } from '../Components/Mall'
import { fromPrice } from '../Context/ShopContext'
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

  const {products ,search, showSearch, productsLoading, brands} = useContext(ShopContext);
  const [searchParams] = useSearchParams()
  const [showFilter, setShowFilter] = useState(false);
  const [category,setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [recipient, setRecipient] = useState([]);
  const [brand, setBrand] = useState([]);
  const [budget, setBudget] = useState(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [fourStar, setFourStar] = useState(false);
  const [sortType, setSortType] = useState('relevant')

  // Links like /collection?sub=BirthdayGift preselect a filter
  useEffect(() => {
    const sub = searchParams.get('sub')
    const cat = searchParams.get('category')
    const forWho = searchParams.get('for')
    const dept = departments.find(d => d.slug === searchParams.get('dept'))
    const min = Number(searchParams.get('min')) || 0, max = Number(searchParams.get('max')) || 0
    setSubCategory(sub ? [sub] : [])
    setCategory(dept ? dept.categories : cat ? cat.split(',') : [])
    setRecipient(forWho ? [forWho] : [])
    setBrand(searchParams.get('brand') ? [searchParams.get('brand')] : [])
    setBudget(min || max ? { min, max } : null)
  }, [searchParams])

  // Filter options come from the products that actually exist
  const categories = useMemo(() => [...new Set(products.map(item => item.category))].sort(), [products])
  const subCategories = useMemo(() => [...new Set(products.map(item => item.subCategory))].sort(), [products])
  const brandOptions = useMemo(() => brands.filter(b => products.some(p => p.brand === b.slug)), [brands, products])
  const brandNames = Object.fromEntries(brands.map(b => [b.slug, b.name]))
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

    if (brand.length > 0) {
      productsCopy = productsCopy.filter(item => brand.includes(item.brand))
    }

    if (fourStar) {
      productsCopy = productsCopy.filter(item => item.ratingAvg >= 4)
    }

    if (inStockOnly) {
      productsCopy = productsCopy.filter(item => !item.trackStock || item.stock > 0)
    }

    if (budget) {
      productsCopy = productsCopy.filter(item => { const price = fromPrice(item); return (!budget.min || price >= budget.min) && (!budget.max || price < budget.max) })
    }

    if (sortType === 'rating') productsCopy.sort((a,b)=>(b.ratingAvg - a.ratingAvg) || (b.ratingCount - a.ratingCount))
    if (sortType === 'low-high') productsCopy.sort((a,b)=>(a.price - b.price))
    if (sortType === 'high-low') productsCopy.sort((a,b)=>(b.price - a.price))

    return productsCopy
  }, [products, search, showSearch, category, subCategory, recipient, brand, budget, inStockOnly, fourStar, sortType])

  const activeFilters = category.length + subCategory.length + recipient.length + brand.length + (budget ? 1 : 0)
  const department = departments.find(d => d.slug === searchParams.get('dept'))
  const budgetLabel = budget && (budgets.find(b => (b.min || 0) === budget.min && (b.max || 0) === budget.max)?.label || `${budget.min ? `From Rs. ${budget.min.toLocaleString('en-LK')}` : ''} ${budget.max ? `under Rs. ${budget.max.toLocaleString('en-LK')}` : ''}`)

  return (
    <div className='pt-10 pb-4'>
      <div className='flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 mb-8'>
        <div>
          {department ? <Title as='h1' eyebrow='Department' text1={department.name.split(' ')[0]} text2={department.name.split(' ').slice(1).join(' ')} /> : budget ? <Title as='h1' eyebrow={budgetLabel} text1='Gifts by' text2='budget' /> : <Title as='h1' eyebrow='Shop' text1={'All'} text2={'gifts'} />}
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
               <option value="rating">Top rated</option>
               <option value="low-high">Price: low to high</option>
               <option value="high-low">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>

      <div className='flex flex-col md:flex-row gap-10'>
        {/* Filter Options */}
        <aside className={`md:w-56 shrink-0 flex-col gap-8 ${showFilter ? 'flex' : 'hidden'} md:flex`}>
          <label className='flex items-center gap-3 text-[15px] text-ink font-semibold cursor-pointer'>
            <input type='checkbox' className='w-4 h-4 accent-berry' checked={inStockOnly} onChange={() => setInStockOnly(v => !v)} />
            Hide sold-out gifts
          </label>
          <label className='flex items-center gap-3 text-[15px] text-ink font-semibold cursor-pointer -mt-4'>
            <input type='checkbox' className='w-4 h-4 accent-berry' checked={fourStar} onChange={() => setFourStar(v => !v)} />
            Rated 4★ & up
          </label>
          {recipients.length > 0 && <FilterGroup title='GIFT FOR' options={recipients} selected={recipient} onToggle={toggle(setRecipient)} names={recipientNames} />}
          {budget && (
            <p className='flex items-center justify-between gap-2 text-sm bg-rose-50 rounded-2xl px-4 py-3'><span><b>Budget:</b> {budgetLabel}</span><button onClick={() => setBudget(null)} aria-label='Remove budget filter' className='cursor-pointer text-berry'><Icon name='close' size={16} /></button></p>
          )}
          {brandOptions.length > 0 && <FilterGroup title='BRAND' options={brandOptions.map(b => b.slug)} selected={brand} onToggle={toggle(setBrand)} names={brandNames} />}
          {categories.length > 0 && <FilterGroup title='CATEGORY' options={categories} selected={category} onToggle={toggle(setCategory)} />}
          {subCategories.length > 0 && <FilterGroup title='OCCASION' options={subCategories} selected={subCategory} onToggle={toggle(setSubCategory)} />}
          {activeFilters > 0 && (
            <button onClick={()=>{setCategory([]); setSubCategory([]); setRecipient([]); setBrand([]); setBudget(null)}} className='self-start text-sm font-semibold text-berry underline underline-offset-4 cursor-pointer'>Clear all filters</button>
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
                <ProductItem key={item._id} name={item.name} id={item._id} price={item.price} image={item.image} category={item.category} bestseller={item.bestseller} sizePrices={item.sizePrices} brand={item.brand}/>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Collection
