import React, { useState } from 'react'
import axios from 'axios'
import {backendUrl, currency, categories, subCategories} from '../App'
import { Icon, PageHeader, BrandSelect, BrandMark, useBrands } from '../components/ui'
import { toast } from 'react-toastify'
import CustomizationSwitches, { defaultCustomization } from '../components/CustomizationSwitches'
import SizeEditor from '../components/SizeEditor'
import RecipientPicker from '../components/RecipientPicker'

const Add = ({token}) => {

  const [image1,setImage1] = useState(false);
  const [image2,setImage2] = useState(false);
  const [image3,setImage3] = useState(false);
  const [image4,setImage4] = useState(false);

  const [name,setName] = useState("");
  const [description,setDescription] = useState("");
  const [price,setPrice] = useState("");
  const [category,setCategory] = useState(categories[0].value);
  const [subCategory,setSubCategory] = useState(subCategories[0].value);
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [customization, setCustomization] = useState(defaultCustomization);
  const [sizePrices, setSizePrices] = useState({});
  const [recipients, setRecipients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [brand, setBrand] = useState('');
  const [inventory, setInventory] = useState({ trackStock: true, stock: '', lowStock: 5, costPrice: '', sku: '' });
  const setInv = (field) => (e) => setInventory(prev => ({ ...prev, [field]: e.target.value }));
  const [brands] = useBrands();

  
  const onSubmitHandler = async (e)=>{
      e.preventDefault();

      if (!image1 && !image2 && !image3 && !image4) return toast.error('Please upload at least one image')
      if (sizes.length === 0) return toast.error('Please select at least one size')

      setSaving(true)
      try {
        const formData = new FormData()

        formData.append("name",name)
        formData.append("description",description)
        formData.append("price",price)
        formData.append("category",category)
        formData.append("subCategory",subCategory)
        formData.append("bestseller",bestseller)
        formData.append("sizes",JSON.stringify(sizes))
        formData.append("customization",JSON.stringify(customization))
        formData.append("sizePrices",JSON.stringify(sizePrices))
        formData.append("recipients",JSON.stringify(recipients))
        formData.append("brand",brand)
        Object.entries(inventory).forEach(([key, value]) => formData.append(key, value))

        image1 && formData.append("image1",image1)
        image2 && formData.append("image2",image2)
        image3 && formData.append("image3",image3)
        image4 && formData.append("image4",image4)

        const response = await axios.post(backendUrl + "/api/product/add", formData,{headers:{token}})
        
        if (response.data.success) {
          toast.success(response.data.message)
          setName('')
          setDescription('')
          setImage1(false)
          setImage2(false)
          setImage3(false)
          setImage4(false)
          setPrice('')
          setSizes([])
          setSizePrices({})
          setRecipients([])
          setBrand('')
          setInventory({ trackStock: true, stock: '', lowStock: 5, costPrice: '', sku: '' })
          setBestseller(false)
          
        }else{
          toast.error(response.data.message)
        }


      } catch (error) {
        console.log(error)
        toast.error(error.message)
      } finally {
        setSaving(false)
      }
  }




  const images = [[image1, setImage1], [image2, setImage2], [image3, setImage3], [image4, setImage4]]
  const cover = images.find(([file]) => file)?.[0]
  const labelOf = (options, value) => options.find(o => o.value === value)?.label || value

  const Section = ({ step, title, hint, children }) => (
    <section className='card p-6 flex flex-col gap-4'>
      <div className='flex items-start gap-3'>
        <span className='w-7 h-7 rounded-full bg-pink-50 text-berry text-xs font-bold flex items-center justify-center shrink-0'>{step}</span>
        <div>
          <p className='card-title'>{title}</p>
          {hint && <p className='text-xs text-mauve mt-0.5'>{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  )

  return (
    <form onSubmit={onSubmitHandler}>
      <PageHeader title='Add a product' subtitle='New gifts appear in the store as soon as you save them.' />

      <div className='grid xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start'>
        <div className='flex flex-col gap-5 min-w-0'>
          {Section({ step: 1, title: 'Photos', hint: 'Up to 4 images. The first one is the cover photo.', children: (
            <div className='flex flex-wrap gap-3'>
              {images.map(([file, setFile], index) => (
                <label key={index} htmlFor={`image${index + 1}`} className={`w-28 h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 text-xs cursor-pointer overflow-hidden ${file ? 'border-transparent' : 'border-pink-100 hover:border-berry hover:bg-pink-50 text-mauve'}`}>
                  {file ? <img className='w-full h-full object-cover' src={URL.createObjectURL(file)} alt={`Image ${index + 1}`} /> : <><Icon name='image' size={22} />{index === 0 ? 'Cover' : `Image ${index + 1}`}</>}
                  <input onChange={(e) => setFile(e.target.files[0])} type="file" accept="image/*" id={`image${index + 1}`} hidden />
                </label>
              ))}
            </div>
          ) })}

          {Section({ step: 2, title: 'Details', children: (
            <>
              <label className='label'>Product name
                <input onChange={(e)=>setName(e.target.value)} value={name} className='field font-normal' type="text" placeholder='e.g. Red Rose & Ferrero Bouquet' required />
              </label>
              <label className='label'>Description
                <textarea onChange={(e)=>setDescription(e.target.value)} value={description} rows={4} className='field font-normal resize-y' placeholder="What's inside, size, and why it makes a lovely gift" required />
              </label>
              <label className='label'>Brand <span className='font-normal text-xs text-mauve -mt-1'>Customers can shop by brand. Manage the list on the Brands page.</span>
                <BrandSelect brands={brands} value={brand} onChange={setBrand} />
              </label>
              <div className='grid sm:grid-cols-3 gap-4'>
                <label className='label'>Category
                  <select value={category} onChange={(e)=>setCategory(e.target.value)} className='field font-normal'>
                    {categories.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className='label'>Occasion
                  <select value={subCategory} onChange={(e)=>setSubCategory(e.target.value)} className='field font-normal'>
                    {subCategories.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <label className='label'>Price ({currency.trim()})
                  <input onChange={(e)=>setPrice(e.target.value)} value={price} className='field font-normal' type="number" min="0" step="0.01" placeholder='2500' required />
                </label>
              </div>
            </>
          ) })}

          {Section({ step: 3, title: 'Sizes & prices', hint: 'Give bigger sizes their own price, or leave them on the product price.', children: (
            <SizeEditor sizes={sizes} setSizes={setSizes} sizePrices={sizePrices} setSizePrices={setSizePrices} basePrice={price} />
          ) })}

          {Section({ step: 4, title: 'Inventory & cost', hint: 'Stock goes down with every order and back up when an order is cancelled.', children: (
            <>
              <label className='flex items-center gap-2 text-sm cursor-pointer'>
                <input type='checkbox' className='accent-berry' checked={inventory.trackStock} onChange={() => setInventory(prev => ({ ...prev, trackStock: !prev.trackStock }))} />
                Track stock <span className='text-mauve'>(turn off for made-to-order gifts like cakes and prints)</span>
              </label>
              <div className='grid sm:grid-cols-4 gap-4'>
                {inventory.trackStock && <label className='label'>Opening stock<input type='number' min='0' value={inventory.stock} onChange={setInv('stock')} className='field font-normal' placeholder='0' /></label>}
                {inventory.trackStock && <label className='label'>Low stock alert at<input type='number' min='0' value={inventory.lowStock} onChange={setInv('lowStock')} className='field font-normal' /></label>}
                <label className='label'>Cost price ({currency.trim()})<input type='number' min='0' step='0.01' value={inventory.costPrice} onChange={setInv('costPrice')} className='field font-normal' placeholder='What it costs you' /></label>
                <label className='label'>SKU<input value={inventory.sku} onChange={setInv('sku')} maxLength={40} className='field font-normal' placeholder='Optional' /></label>
              </div>
              {Number(price) > 0 && Number(inventory.costPrice) > 0 && <p className='text-xs text-mauve -mt-1'>Profit per sale {currency}{Math.round(price - inventory.costPrice).toLocaleString('en-LK')} · margin <b className='text-ink'>{Math.round(((price - inventory.costPrice) / price) * 100)}%</b></p>}
            </>
          ) })}

          {Section({ step: 5, title: 'Who is it for & personalisation', children: (
            <>
              <RecipientPicker value={recipients} onChange={setRecipients} />
              <CustomizationSwitches value={customization} onChange={setCustomization} />
            </>
          ) })}
        </div>

        {/* Live preview of the store card */}
        <aside className='xl:sticky xl:top-24 flex flex-col gap-4'>
          <div className='card p-5'>
            <p className='table-head mb-3'>Store preview</p>
            <div className='aspect-square rounded-2xl bg-pink-50 overflow-hidden flex items-center justify-center text-berry'>
              {cover ? <img src={URL.createObjectURL(cover)} alt='' className='w-full h-full object-cover' /> : <Icon name='gift' size={40} />}
            </div>
            {brands.find(b => b.slug === brand) && <span className='mt-4 flex items-center gap-2 text-sm font-semibold text-ink'><BrandMark brand={brands.find(b => b.slug === brand)} size='sm' />{brands.find(b => b.slug === brand).name}</span>}
            <p className='text-[11px] font-bold tracking-[0.14em] uppercase text-mauve mt-4'>{labelOf(categories, category)}</p>
            <p className='font-display text-2xl font-semibold text-ink leading-tight mt-1'>{name || 'Product name'}</p>
            <p className='font-bold text-berry mt-1'>{currency}{Number(price || 0).toLocaleString('en-LK')}</p>
            <label className='mt-4 flex items-center gap-2 text-sm cursor-pointer'>
              <input onChange={()=>setBestseller(prev => !prev)} checked={bestseller} type="checkbox" className='accent-berry' />
              Feature as a bestseller
            </label>
          </div>
          <button type='submit' disabled={saving} className='btn-dark py-3.5 w-full flex items-center justify-center gap-2'><Icon name='plus' size={18} strokeWidth={2.2} />{saving ? 'Saving…' : 'Add product'}</button>
        </aside>
      </div>
    </form>
  )
}

export default Add
