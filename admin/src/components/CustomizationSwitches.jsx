import React from 'react'

export const customizationFields = [
  { key: 'name', label: "Recipient's name" },
  { key: 'message', label: 'Card message' },
  { key: 'ribbon', label: 'Ribbon colour' },
  { key: 'wrap', label: 'Wrapping style' },
  { key: 'addOns', label: 'Paid add-ons' },
  { key: 'photo', label: 'Customer photo upload' },
  { key: 'print', label: 'Print text & product colour' },
  { key: 'cake', label: 'Cake options (flavour, date…)' },
  { key: 'engrave', label: 'Engraving text' },
  { key: 'album', label: 'Photo album (many photos + quotes)' },
  { key: 'box', label: 'Surprise box (gifts inside)' },
]

export const defaultCustomization = { name: true, message: true, ribbon: true, wrap: true, addOns: true, photo: false, print: false, cake: false, engrave: false, album: false, box: false }

// Which personalisation options customers see for a product
const CustomizationSwitches = ({ value, onChange }) => (
  <fieldset className='w-full'>
    <legend className='mb-2'>Customer personalisation</legend>
    <div className='flex flex-wrap gap-2'>
      {customizationFields.map(field => (
        <label key={field.key} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer border ${value[field.key] ? 'bg-pink-100 border-pink-400 text-pink-700' : 'bg-white border-gray-300'}`}>
          <input type='checkbox' className='accent-berry' checked={!!value[field.key]} onChange={() => onChange({ ...value, [field.key]: !value[field.key] })} />
          {field.label}
        </label>
      ))}
    </div>
  </fieldset>
)

export default CustomizationSwitches
