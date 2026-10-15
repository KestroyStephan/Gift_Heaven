import React, { useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../Context/ShopContext'
import Icon from './Icons'

export const emptyCustom = {
    name: '', message: '', ribbon: '', wrap: '', addOns: [], photo: '',
    printText: '', printColour: '',
    cakeFlavour: '', eggless: false, cakeMessage: '', deliveryDate: '', timeSlot: '',
    photos: [], albumTitle: '', albumQuotes: '',
}

// True when the customer actually chose something
export const hasCustomization = (custom) => !!compactCustom(custom)

// Drop empty fields before sending to the cart
export const compactCustom = (custom) => {
    if (!custom) return null
    const out = {}
    for (const key of ['name', 'message', 'printText', 'cakeMessage', 'albumTitle', 'albumQuotes']) if (custom[key]?.trim()) out[key] = custom[key].trim()
    if (custom.photos?.length) out.photos = custom.photos
    for (const key of ['ribbon', 'wrap', 'photo', 'printColour', 'cakeFlavour', 'deliveryDate', 'timeSlot']) if (custom[key]) out[key] = custom[key]
    if (custom.addOns?.length) out.addOns = custom.addOns
    if (custom.eggless) out.eggless = true
    return Object.keys(out).length ? out : null
}

// Missing required choices for this product (cakes need flavour + date)
export const missingChoices = (product, custom, options) => {
    const allowed = { ...options?.defaultCustomization, ...(product.customization || {}) }
    if (allowed.album && !custom.photos?.length) return 'Please upload photos for the album'
    if (!allowed.cake) return ''
    if (!custom.cakeFlavour) return 'Please choose a cake flavour'
    if (!custom.deliveryDate) return 'Please choose a delivery date for the cake'
    return ''
}

const Section = ({ title, hint, children }) => (
    <div className='flex flex-col gap-3'>
        <p className='font-bold text-sm'>{title} {hint && <span className='font-medium text-muted'>— {hint}</span>}</p>
        {children}
    </div>
)

const choiceClass = (active) => `text-left rounded-2xl p-3.5 text-sm cursor-pointer ${active ? 'border-2 border-berry bg-rose-50' : 'border-[1.5px] border-rose-300 hover:border-ink'}`

const dayOffset = (days) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
}

