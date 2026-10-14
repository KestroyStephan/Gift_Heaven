import React, { useState } from 'react'

const presets = ['S', 'M', 'L', 'XL', '0.5 kg', '1 kg', '2 kg', 'Standard']

// Sizes (any label) with an optional price per size
const SizeEditor = ({ sizes, setSizes, sizePrices, setSizePrices, basePrice }) => {

  const [custom, setCustom] = useState('')

  const toggle = (size) => setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])
  const addCustom = () => {
    const size = custom.trim()
    if (size && !sizes.includes(size)) setSizes(prev => [...prev, size])
    setCustom('')
  }

  const options = [...new Set([...presets, ...sizes])]

  return (
    <div className='w-full flex flex-col gap-3'>
      <p>Sizes</p>
      <div className='flex flex-wrap gap-2'>
        {options.map(size => (
          <button type='button' key={size} onClick={() => toggle(size)} className={`${sizes.includes(size) ? 'bg-pink-100 border-pink-400' : 'bg-slate-100 border-transparent'} border px-3 py-1 rounded-full text-sm cursor-pointer`}>{size}</button>
        ))}
        <span className='flex gap-1'>
          <input value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }} placeholder='Other size, e.g. 12x16 in' className='px-3 py-1 text-sm w-44' />
          <button type='button' onClick={addCustom} className='px-3 py-1 rounded-full border border-gray-300 text-sm cursor-pointer'>Add</button>
        </span>
      </div>

      {sizes.length > 1 && (
        <div className='flex flex-col gap-2'>
          <p className='text-sm'>Price per size <span className='text-gray-400'>(leave empty to use the product price{basePrice ? ` of ${basePrice}` : ''})</span></p>
          <div className='flex flex-wrap gap-3'>
            {sizes.map(size => (
              <label key={size} className='flex items-center gap-2 text-sm'>
                <span className='min-w-12'>{size}</span>
                <input type='number' min='0' step='0.01' value={sizePrices[size] ?? ''} onChange={e => setSizePrices(prev => ({ ...prev, [size]: e.target.value }))} className='w-24 px-2 py-1' />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SizeEditor
