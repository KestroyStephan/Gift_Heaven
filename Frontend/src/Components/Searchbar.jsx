import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../Context/ShopContext'
import { useLocation } from 'react-router-dom';
import Icon from './Icons';

const Searchbar = () => {

    const {search,setSearch,showSearch, setShowSearch} = useContext(ShopContext);
    const [visible, setVisible] = useState(false)
    const location = useLocation()

    useEffect(()=>{
        setVisible(location.pathname.includes('collection'))
    },[location])

  return showSearch && visible ? (
    <div className='bg-rose-50 border-b border-line'>
      <div className='shell py-5 flex items-center gap-3'>
        <label className='flex-1 flex items-center gap-3 h-12 px-5 bg-white border border-rose-300 rounded-full'>
            <Icon name='search' size={18} className='text-muted' />
            <span className='sr-only'>Search gifts</span>
            <input autoFocus value={search} onChange={(e)=>setSearch(e.target.value)} className='flex-1 outline-none bg-transparent text-sm' type="search" placeholder='Search chocolate buckets, bouquets, hampers…' />
        </label>
        <button aria-label='Close search' onClick={()=>{setShowSearch(false); setSearch('')}} className='w-11 h-11 rounded-full flex items-center justify-center hover:bg-white cursor-pointer'>
            <Icon name='close' />
        </button>
      </div>
    </div>
  ) : null
}

export default Searchbar