// "Make it yours" panel on the product page
const GiftCustomizer = ({ product, value, onChange }) => {

    const { customOptions, currency, backendUrl, token, navigate, openChat } = useContext(ShopContext)
    const [uploading, setUploading] = useState(false)

    if (!customOptions) return null
    const allowed = { ...customOptions.defaultCustomization, ...(product.customization || {}) }
    if (!Object.values(allowed).some(Boolean)) return null

    const cake = customOptions.cakeOptions
    const set = (field, fieldValue) => onChange({ ...value, [field]: fieldValue })
    const toggleAddOn = (id) => set('addOns', value.addOns.includes(id) ? value.addOns.filter(a => a !== id) : [...value.addOns, id])
    const ribbon = customOptions.ribbonColors.find(r => r.id === value.ribbon)
    const printColour = customOptions.printColours.find(c => c.id === value.printColour)

    const uploadPhoto = async (file) => {
        if (!file) return
        if (!token) {
            toast.info('Please log in to upload a photo')
            return navigate(`/login?redirect=/product/${product._id}`)
        }
        if (file.size > 5 * 1024 * 1024) return toast.error('Please choose a photo under 5 MB')
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('photo', file)
            const { data } = await axios.post(backendUrl + '/api/product/upload-photo', formData, { headers: { token } })
            if (data.success) set('photo', data.url)
            else toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setUploading(false)
        }
    }

    // Several photos for a handmade album
    const uploadAlbum = async (files) => {
        if (!files?.length) return
        if (!token) {
            toast.info('Please log in to upload photos')
            return navigate(`/login?redirect=/product/${product._id}`)
        }
        setUploading(true)
        const uploaded = []
        for (const file of [...files].slice(0, customOptions.limits.albumPhotos - value.photos.length)) {
            if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} is over 5 MB`); continue }
            try {
                const formData = new FormData()
                formData.append('photo', file)
                const { data } = await axios.post(backendUrl + '/api/product/upload-photo', formData, { headers: { token } })
                if (data.success) uploaded.push(data.url)
                else toast.error(data.message)
            } catch (error) {
                toast.error(error.message)
            }
        }
        onChange({ ...value, photos: [...value.photos, ...uploaded] })
        setUploading(false)
    }

    const title = allowed.cake ? 'Design your' : allowed.print ? 'Print your' : 'Make it'
    const titleEm = allowed.cake ? 'cake' : allowed.print ? 'memory' : 'yours'
    const subtitle = allowed.cake
        ? `Choose a flavour, your message and when it should arrive. Cakes need ${cake.leadDays} days' notice.`
        : allowed.print ? 'Upload a photo, add your words and pick a colour — we print it for you.'
            : 'Personalise the card, ribbon and wrapping — all optional.'

    return (
        <section aria-labelledby='customize-title' className='rounded-[24px] border border-rose-200 bg-white p-5 sm:p-6 flex flex-col gap-6'>
            <div className='flex items-start justify-between gap-4'>
                <div>
                    <h2 id='customize-title' className='font-display text-3xl font-semibold'>{title} <span className='italic text-berry'>{titleEm}</span></h2>
                    <p className='text-sm text-mauve mt-1'>{subtitle}</p>
                </div>
                <Icon name='gift' size={28} className='text-berry shrink-0' />
            </div>

            {/* ---------- Cake ---------- */}
            {allowed.cake && (
                <>
                    <Section title='Flavour' hint='required'>
                        <div role='radiogroup' aria-label='Cake flavour' className='grid grid-cols-2 sm:grid-cols-3 gap-2.5'>
                            {cake.flavours.map(f => (
                                <button key={f.id} type='button' role='radio' aria-checked={value.cakeFlavour === f.id} onClick={() => set('cakeFlavour', f.id)} className={choiceClass(value.cakeFlavour === f.id)}>
                                    <span className='block font-semibold'>{f.name}</span>
                                    <span className='text-muted'>{f.price ? `+${currency}${f.price.toLocaleString('en-LK')}` : 'Included'}</span>
                                </button>
                            ))}
                        </div>
                    </Section>

                    <div className='grid sm:grid-cols-2 gap-4'>
                        <label className='flex flex-col gap-2 text-sm font-bold'>Delivery date <span className='font-medium text-muted -mt-1'>Required</span>
                            <input type='date' value={value.deliveryDate} min={dayOffset(cake.leadDays)} max={dayOffset(120)} onChange={e => set('deliveryDate', e.target.value)} className='field font-normal' />
                        </label>
                        <label className='flex flex-col gap-2 text-sm font-bold'>Delivery time <span className='font-medium text-muted -mt-1'>Optional</span>
                            <select value={value.timeSlot} onChange={e => set('timeSlot', e.target.value)} className='field font-normal'>
                                <option value=''>Any time</option>
                                {cake.timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                            </select>
                        </label>
                    </div>

                    <div className='grid sm:grid-cols-[1fr_15rem] gap-5 items-start'>
                        <div className='flex flex-col gap-4'>
                            <label className='flex flex-col gap-2 text-sm font-bold'>Message on the cake
                                <input value={value.cakeMessage} onChange={e => set('cakeMessage', e.target.value)} maxLength={cake.messageLimit} placeholder='Happy 30th Nimal!' className='field font-normal' />
                            </label>
                            <label className='flex items-center gap-3 rounded-2xl px-4 py-3 text-sm cursor-pointer border-[1.5px] border-rose-300'>
                                <input type='checkbox' className='w-4 h-4 accent-berry' checked={value.eggless} onChange={() => set('eggless', !value.eggless)} />
                                <span className='flex-1 font-semibold'>{cake.eggless.name}</span>
                                <span className='text-muted'>+{currency}{cake.eggless.price.toLocaleString('en-LK')}</span>
                            </label>
                        </div>
                        {/* Cake top preview */}
                        <div aria-label='Cake preview' className='aspect-square rounded-full bg-[#F7E7D7] border-[10px] border-[#F2D3D9] flex flex-col items-center justify-center text-center p-5 overflow-hidden relative'>
                            {value.photo && <img src={value.photo} alt='' className='absolute inset-0 w-full h-full object-cover opacity-80' />}
                            <span className={`relative font-display italic text-xl leading-tight break-words ${value.photo ? 'text-white drop-shadow' : 'text-berry-dark'}`}>{value.cakeMessage || 'Your message'}</span>
                        </div>
                    </div>
                </>
            )}

            {/* ---------- Printing ---------- */}
            {allowed.print && (
                <>
                    <label className='flex flex-col gap-2 text-sm font-bold'>Text to print <span className='font-medium text-muted -mt-1'>Optional — a name, date or short quote</span>
                        <input value={value.printText} onChange={e => set('printText', e.target.value)} maxLength={customOptions.limits.printText} placeholder='Best Amma Ever · 2026' className='field font-normal' />
                    </label>
                    <Section title='Product colour' hint={printColour?.name}>
                        <div role='radiogroup' aria-label='Product colour' className='flex flex-wrap gap-3'>
                            {customOptions.printColours.map(c => (
                                <button key={c.id} type='button' role='radio' aria-checked={value.printColour === c.id} aria-label={c.name} title={c.name}
                                    onClick={() => set('printColour', value.printColour === c.id ? '' : c.id)}
                                    className={`w-11 h-11 rounded-full border-2 cursor-pointer ${value.printColour === c.id ? 'border-ink ring-2 ring-offset-2 ring-ink' : 'border-white shadow-[0_0_0_1px_#E4C9D0]'}`}
                                    style={{ background: c.hex }} />
                            ))}
                        </div>
                    </Section>
                </>
            )}

            {/* ---------- Handmade photo album ---------- */}
            {allowed.album && (
                <>
                    <label className='flex flex-col gap-2 text-sm font-bold'>Cover title <span className='font-medium text-muted -mt-1'>Optional</span>
                        <input value={value.albumTitle} onChange={e => set('albumTitle', e.target.value)} maxLength={customOptions.limits.albumTitle} placeholder='Our Little Forever' className='field font-normal' />
                    </label>
                    <label className='flex flex-col gap-2 text-sm font-bold'>Love quotes to paper-cut on the pages
                        <textarea rows={3} value={value.albumQuotes} onChange={e => set('albumQuotes', e.target.value)} maxLength={customOptions.limits.albumQuotes} placeholder='You are my today and all of my tomorrows…' className='field font-normal resize-y' />
                    </label>
                    <Section title='Your photos' hint={`${value.photos.length} uploaded · we print and hand-decorate each page`}>
                        <div className='flex flex-wrap gap-2'>
                            {value.photos.map((url, i) => (
                                <div key={url} className='relative'>
                                    <img src={url} alt={`Album photo ${i + 1}`} className='w-20 h-20 rounded-xl object-cover border border-line' />
                                    <button type='button' aria-label={`Remove photo ${i + 1}`} onClick={() => set('photos', value.photos.filter(p => p !== url))}
                                        className='absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-white flex items-center justify-center cursor-pointer'><Icon name='close' size={12} /></button>
                                </div>
                            ))}
                            <label className={`w-20 h-20 rounded-xl border border-dashed border-rose-300 flex flex-col items-center justify-center text-xs text-muted ${uploading ? 'opacity-60' : 'cursor-pointer hover:bg-rose-50'}`}>
                                {uploading ? <span className='w-5 h-5 border-2 border-rose-200 border-t-berry rounded-full animate-spin'></span> : <><Icon name='plus' />Add</>}
                                <input type='file' accept='image/*' multiple className='sr-only' disabled={uploading} onChange={e => { uploadAlbum(e.target.files); e.target.value = '' }} />
                            </label>
                        </div>
                    </Section>
                </>
            )}

            {/* ---------- Engraving ---------- */}
            {allowed.engrave && !allowed.print && (
                <label className='flex flex-col gap-2 text-sm font-bold'>Text to engrave or emboss <span className='font-medium text-muted -mt-1'>Optional — initials, a name or a date (free)</span>
                    <input value={value.printText} onChange={e => set('printText', e.target.value)} maxLength={customOptions.limits.printText} placeholder='A & K · 14.02.2026' className='field font-normal' />
                </label>
            )}

            {/* ---------- Photo ---------- */}
            {allowed.photo && (
                <Section title={allowed.cake ? 'Photo for the edible print' : 'Your photo'} hint={allowed.cake ? `+${currency}${cake.photoPrint.price.toLocaleString('en-LK')}` : allowed.print ? 'printed on the product' : 'printed on the gift'}>
                    <div className='flex items-center gap-4'>
                        {value.photo
                            ? <img src={value.photo} alt='Your uploaded photo' className='w-20 h-20 rounded-2xl object-cover border border-line' />
                            : <span className='w-20 h-20 rounded-2xl bg-shell border border-dashed border-rose-300 flex items-center justify-center text-muted'><Icon name='plus' /></span>}
                        <div className='flex flex-col gap-1.5'>
                            <label className='btn-outline !h-11 !px-5 text-sm self-start'>
                                {uploading ? 'Uploading…' : value.photo ? 'Change photo' : 'Upload photo'}
                                <input type='file' accept='image/*' className='sr-only' disabled={uploading} onChange={e => uploadPhoto(e.target.files[0])} />
                            </label>
                            {value.photo && <button type='button' onClick={() => set('photo', '')} className='text-xs text-muted underline self-start cursor-pointer'>Remove photo</button>}
                            <span className='text-xs text-muted'>JPG or PNG, up to 5 MB. Clear, well-lit photos print best.</span>
                        </div>
                    </div>
                </Section>
            )}

            {/* ---------- Card ---------- */}
            {(allowed.name || allowed.message) && (
                <div className='grid sm:grid-cols-[1fr_15rem] gap-5 items-start'>
                    <div className='flex flex-col gap-4'>
                        {allowed.name && (
                            <label className='flex flex-col gap-2 text-sm font-bold'>{allowed.cake ? 'Name on the gift card' : "Recipient's name"}
                                <input value={value.name} onChange={e => set('name', e.target.value)} maxLength={customOptions.limits.name} placeholder='e.g. Amaya' className='field font-normal' />
                            </label>
                        )}
                        {allowed.message && (
                            <label className='flex flex-col gap-2 text-sm font-bold'>{allowed.print ? 'Message for the gift card' : 'Message for the card'}
                                <textarea value={value.message} onChange={e => set('message', e.target.value)} maxLength={customOptions.limits.message} rows={3} placeholder='Happy birthday! Love you always…' className='field font-normal resize-y' />
                                <span className='text-xs font-medium text-muted text-right'>{value.message.length}/{customOptions.limits.message}</span>
                            </label>
                        )}
                    </div>

                    {allowed.message && (
                        <div aria-label='Card preview' className='relative rounded-2xl bg-shell border border-line p-5 min-h-[11rem] flex flex-col justify-center text-center overflow-hidden'>
                            <span className='absolute left-0 right-0 top-6 h-2' style={{ background: ribbon?.hex || '#E84F93' }}></span>
                            <span className='text-[11px] font-bold tracking-[0.16em] text-muted mt-6'>CARD PREVIEW</span>
                            <p className='font-display italic text-2xl text-berry-dark mt-2 break-words'>{value.name ? `Dear ${value.name},` : 'Dear …,'}</p>
                            <p className='font-display italic text-lg text-ink leading-snug mt-1 break-words'>{value.message || 'Your message appears here.'}</p>
                        </div>
                    )}
                </div>
            )}

            {allowed.ribbon && (
                <Section title='Ribbon colour' hint={ribbon?.name}>
                    <div role='radiogroup' aria-label='Ribbon colour' className='flex flex-wrap gap-3'>
                        {customOptions.ribbonColors.map(r => (
                            <button key={r.id} type='button' role='radio' aria-checked={value.ribbon === r.id} aria-label={r.name} title={r.name}
                                onClick={() => set('ribbon', value.ribbon === r.id ? '' : r.id)}
                                className={`w-11 h-11 rounded-full border-2 cursor-pointer ${value.ribbon === r.id ? 'border-ink ring-2 ring-offset-2 ring-ink' : 'border-white shadow-[0_0_0_1px_#E4C9D0]'}`}
                                style={{ background: r.hex }} />
                        ))}
                    </div>
                </Section>
            )}

            {allowed.wrap && (
                <Section title='Wrapping'>
                    <div role='radiogroup' aria-label='Wrapping' className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                        {customOptions.wrapOptions.map(w => (
                            <button key={w.id} type='button' role='radio' aria-checked={value.wrap === w.id} onClick={() => set('wrap', value.wrap === w.id ? '' : w.id)} className={choiceClass(value.wrap === w.id)}>
                                <span className='block font-semibold'>{w.name}</span>
                                <span className='text-muted'>{w.price ? `+${currency}${w.price.toLocaleString('en-LK')}` : 'Free'}</span>
                            </button>
                        ))}
                    </div>
                </Section>
            )}

            {allowed.addOns && (
                <Section title='Add something extra'>
                    <div className='grid sm:grid-cols-2 gap-2.5'>
                        {customOptions.addOns.map(a => (
                            <label key={a.id} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm cursor-pointer ${value.addOns.includes(a.id) ? 'border-2 border-berry bg-rose-50' : 'border-[1.5px] border-rose-300 hover:border-ink'}`}>
                                <input type='checkbox' className='w-4 h-4 accent-berry' checked={value.addOns.includes(a.id)} onChange={() => toggleAddOn(a.id)} />
                                <span className='flex-1 font-semibold'>{a.name}</span>
                                <span className='text-muted'>+{currency}{a.price.toLocaleString('en-LK')}</span>
                            </label>
                        ))}
                    </div>
                </Section>
            )}

            <button type='button' onClick={() => openChat(allowed.cake ? 'Custom cake design' : allowed.print ? 'Photo printing' : 'Custom gift')} className='flex items-center gap-3 rounded-2xl bg-shell px-4 py-3 text-sm text-left cursor-pointer hover:bg-rose-50'>
                <Icon name='mail' className='text-berry shrink-0' />
                <span><b>Want something completely unique?</b> <span className='text-mauve'>Chat with our designers — send reference photos and we'll create it with you.</span></span>
            </button>
        </section>
    )
}

export default GiftCustomizer
