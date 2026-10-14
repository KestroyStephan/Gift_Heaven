import React from 'react'
import { recipientOptions } from '../App'

// Who the gift suits (shown as "Gift for" filters in the store)
const RecipientPicker = ({ value, onChange }) => (
  <fieldset className='w-full'>
    <legend className='mb-2 text-sm font-semibold text-ink'>Gift for</legend>
    <div className='flex flex-wrap gap-2'>
      {recipientOptions.map(option => {
        const on = value.includes(option.value)
        return (
          <button type='button' key={option.value} onClick={() => onChange(on ? value.filter(v => v !== option.value) : [...value, option.value])}
            className={`px-3 py-1 rounded-full text-sm border cursor-pointer ${on ? 'bg-pink-100 border-pink-400 text-pink-700' : 'bg-white border-line'}`}>{option.label}</button>
        )
      })}
    </div>
  </fieldset>
)

export default RecipientPicker
