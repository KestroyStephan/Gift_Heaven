import React, { useContext, useEffect, useState } from 'react';
import {useParams, Link} from 'react-router-dom';
import {ShopContext} from '../Context/ShopContext';
import RelatedProducts from '../Components/RelatedProducts';
import Icon from '../Components/Icons';
import { prettify } from '../Components/ProductItem';
import GiftCustomizer, { emptyCustom, compactCustom, missingChoices } from '../Components/GiftCustomizer';
import { priceOf, available, stockLabel } from '../Context/ShopContext';
import { toast } from 'react-toastify';

const sizeLabels = { S: 'Small', M: 'Medium', L: 'Large' }

const Product = () => {

  const {productId} = useParams();
  const {products,currency, addToCart, productsLoading, extrasOf, customOptions, brandOf} = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('');
  const [size,setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [custom, setCustom] = useState(emptyCustom);

  useEffect(()=>{
    const item = products.find((product)=>product._id === productId)
    if (item) {
      setProductData(item)
      setImage(item.image[0])
      setSize(item.sizes.length === 1 ? item.sizes[0] : '')
      setQuantity(1)
      setCustom(emptyCustom)
    } else {
      setProductData(false)
    }
  },[productId, products])

  if (!productData) {
    return productsLoading ? <div className='min-h-[50vh]'></div> : (
      <div className='py-24 text-center flex flex-col items-center gap-4'>
        <p className='font-display text-4xl font-semibold'>Gift not found</p>
        <p className='text-mauve'>It may have been removed from our collection.</p>
        <Link to='/collection' className='btn-primary mt-2'>Browse gifts</Link>
      </div>
    )
  }

  const maxQty = available(productData)
  const stock = stockLabel(productData)
  const finalCustom = compactCustom(custom)
  const extras = extrasOf(finalCustom)
  const unitPrice = priceOf(productData, size)

  const addGift = async () => {
    if (maxQty <= 0) return toast.error('Sorry, this gift is sold out')
    if (quantity > maxQty) return toast.error(`Only ${maxQty} left`)
    if (!size) return addToCart(productData._id, size)
    const missing = missingChoices(productData, custom, customOptions)
    if (missing) {
      toast.error(missing)
      return document.getElementById('customize-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    await addToCart(productData._id, size, quantity, finalCustom)
    setCustom(emptyCustom)
    setQuantity(1)
  }

  return (
    <div className='pt-6'>

      <nav aria-label='Breadcrumb' className='flex flex-wrap gap-2 text-sm text-muted mb-8'>
        <Link to='/' className='hover:text-berry'>Home</Link><span aria-hidden='true'>/</span>
        <Link to={`/collection?category=${productData.category}`} className='hover:text-berry'>{prettify(productData.category)}</Link><span aria-hidden='true'>/</span>
        <span className='text-ink font-semibold'>{productData.name}</span>
      </nav>

      <div className='grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14'>

        {/* Gallery */}
        <div className='flex flex-col gap-4'>
          <div className='rounded-[28px] overflow-hidden bg-blush aspect-square'>
            <img className='w-full h-full object-cover' src={image} alt={productData.name} />
          </div>
          {productData.image.length > 1 && (
            <div className='grid grid-cols-4 gap-3'>
              {productData.image.map((item,index)=>(
                <button key={index} onClick={()=>setImage(item)} aria-label={`Show photo ${index + 1}`} aria-pressed={item === image}
                  className={`rounded-2xl overflow-hidden aspect-square border-2 cursor-pointer ${item === image ? 'border-ink' : 'border-transparent hover:border-rose-300'}`}>
                  <img src={item} className='w-full h-full object-cover' alt='' />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className='flex flex-col gap-7'>
          <div className='flex flex-col gap-3'>
            {brandOf(productData.brand) && (
              <Link to={`/brand/${productData.brand}`} className='self-start flex items-center gap-2 text-sm font-bold hover:underline underline-offset-4' style={{ color: brandOf(productData.brand).colour }}>
                <Icon name='star' size={15} />{brandOf(productData.brand).name} <span className='font-medium text-muted'>· visit the brand store</span>
              </Link>
            )}
            <p className='eyebrow'>{prettify(productData.category)} · {prettify(productData.subCategory)}</p>
            <h1 className='font-display font-semibold text-[2.6rem] sm:text-[3.4rem] leading-[1.03]'>{productData.name}</h1>
            <p className='text-2xl font-semibold'>{!size && productData.sizePrices ? 'From ' : ''}{currency}{(size ? unitPrice : Math.min(...productData.sizes.map(s => priceOf(productData, s)))).toLocaleString('en-LK')}
              {extras > 0 && <span className='ml-2 text-base font-medium text-mauve'>+ {currency}{extras.toLocaleString('en-LK')} personalisation</span>}
            </p>
            <p className={`flex items-center gap-2 text-sm font-semibold ${!stock ? 'text-violet-800' : stock.tone === 'out' ? 'text-rose-700' : stock.tone === 'low' ? 'text-amber-700' : 'text-emerald-700'}`}>
              <span className='w-2 h-2 rounded-full bg-current'></span>
              {!stock ? 'Made to order for you' : stock.tone === 'in' ? 'In stock — ready to gift' : stock.tone === 'low' ? `Hurry, only ${productData.stock} left` : 'Sold out — check back soon'}
            </p>
          </div>

          <p className='text-mauve leading-relaxed text-[16px] whitespace-pre-line'>{productData.description}</p>

          <fieldset>
            <legend className='font-bold text-sm mb-3'>Size {size && <span className='font-medium text-muted'>— {sizeLabels[size] || size}</span>}</legend>
            <div className='flex flex-wrap gap-2.5'>
              {productData.sizes.map((item)=>(
                <button key={item} onClick={()=>setSize(item)} aria-pressed={item === size}
                  className={`min-w-[5.5rem] min-h-12 py-1.5 px-4 rounded-2xl text-sm font-semibold cursor-pointer ${item === size ? 'border-2 border-berry bg-rose-50 text-berry-dark' : 'border-[1.5px] border-rose-300 bg-white hover:border-ink'}`}>
                  {sizeLabels[item] || item}
                  {productData.sizePrices && <span className='block text-xs font-medium text-muted'>{currency}{priceOf(productData, item).toLocaleString('en-LK')}</span>}
                </button>
              ))}
            </div>
          </fieldset>

          {productData.customization?.box ? (
            <Link to='/build-a-box' className='btn-primary self-start'><Icon name='gift' size={18} /> Start building your box</Link>
          ) : <>
          <GiftCustomizer product={productData} value={custom} onChange={setCustom} />

          <div className='flex flex-wrap gap-3'>
            <div className='flex items-center h-[3.25rem] rounded-full border-[1.5px] border-rose-300 bg-white'>
              <button onClick={()=>setQuantity(q => Math.max(1, q - 1))} aria-label='Decrease quantity' className='w-12 h-full flex items-center justify-center cursor-pointer'><Icon name='minus' size={18} /></button>
              <span aria-live='polite' className='w-8 text-center font-bold'>{quantity}</span>
              <button onClick={()=>setQuantity(q => Math.min(maxQty, q + 1))} disabled={quantity >= maxQty} aria-label='Increase quantity' className='w-12 h-full flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-default'><Icon name='plus' size={18} /></button>
            </div>
            {maxQty <= 0 ? (
              <button disabled className='btn-primary flex-1 min-w-[220px] !bg-stone-400 !cursor-not-allowed'>Sold out</button>
            ) : (
            <button onClick={addGift} className='btn-primary flex-1 min-w-[220px]'>
              <Icon name='bag' size={18} /> Add to bag · {currency}{((unitPrice + extras) * quantity).toLocaleString('en-LK')}
            </button>
            )}
          </div>
          </>}

          <ul className='grid sm:grid-cols-3 gap-4 p-5 bg-white border border-line rounded-[20px] text-sm text-mauve'>
            <li className='flex gap-3 items-start'><Icon name='truck' className='text-berry shrink-0' />Same-day delivery in Colombo</li>
            <li className='flex gap-3 items-start'><Icon name='lock' className='text-berry shrink-0' />Secure payment or cash on delivery</li>
            <li className='flex gap-3 items-start'><Icon name='refresh' className='text-berry shrink-0' />Easy exchange within 7 days</li>
          </ul>

          <div className='border-t border-line'>
            <details className='border-b border-line py-5 group' open>
              <summary className='font-bold cursor-pointer flex justify-between items-center list-none'>Gift note<Icon name='chevron' size={18} className='transition group-open:rotate-90' /></summary>
              <p className='mt-3 text-[15px] text-mauve leading-relaxed'>Use “Make it yours” above to add the recipient's name and a message — we hand-letter it on a card tucked inside the gift, free of charge.</p>
            </details>
            <details className='border-b border-line py-5 group'>
              <summary className='font-bold cursor-pointer flex justify-between items-center list-none'>Delivery &amp; tracking<Icon name='chevron' size={18} className='transition group-open:rotate-90' /></summary>
              <p className='mt-3 text-[15px] text-mauve leading-relaxed'>Follow every step from packing to delivered in My Orders, with email and SMS updates along the way.</p>
            </details>
            <details className='border-b border-line py-5 group'>
              <summary className='font-bold cursor-pointer flex justify-between items-center list-none'>Exchanges<Icon name='chevron' size={18} className='transition group-open:rotate-90' /></summary>
              <p className='mt-3 text-[15px] text-mauve leading-relaxed'>Something not right? Contact us within 7 days of delivery and we'll make it right.</p>
            </details>
          </div>
        </div>
      </div>

      <RelatedProducts category={productData.category} subCategory={productData.subCategory} currentId={productData._id} />
    </div>
  )
}

export default Product
