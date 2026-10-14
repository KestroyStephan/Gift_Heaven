import React, { useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import {backendUrl, categories, subCategories} from '../App'
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

  
  const onSubmitHandler = async (e)=>{
      e.preventDefault();

      if (!image1 && !image2 && !image3 && !image4) return toast.error('Please upload at least one image')
      if (sizes.length === 0) return toast.error('Please select at least one size')

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
          setBestseller(false)
          
        }else{
          toast.error(response.data.message)
        }


      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
  }




  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3' action="">
      <div>
        <p className='mb-2'>Upload Image</p>

        <div className='flex gap-2'>

          <label htmlFor="image1">
            <img className='w-20' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
            <input onChange={(e)=>setImage1(e.target.files[0])} type="file" accept="image/*" id='image1' hidden/>
          </label>

          <label htmlFor="image2">
            <img className='w-20' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
            <input onChange={(e)=>setImage2(e.target.files[0])} type="file" accept="image/*" id='image2' hidden/>
          </label>

          <label htmlFor="image3">
            <img className='w-20' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
            <input onChange={(e)=>setImage3(e.target.files[0])} type="file" accept="image/*" id='image3' hidden/>
          </label>

          <label htmlFor="image4">
            <img className='w-20' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
            <input onChange={(e)=>setImage4(e.target.files[0])} type="file" accept="image/*" id='image4' hidden/>
          </label>

        </div>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product name</p>
        <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type here' required />
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product Description</p>
        <textarea onChange={(e)=>setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2' type="text" placeholder='Type content here' required />
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

        <div>
          <p className='mb-2'>Product category</p>
          <select value={category} onChange={(e)=>setCategory(e.target.value)} className='w-full px-3 py-2'>
            {categories.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        <div>
          <p className='mb-2'>Sub category</p>
          <select value={subCategory} onChange={(e)=>setSubCategory(e.target.value)} className='w-full px-3 py-2'>
            {subCategories.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        <div>
          <p className='mb-2'>Product Price</p>
          <input onChange={(e)=>setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type="number" min="0" step="0.01" placeholder='2500' required />
        </div>

      </div>

      <SizeEditor sizes={sizes} setSizes={setSizes} sizePrices={sizePrices} setSizePrices={setSizePrices} basePrice={price} />

      <RecipientPicker value={recipients} onChange={setRecipients} />

      <CustomizationSwitches value={customization} onChange={setCustomization} />

      <div className='flex gap-2 mt-2'>
        <input onChange={()=>setBestseller(prev => !prev)} checked={bestseller} type="checkbox" id='bestseller' />
        <label className='cursor-pointer' htmlFor="bestseller">Add to bestseller</label>
      </div>

      <button type='submit' className='btn-dark px-10 py-3 mt-4'>Add product</button>
      
    </form>
  )
}

export default Add
