import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl } from '../App'
import { Icon, PageHeader, Empty, BrandMark, useBrands } from '../components/ui'

const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:5173'
const blank = { name: '', tagline: '', description: '', colour: '#A3214F', featured: false }

// Add / edit form in a modal
const BrandForm = ({ brand, token, onClose, onSaved }) => {
  const [form, setForm] = useState(brand ? { name: brand.name, tagline: brand.tagline, description: brand.description, colour: brand.colour, featured: brand.featured } : blank)
  const [logo, setLogo] = useState(null)
  const [removeLogo, setRemoveLogo] = useState(false)
  const [saving, setSaving] = useState(false)
  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const preview = { ...form, name: form.name || 'Brand', logo: logo ? URL.createObjectURL(logo) : removeLogo ? '' : brand?.logo }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      if (brand) formData.append('id', brand._id)
      Object.entries(form).forEach(([key, value]) => formData.append(key, value))
      if (logo) formData.append('logo', logo)
      if (removeLogo) formData.append('removeLogo', 'true')
      const { data } = await axios.post(backendUrl + `/api/brand/${brand ? 'update' : 'add'}`, formData, { headers: { token } })
      if (data.success) { toast.success(data.message); onSaved() }
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4' onClick={onClose}>
      <form onSubmit={onSubmit} onClick={(e) => e.stopPropagation()} className='bg-white rounded-3xl p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col gap-4 shadow-2xl'>
        <div className='flex justify-between items-center'>
          <h3 className='font-display text-3xl font-semibold text-ink'>{brand ? 'Edit brand' : 'Add a brand'}</h3>
          <button type='button' onClick={onClose} aria-label='Close' className='w-9 h-9 rounded-full hover:bg-pink-50 flex items-center justify-center cursor-pointer'><Icon name='close' /></button>
        </div>

        <div className='flex items-center gap-4 p-4 rounded-2xl' style={{ background: `${form.colour}14` }}>
          <BrandMark brand={preview} />
          <div className='flex flex-col gap-2 text-sm'>
            <label className='btn-ghost px-4 py-1.5 text-center'>
              {preview.logo ? 'Change logo' : 'Upload logo'}
              <input type='file' accept='image/*' hidden onChange={(e) => { setLogo(e.target.files[0]); setRemoveLogo(false) }} />
            </label>
            {preview.logo && <button type='button' onClick={() => { setLogo(null); setRemoveLogo(true) }} className='text-xs text-mauve hover:text-rose-700 cursor-pointer'>Use the wordmark instead</button>}
          </div>
        </div>

        <label className='label'>Brand name<input value={form.name} onChange={set('name')} className='field font-normal' placeholder='e.g. Cadbury' required /></label>
        <label className='label'>Tagline<input value={form.tagline} onChange={set('tagline')} maxLength={120} className='field font-normal' placeholder='Shown under the brand name' /></label>
        <label className='label'>About the brand<textarea value={form.description} onChange={set('description')} maxLength={1000} rows={3} className='field font-normal resize-y' /></label>
        <div className='flex flex-wrap items-end gap-5'>
          <label className='label'>Brand colour
            <span className='flex items-center gap-2'>
              <input type='color' value={form.colour} onChange={set('colour')} className='w-12 h-10 p-1 cursor-pointer' />
              <span className='font-mono text-xs text-mauve'>{form.colour}</span>
            </span>
          </label>
          <label className='flex items-center gap-2 text-sm cursor-pointer pb-2'>
            <input type='checkbox' className='accent-berry' checked={form.featured} onChange={() => setForm(prev => ({ ...prev, featured: !prev.featured }))} />
            Feature on the home page
          </label>
        </div>

        <button disabled={saving} className='btn-dark py-3 mt-1'>{saving ? 'Saving…' : brand ? 'Save changes' : 'Add brand'}</button>
      </form>
    </div>
  )
}

const Brands = ({ token }) => {
  const [brands, reload] = useBrands()
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')

  const remove = async (brand) => {
    if (!window.confirm(`Remove the brand "${brand.name}"? Its ${brand.productCount} products stay in the store without a brand.`)) return
    const { data } = await axios.post(backendUrl + '/api/brand/remove', { id: brand._id }, { headers: { token } })
    if (data.success) { toast.success(data.message); reload() }
    else toast.error(data.message)
  }

  const visible = brands.filter(b => b.name.toLowerCase().includes(query.toLowerCase()))
  const total = brands.reduce((sum, b) => sum + b.productCount, 0)

  return (
    <>
      <PageHeader title='Brands' subtitle={`${brands.length} brands · ${brands.filter(b => b.featured).length} featured on the home page · ${total} branded products`}>
        <label className='relative'>
          <Icon name='search' size={17} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-mauve' />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search brands' aria-label='Search brands' className='field !pl-10 sm:!w-56' />
        </label>
        <button onClick={() => setEditing('new')} className='btn-dark px-5 py-2.5 text-sm flex items-center gap-2'><Icon name='plus' size={17} strokeWidth={2.2} />Add brand</button>
      </PageHeader>

      {visible.length === 0 ? <Empty icon='tag' title='No brands yet' text='Add the brands you sell so customers can shop by brand.' /> : (
        <div className='grid sm:grid-cols-2 xl:grid-cols-3 gap-5'>
          {visible.map(brand => (
            <div key={brand._id} className='card overflow-hidden flex flex-col'>
              <div className='h-2' style={{ background: brand.colour }}></div>
              <div className='p-5 flex gap-4 flex-1'>
                <BrandMark brand={brand} />
                <div className='flex-1 min-w-0'>
                  <p className='font-bold text-ink text-[17px] flex items-center gap-2'>
                    <span className='truncate'>{brand.name}</span>
                    {brand.featured && <span title='Featured on the home page' className='text-gold'><Icon name='star' size={15} /></span>}
                  </p>
                  <p className='text-sm text-mauve mt-0.5 line-clamp-2'>{brand.tagline || 'No tagline yet'}</p>
                </div>
              </div>
              <div className='flex items-center gap-1 px-5 py-3 border-t border-line text-sm'>
                <span className='flex-1'><b className='text-ink'>{brand.productCount}</b> product{brand.productCount === 1 ? '' : 's'}</span>
                <a href={`${storeUrl}/brand/${brand.slug}`} target='_blank' rel='noreferrer' title='View in store' aria-label={`View ${brand.name} in the store`} className='w-9 h-9 rounded-full text-mauve hover:bg-pink-50 hover:text-berry flex items-center justify-center'><Icon name='store' size={17} /></a>
                <button onClick={() => setEditing(brand)} title='Edit' aria-label={`Edit ${brand.name}`} className='w-9 h-9 rounded-full text-mauve hover:bg-pink-50 hover:text-berry flex items-center justify-center cursor-pointer'><Icon name='edit' size={17} /></button>
                <button onClick={() => remove(brand)} title='Delete' aria-label={`Delete ${brand.name}`} className='w-9 h-9 rounded-full text-mauve hover:bg-rose-50 hover:text-rose-700 flex items-center justify-center cursor-pointer'><Icon name='trash' size={17} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <BrandForm brand={editing === 'new' ? null : editing} token={token} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload() }} />}
    </>
  )
}

export default Brands
