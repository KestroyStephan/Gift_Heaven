import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency, categories, subCategories } from '../App'
import { toast } from 'react-toastify'
import CustomizationSwitches, { defaultCustomization } from '../components/CustomizationSwitches'
import SizeEditor from '../components/SizeEditor'
import RecipientPicker from '../components/RecipientPicker'

const labelOf = (options, value) => options.find(option => option.value === value)?.label || value

// Modal form for editing an existing product
const EditProduct = ({ product, token, onClose, onSaved }) => {

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
  })
  const [images, setImages] = useState([false, false, false, false])
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const toggleSize = (size) => setForm(prev => ({
    ...prev,
    sizes: prev.sizes.includes(size) ? prev.sizes.filter(item => item !== size) : [...prev.sizes, size]
  }))

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
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={onClose}>
      <form onSubmit={onSubmit} onClick={(e) => e.stopPropagation()} className='bg-white rounded-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col gap-3'>
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-semibold text-gray-800'>Edit product</h3>
          <button type='button' onClick={onClose} className='text-xl cursor-pointer'>×</button>
        </div>

        <div>
          <p className='mb-2 text-sm'>Images <span className='text-gray-400'>(click to replace)</span></p>
          <div className='flex gap-2'>
            {images.map((file, index) => (
              <label key={index} className='cursor-pointer'>
                <img className='w-16 h-16 object-cover border' src={file ? URL.createObjectURL(file) : product.image[index] || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'} alt='' />
                <input type='file' accept='image/*' hidden onChange={(e) => setImages(prev => prev.map((f, i) => i === index ? e.target.files[0] : f))} />
              </label>
            ))}
          </div>
        </div>

        <input value={form.name} onChange={set('name')} className='px-3 py-2' placeholder='Name' required />
        <textarea value={form.description} onChange={set('description')} className='px-3 py-2' rows={3} placeholder='Description' required />

        <div className='grid grid-cols-3 gap-2'>
          <select value={form.category} onChange={set('category')} className='px-3 py-2'>
            {categories.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={form.subCategory} onChange={set('subCategory')} className='px-3 py-2'>
            {subCategories.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <input value={form.price} onChange={set('price')} type='number' min='0' step='0.01' className='px-3 py-2' required />
        </div>

        <SizeEditor sizes={form.sizes} setSizes={(fn) => setForm(prev => ({ ...prev, sizes: typeof fn === 'function' ? fn(prev.sizes) : fn }))}
          sizePrices={form.sizePrices} setSizePrices={(fn) => setForm(prev => ({ ...prev, sizePrices: typeof fn === 'function' ? fn(prev.sizePrices) : fn }))} basePrice={form.price} />

        <RecipientPicker value={form.recipients} onChange={(recipients) => setForm(prev => ({ ...prev, recipients }))} />

        <CustomizationSwitches value={form.customization} onChange={(customization) => setForm(prev => ({ ...prev, customization }))} />

        <label className='flex gap-2 text-sm cursor-pointer'>
          <input type='checkbox' checked={form.bestseller} onChange={() => setForm(prev => ({ ...prev, bestseller: !prev.bestseller }))} />
          Bestseller
        </label>

        <button disabled={saving} className='btn-dark py-3'>{saving ? 'SAVING...' : 'SAVE CHANGES'}</button>
      </form>
    </div>
  )
}

const List = ({token}) => {

  const [list,setList] = useState([])
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')

  const fetchList = async ()=>{
      try {
        const response = await axios.get(backendUrl + '/api/product/list', { params: { limit: 1000 } })

        if (response.data.products){
          setList(response.data.products);
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

  const visible = list.filter(item => item.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <>

      <div className='flex flex-wrap justify-between items-center gap-3 mb-3'>
        <p className='text-xl font-semibold text-gray-800'>All products ({list.length})</p>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search products' className='px-3 py-2 text-sm' />
      </div>
      <div className='flex flex-col gap-2'>
        {/* List table Title */}
        <div className='hidden md:grid grid-cols-[1fr_3fr_1.5fr_1.5fr_1fr_1fr] items-center py-1 px-2 border bg-gray-200 text-sm border-none'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Occasion</b>
          <b>Price</b>
          <b className='text-center'>Action</b>
        </div>

        {/* Product List */}
        {
          visible.map((item)=>(
            <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1.5fr_1.5fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm bg-white' key={item._id}>
              <img className='w-12' src={item.image[0]} alt="" />
              <p>{item.name} {item.bestseller && <span className='ml-1 text-xs bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded'>Bestseller</span>}</p>
              <p className='hidden md:block'>{labelOf(categories, item.category)}</p>
              <p className='hidden md:block'>{labelOf(subCategories, item.subCategory)}</p>
              <p className='hidden md:block'>{currency}{item.price}</p>
              <div className='flex justify-end md:justify-center gap-3'>
                <button onClick={()=>setEditing(item)} className='text-blue-600 cursor-pointer'>Edit</button>
                <button onClick={()=>removeProduct(item._id, item.name)} className='text-red-600 cursor-pointer'>Delete</button>
              </div>

            </div>
          ))
        }
      </div>

      {editing && (
        <EditProduct
          product={editing}
          token={token}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await fetchList() }}
        />
      )}

    </>
  )
}

export default List
