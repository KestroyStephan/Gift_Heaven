import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { backendUrl, currency, categories, subCategories } from '../App'
import { toast } from 'react-toastify'
import CustomizationSwitches, { defaultCustomization } from '../components/CustomizationSwitches'
import SizeEditor from '../components/SizeEditor'
import RecipientPicker from '../components/RecipientPicker'
import { Icon, PageHeader, Empty, BrandMark, BrandSelect, useBrands, StockBadge } from '../components/ui'

const labelOf = (options, value) => options.find(option => option.value === value)?.label || value
const PER_PAGE = 20

// Modal form for editing an existing product
const EditProduct = ({ product, token, brands, onClose, onSaved }) => {

  const [form, setForm] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    subCategory: product.subCategory,
    sizes: product.sizes,
    bestseller: !!product.bestseller,
    customization: { ...defaultCustomization, ...(product.customization || {}) },
    sizePrices: product.sizePrices || {},
    recipients: product.recipients || [],
    brand: product.brand || '',
    sku: product.sku || '',
    trackStock: !!product.trackStock,
    lowStock: product.lowStock ?? 5,
    costPrice: product.costPrice ?? '',
  })
  const [images, setImages] = useState([false, false, false, false])
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (form.sizes.length === 0) return toast.error('Please select at least one size')
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('id', product._id)
      formData.append('name', form.name)
      formData.append('description', form.description)
      formData.append('price', form.price)
      formData.append('category', form.category)
      formData.append('subCategory', form.subCategory)
      formData.append('sizes', JSON.stringify(form.sizes))
      formData.append('bestseller', form.bestseller)
      formData.append('customization', JSON.stringify(form.customization))
      formData.append('sizePrices', JSON.stringify(form.sizePrices))
      formData.append('recipients', JSON.stringify(form.recipients))
      formData.append('brand', form.brand)
      for (const key of ['sku', 'trackStock', 'lowStock', 'costPrice']) formData.append(key, form[key])
      images.forEach((file, index) => file && formData.append(`image${index + 1}`, file))

      const { data } = await axios.post(backendUrl + '/api/product/update', formData, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        onSaved()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4' onClick={onClose}>
      <form onSubmit={onSubmit} onClick={(e) => e.stopPropagation()} className='bg-white rounded-3xl p-7 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-4 shadow-2xl'>
        <div className='flex justify-between items-center'>
          <h3 className='font-display text-3xl font-semibold text-ink'>Edit product</h3>
          <button type='button' onClick={onClose} aria-label='Close' className='w-9 h-9 rounded-full hover:bg-pink-50 flex items-center justify-center cursor-pointer'><Icon name='close' /></button>
        </div>

        <div>
          <p className='mb-2 text-sm font-semibold text-ink'>Images <span className='font-normal text-mauve'>(click to replace)</span></p>
          <div className='flex gap-2'>
            {images.map((file, index) => (
              <label key={index} className='cursor-pointer'>
                <img className='w-20 h-20 object-cover rounded-2xl border border-line' src={file ? URL.createObjectURL(file) : product.image[index] || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'} alt='' />
                <input type='file' accept='image/*' hidden onChange={(e) => setImages(prev => prev.map((f, i) => i === index ? e.target.files[0] : f))} />
              </label>
            ))}
          </div>
        </div>

        <label className='label'>Name<input value={form.name} onChange={set('name')} className='field font-normal' required /></label>
        <label className='label'>Description<textarea value={form.description} onChange={set('description')} className='field font-normal' rows={3} required /></label>

        <label className='label'>Brand<BrandSelect brands={brands} value={form.brand} onChange={(brand) => setForm(prev => ({ ...prev, brand }))} /></label>

        <div className='grid sm:grid-cols-3 gap-3'>
          <label className='label'>Category
            <select value={form.category} onChange={set('category')} className='field font-normal'>
              {categories.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className='label'>Occasion
            <select value={form.subCategory} onChange={set('subCategory')} className='field font-normal'>
              {subCategories.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className='label'>Price ({currency.trim()})
            <input value={form.price} onChange={set('price')} type='number' min='0' step='0.01' className='field font-normal' required />
          </label>
        </div>

        <SizeEditor sizes={form.sizes} setSizes={(fn) => setForm(prev => ({ ...prev, sizes: typeof fn === 'function' ? fn(prev.sizes) : fn }))}
          sizePrices={form.sizePrices} setSizePrices={(fn) => setForm(prev => ({ ...prev, sizePrices: typeof fn === 'function' ? fn(prev.sizePrices) : fn }))} basePrice={form.price} />

        <fieldset className='flex flex-col gap-3'>
          <legend className='mb-2 text-sm font-semibold text-ink'>Inventory & cost <span className='font-normal text-mauve'>— change stock on the Inventory page</span></legend>
          <label className='flex items-center gap-2 text-sm cursor-pointer'>
            <input type='checkbox' className='accent-berry' checked={form.trackStock} onChange={() => setForm(prev => ({ ...prev, trackStock: !prev.trackStock }))} />
            Track stock {form.trackStock && <span className='text-mauve'>({product.stock ?? 0} in stock)</span>}
          </label>
          <div className='grid sm:grid-cols-3 gap-3'>
            <label className='label'>Cost price<input type='number' min='0' step='0.01' value={form.costPrice} onChange={set('costPrice')} className='field font-normal' /></label>
            <label className='label'>Low stock alert at<input type='number' min='0' value={form.lowStock} onChange={set('lowStock')} disabled={!form.trackStock} className='field font-normal' /></label>
            <label className='label'>SKU<input value={form.sku} onChange={set('sku')} maxLength={40} className='field font-normal' /></label>
          </div>
        </fieldset>

        <RecipientPicker value={form.recipients} onChange={(recipients) => setForm(prev => ({ ...prev, recipients }))} />

        <CustomizationSwitches value={form.customization} onChange={(customization) => setForm(prev => ({ ...prev, customization }))} />

        <label className='flex gap-2 text-sm cursor-pointer'>
          <input type='checkbox' checked={form.bestseller} onChange={() => setForm(prev => ({ ...prev, bestseller: !prev.bestseller }))} />
          Bestseller
        </label>

        <button disabled={saving} className='btn-dark py-3'>{saving ? 'Saving…' : 'Save changes'}</button>
      </form>
    </div>
  )
}

const priceRange = (item) => {
  const prices = Object.values(item.sizePrices || {}).filter(v => typeof v === 'number')
  const low = prices.length ? Math.min(...prices) : item.price
  const high = prices.length ? Math.max(...prices) : item.price
  const fmt = (n) => `${currency}${Number(n).toLocaleString('en-LK')}`
  return low === high ? fmt(low) : `${fmt(low)} – ${fmt(high)}`
}
const personalised = (item) => Object.values(item.customization || {}).some(Boolean)

const List = ({token}) => {

  const [list,setList] = useState([])
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [brands] = useBrands()
  const brandOf = (slug) => brands.find(b => b.slug === slug)
  const [page, setPage] = useState(1)

  const fetchList = async ()=>{
      try {
        const response = await axios.get(backendUrl + '/api/product/list', { params: { limit: 1000 } })

        if (response.data.products){
          // cost prices are private, so they come from the admin inventory endpoint
          const inv = await axios.post(backendUrl + '/api/product/inventory', {}, { headers: { token } }).catch(() => null)
          const costs = Object.fromEntries((inv?.data?.products || []).map(p => [p._id, p.costPrice]))
          setList(response.data.products.map(p => ({ ...p, costPrice: costs[p._id] ?? 0 })));
        } else{
          toast.error(response.data.message)
        }


      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
  }

  const removeProduct = async (id, name)=>{

    if (!window.confirm(`Remove "${name}" from the store?`)) return

    try {

      const response = await axios.post(backendUrl + '/api/product/remove',{id}, {headers:{token}})
      if(response.data.success){
          toast.success(response.data.message)
          await fetchList();

      }else{
        toast.error(response.data.message)
      }


    }catch(error) {
      console.log(error)
      toast.error(error.message)
    }

  }

  useEffect(()=>{
    fetchList()
  },[])

  const visible = list.filter(item =>
    (!category || item.category === category) &&
    (!brandFilter || (brandFilter === '-' ? !item.brand : item.brand === brandFilter)) &&
    item.name.toLowerCase().includes(query.toLowerCase()))
  const pages = Math.max(1, Math.ceil(visible.length / PER_PAGE))
  const current = Math.min(page, pages)
  const shown = visible.slice((current - 1) * PER_PAGE, current * PER_PAGE)
  const usedCategories = categories.filter(c => list.some(item => item.category === c.value))

  return (
    <>
      <PageHeader title='Products' subtitle={`${list.length} gifts in the catalogue · ${list.filter(i => i.bestseller).length} bestsellers · ${list.filter(personalised).length} personalisable`}>
        <Link to='/add' className='btn-dark px-5 py-2.5 text-sm flex items-center gap-2'><Icon name='plus' size={17} strokeWidth={2.2} />Add product</Link>
      </PageHeader>

      <div className='card overflow-hidden'>
        <div className='flex flex-wrap items-center gap-3 p-4 border-b border-line'>
          <label className='relative flex-1 min-w-[220px]'>
            <Icon name='search' size={17} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-mauve' />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder='Search products by name' aria-label='Search products' className='field !pl-10' />
          </label>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} aria-label='Filter by category' className='field !w-auto'>
            <option value=''>All categories</option>
            {usedCategories.map(c => <option key={c.value} value={c.value}>{c.label} ({list.filter(i => i.category === c.value).length})</option>)}
          </select>
          <select value={brandFilter} onChange={(e) => { setBrandFilter(e.target.value); setPage(1) }} aria-label='Filter by brand' className='field !w-auto'>
            <option value=''>All brands</option>
            {brands.map(b => <option key={b.slug} value={b.slug}>{b.name} ({b.productCount})</option>)}
            <option value='-'>No brand</option>
          </select>
        </div>

        {shown.length === 0 ? <div className='p-6'><Empty icon='search' title='No products found' text='Try another name or category.' /></div> : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-[#FCF8F9] border-b border-line'>
                <tr className='table-head text-left'>
                  <th className='pl-5 pr-3 py-3 font-bold'>Product</th>
                  <th className='px-3 py-3 font-bold'>Brand</th>
                  <th className='px-3 py-3 font-bold'>Category</th>
                  <th className='px-3 py-3 font-bold hidden lg:table-cell'>Occasion</th>
                  <th className='px-3 py-3 font-bold'>Price</th>
                  <th className='px-3 py-3 font-bold'>Stock</th>
                  <th className='px-3 py-3 font-bold hidden md:table-cell'>Tags</th>
                  <th className='pl-3 pr-5 py-3 font-bold text-right'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map(item => (
                  <tr key={item._id} className='border-b border-line last:border-0 hover:bg-[#FCF8F9]'>
                    <td className='pl-5 pr-3 py-3'>
                      <span className='flex items-center gap-3 min-w-[240px]'>
                        <img className='w-12 h-12 rounded-xl object-cover border border-line shrink-0' src={item.image[0]} alt='' loading='lazy' />
                        <span className='min-w-0'>
                          <span className='block font-semibold text-ink leading-snug'>{item.name}</span>
                          <span className='block text-xs text-mauve'>{item.sizes?.length || 0} option{item.sizes?.length === 1 ? '' : 's'}{item.ratingCount > 0 && <> · <span className='text-gold font-bold'>★ {item.ratingAvg.toFixed(1)}</span> ({item.ratingCount})</>}</span>
                        </span>
                      </span>
                    </td>
                    <td className='px-3 py-3 whitespace-nowrap'>
                      {brandOf(item.brand) ? <span className='flex items-center gap-2 font-medium text-ink'><BrandMark brand={brandOf(item.brand)} size='sm' />{brandOf(item.brand).name}</span> : <span className='text-xs text-mauve'>—</span>}
                    </td>
                    <td className='px-3 py-3 whitespace-nowrap'><span className='px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-semibold'>{labelOf(categories, item.category)}</span></td>
                    <td className='px-3 py-3 hidden lg:table-cell whitespace-nowrap'>{labelOf(subCategories, item.subCategory)}</td>
                    <td className='px-3 py-3 font-semibold text-ink whitespace-nowrap'>{priceRange(item)}</td>
                    <td className='px-3 py-3 whitespace-nowrap'><span className='flex items-center gap-2'><StockBadge product={item} />{item.trackStock && <b className='text-ink'>{item.stock}</b>}</span></td>
                    <td className='px-3 py-3 hidden md:table-cell'>
                      <span className='flex flex-wrap gap-1'>
                        {item.bestseller && <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold'><Icon name='star' size={11} />Bestseller</span>}
                        {personalised(item) && <span className='px-2 py-0.5 rounded-full bg-violet-50 text-violet-800 text-[11px] font-bold'>Personalisable</span>}
                      </span>
                    </td>
                    <td className='pl-3 pr-5 py-3'>
                      <span className='flex justify-end gap-1'>
                        <button onClick={() => setEditing(item)} aria-label={`Edit ${item.name}`} title='Edit' className='w-9 h-9 rounded-full text-mauve hover:bg-pink-50 hover:text-berry flex items-center justify-center cursor-pointer'><Icon name='edit' size={17} /></button>
                        <button onClick={() => removeProduct(item._id, item.name)} aria-label={`Delete ${item.name}`} title='Delete' className='w-9 h-9 rounded-full text-mauve hover:bg-rose-50 hover:text-rose-700 flex items-center justify-center cursor-pointer'><Icon name='trash' size={17} /></button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {visible.length > PER_PAGE && (
          <div className='flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-line text-sm'>
            <span>Showing {(current - 1) * PER_PAGE + 1}–{Math.min(current * PER_PAGE, visible.length)} of {visible.length}</span>
            <span className='flex items-center gap-1'>
              <button disabled={current <= 1} onClick={() => setPage(current - 1)} className='btn-ghost px-4 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed'>Previous</button>
              <span className='px-3 py-1.5 font-semibold text-ink'>{current} / {pages}</span>
              <button disabled={current >= pages} onClick={() => setPage(current + 1)} className='btn-ghost px-4 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed'>Next</button>
            </span>
          </div>
        )}
      </div>

      {editing && (
        <EditProduct
          product={editing}
          token={token}
          brands={brands}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await fetchList() }}
        />
      )}

    </>
  )
}

export default List
