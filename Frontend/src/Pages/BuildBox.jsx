import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext, priceOf } from '../Context/ShopContext'
import { prettify } from '../Components/ProductItem'
import Icon from '../Components/Icons'

const BOX_PRODUCT = 'Build-Your-Own Surprise Box'
const ALBUM_PRODUCT = 'Handmade Memory Photo Album'

// Gift types customers most often pack in a box
const quickFilters = ['All', 'ChocolateBucket', 'Beauty', 'Accessories', 'BagsWallets', 'Jewellery', 'Fragrances', 'ArtSupplies', 'Games', 'Teddy', 'Toys', 'KitchenDining', 'Tech']

const emptyDraft = { style: 'Luxe Heart Box', items: [], cake: null, album: null, name: '', message: '', ribbon: 'berry', deliveryDate: '', timeSlot: '', surprise: true }

const readDraft = () => {
    try { return { ...emptyDraft, ...(JSON.parse(localStorage.getItem('boxDraft')) || {}) } } catch { return emptyDraft }
}

const dayOffset = (days) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
}

const Step = ({ number, title, hint, children }) => (
    <section className='bg-white border border-line rounded-[28px] p-5 sm:p-7 flex flex-col gap-5'>
        <div className='flex items-start gap-4'>
            <span className='w-10 h-10 shrink-0 rounded-full bg-berry text-white font-bold flex items-center justify-center'>{number}</span>
            <div>
                <h2 className='font-display text-3xl font-semibold leading-tight'>{title}</h2>
                {hint && <p className='text-sm text-mauve mt-1'>{hint}</p>}
            </div>
        </div>
        {children}
    </section>
)

// Build-your-own surprise box: choose a box, fill it with gifts, add a cake and a handmade album
const BuildBox = () => {

    const { products, productsLoading, customOptions, currency, addToCart, token, backendUrl, navigate } = useContext(ShopContext)
    const [draft, setDraft] = useState(readDraft)
    const [query, setQuery] = useState('')
    const [filter, setFilter] = useState('All')
    const [sizes, setSizes] = useState({})
    const [uploading, setUploading] = useState(false)

    useEffect(() => { localStorage.setItem('boxDraft', JSON.stringify(draft)) }, [draft])
    const set = (patch) => setDraft(prev => ({ ...prev, ...patch }))

    const boxProduct = products.find(p => p.name === BOX_PRODUCT)
    const albumProduct = products.find(p => p.name === ALBUM_PRODUCT)
    const cakes = products.filter(p => p.category === 'Cake')
    const byId = (id) => products.find(p => p._id === id)
    const money = (n) => `${currency}${Number(n).toLocaleString('en-LK')}`

    const capacity = customOptions?.boxStyles?.[draft.style] || 0
    const giftCount = draft.items.reduce((n, i) => n + i.quantity, 0)
    const leadDays = draft.album ? (customOptions?.albumLeadDays || 3) : (customOptions?.boxLeadDays || 2)
    const minDate = dayOffset(leadDays)

    // Gifts that can go inside (no cakes, boxes or albums — those have their own steps)
    const giftChoices = useMemo(() => products.filter(p => {
        const c = p.customization || {}
        if (p.category === 'Cake' || c.box || c.album || c.cake) return false
        if (filter !== 'All' && p.category !== filter) return false
        if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false
        return true
    }), [products, filter, query])

    // ---------- gifts
    const addGift = (product) => {
        const size = sizes[product._id] || product.sizes[0]
        if (giftCount >= capacity) return toast.info(`The ${draft.style} is full — choose a bigger box or remove a gift`)
        const existing = draft.items.find(i => i._id === product._id && i.size === size)
        set({ items: existing
            ? draft.items.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i)
            : [...draft.items, { _id: product._id, size, quantity: 1 }] })
    }
    const changeQty = (index, delta) => {
        const items = draft.items.map((item, i) => i === index ? { ...item, quantity: item.quantity + delta } : item).filter(i => i.quantity > 0)
        if (delta > 0 && giftCount >= capacity) return toast.info('The box is full')
        set({ items })
    }

    // ---------- cake
    const chooseCake = (cake) => set({ cake: { _id: cake._id, size: cake.sizes[0], custom: { cakeFlavour: 'chocolate', eggless: false, cakeMessage: draft.name ? `Happy Birthday ${draft.name}` : 'Happy Birthday' } } })
    const setCake = (patch) => set({ cake: { ...draft.cake, ...patch } })
    const setCakeCustom = (patch) => set({ cake: { ...draft.cake, custom: { ...draft.cake.custom, ...patch } } })

    // ---------- album
    const startAlbum = () => albumProduct && set({ album: { _id: albumProduct._id, size: albumProduct.sizes[0], custom: { photos: [], albumTitle: '', albumQuotes: '' } } })
    const setAlbumCustom = (patch) => set({ album: { ...draft.album, custom: { ...draft.album.custom, ...patch } } })
    const albumLimit = draft.album ? parseInt(draft.album.size) || 40 : 0

    const uploadAlbumPhotos = async (files) => {
        if (!files?.length) return
        if (!token) {
            toast.info('Please log in to upload your photos — your box is saved')
            return navigate('/login?redirect=/build-a-box')
        }
        const room = albumLimit - draft.album.custom.photos.length
        const chosen = [...files].slice(0, Math.max(0, room))
        if (chosen.length < files.length) toast.info(`This album holds ${albumLimit} photos`)
        setUploading(true)
        const uploaded = []
        for (const file of chosen) {
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
        setDraft(prev => ({ ...prev, album: { ...prev.album, custom: { ...prev.album.custom, photos: [...prev.album.custom.photos, ...uploaded] } } }))
        setUploading(false)
    }

    // ---------- totals
    const lineTotal = (line) => {
        const product = byId(line._id)
        if (!product) return 0
        const cake = customOptions?.cakeOptions
        const extras = line.custom && cake
            ? (cake.flavours.find(f => f.id === line.custom.cakeFlavour)?.price || 0) + (line.custom.eggless ? cake.eggless.price : 0)
            : 0
        return (priceOf(product, line.size) + extras) * (line.quantity || 1)
    }
    const boxPrice = boxProduct ? priceOf(boxProduct, draft.style) : 0
    const giftsTotal = draft.items.reduce((sum, line) => sum + lineTotal(line), 0)
    const cakeTotal = draft.cake ? lineTotal(draft.cake) : 0
    const albumTotal = draft.album ? lineTotal(draft.album) : 0
    const total = boxPrice + giftsTotal + cakeTotal + albumTotal

    const problems = []
    if (giftCount === 0) problems.push('Add at least one gift to the box')
    if (giftCount > capacity) problems.push(`The ${draft.style} holds ${capacity} gifts`)
    if (draft.album && draft.album.custom.photos.length === 0) problems.push('Upload photos for the album')
    if (!draft.deliveryDate) problems.push('Choose a delivery date')
    else if (draft.deliveryDate < minDate) problems.push(`Choose a date from ${minDate}`)

    const addBoxToBag = async () => {
        if (!boxProduct) return
        if (problems.length) return toast.error(problems[0])
        const boxItems = [...draft.items]
        if (draft.cake) boxItems.push({ ...draft.cake, quantity: 1 })
        if (draft.album) boxItems.push({ ...draft.album, quantity: 1 })
        const custom = {
            name: draft.name.trim() || undefined, message: draft.message.trim() || undefined, ribbon: draft.ribbon,
            deliveryDate: draft.deliveryDate, timeSlot: draft.timeSlot || undefined, surprise: draft.surprise || undefined, boxItems,
        }
        await addToCart(boxProduct._id, draft.style, 1, custom)
        setDraft(emptyDraft)
        localStorage.removeItem('boxDraft')
        navigate('/cart')
    }

    if (productsLoading || !customOptions) return <div className='min-h-[60vh]'></div>
    if (!boxProduct) return <p className='shell py-24 text-center text-mauve'>Surprise boxes are coming soon.</p>

    return (
        <div>
            <section className='bg-blush'>
                <div className='shell py-12 flex flex-col gap-4 max-w-4xl'>
                    <p className='eyebrow'>Build a surprise box</p>
                    <h1 className='font-display font-semibold text-[2.6rem] sm:text-[3.8rem] leading-[1.03]'>Pack every little thing they love into <span className='italic text-berry'>one box</span>.</h1>
                    <p className='text-lg text-mauve leading-relaxed'>Choose a box, fill it with gifts from our shop, add a birthday cake and a handmade photo album — we wrap it all and deliver it together on the day you choose.</p>
                </div>
            </section>

            <div className='shell grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start pt-10'>
                <div className='flex flex-col gap-6 min-w-0'>

                    {/* 1. Box */}
                    <Step number='1' title='Choose your box' hint='The cake travels alongside, so it never counts towards the space.'>
                        <div role='radiogroup' aria-label='Box style' className='grid sm:grid-cols-3 gap-3'>
                            {boxProduct.sizes.map((style, i) => (
                                <button key={style} type='button' role='radio' aria-checked={draft.style === style} onClick={() => set({ style })}
                                    className={`text-left rounded-2xl overflow-hidden cursor-pointer ${draft.style === style ? 'ring-2 ring-berry' : 'border border-rose-300 hover:border-ink'}`}>
                                    <img src={boxProduct.image[i % boxProduct.image.length]} alt='' className='w-full aspect-[4/3] object-cover' />
                                    <span className='block p-3'>
                                        <span className='block font-bold'>{style}</span>
                                        <span className='block text-sm text-mauve'>Holds {customOptions.boxStyles[style]} gifts · {money(priceOf(boxProduct, style))}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </Step>

                    {/* 2. Gifts */}
                    <Step number='2' title='Fill it with gifts' hint={`${giftCount} of ${capacity} spaces used`}>
                        <div className='h-2 rounded-full bg-rose-100 overflow-hidden'>
                            <div className={`h-full ${giftCount > capacity ? 'bg-red-600' : 'bg-berry'}`} style={{ width: `${Math.min(100, (giftCount / capacity) * 100)}%` }}></div>
                        </div>
                        <label className='flex items-center gap-3 h-12 px-4 rounded-full border border-rose-300 bg-white'>
                            <Icon name='search' size={18} className='text-muted' />
                            <span className='sr-only'>Search gifts</span>
                            <input value={query} onChange={e => setQuery(e.target.value)} placeholder='Search umbrella, lipstick, chess, chocolates…' className='flex-1 outline-none bg-transparent text-sm' />
                        </label>
                        <div className='flex gap-2 overflow-x-auto pb-1'>
                            {quickFilters.map(key => (
                                <button key={key} type='button' onClick={() => setFilter(key)}
                                    className={`shrink-0 px-3.5 py-2 rounded-full text-sm font-semibold cursor-pointer ${filter === key ? 'bg-ink text-white' : 'bg-rose-50 text-berry-dark hover:bg-rose-100'}`}>
                                    {key === 'All' ? 'All gifts' : prettify(key)}
                                </button>
                            ))}
                        </div>
                        <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1'>
                            {giftChoices.map(p => {
                                const size = sizes[p._id] || p.sizes[0]
                                return (
                                    <div key={p._id} className='rounded-2xl border border-line overflow-hidden flex flex-col'>
                                        <img src={p.image[0]} alt={p.name} loading='lazy' className='w-full aspect-square object-cover' />
                                        <div className='p-3 flex flex-col gap-2 flex-1'>
                                            <p className='text-sm font-bold leading-snug'>{p.name}</p>
                                            {p.sizes.length > 1 && (
                                                <label className='text-xs'>
                                                    <span className='sr-only'>Size for {p.name}</span>
                                                    <select value={size} onChange={e => setSizes(prev => ({ ...prev, [p._id]: e.target.value }))} className='w-full h-9 px-2 rounded-lg border border-rose-300 bg-white'>
                                                        {p.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </label>
                                            )}
                                            <div className='flex items-center justify-between mt-auto'>
                                                <span className='text-sm font-semibold'>{money(priceOf(p, size))}</span>
                                                <button type='button' onClick={() => addGift(p)} aria-label={`Add ${p.name} to the box`} className='w-10 h-10 rounded-full bg-berry text-white flex items-center justify-center cursor-pointer hover:bg-berry-dark'><Icon name='plus' size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            {giftChoices.length === 0 && <p className='col-span-full text-sm text-mauve py-6 text-center'>No gifts match — try another search.</p>}
                        </div>
                    </Step>

                    {/* 3. Cake */}
                    <Step number='3' title='Add a birthday cake' hint='Optional — baked fresh and delivered with the box.'>
                        {!draft.cake ? (
                            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                                {cakes.map(cake => (
                                    <button key={cake._id} type='button' onClick={() => chooseCake(cake)} className='text-left rounded-2xl border border-line overflow-hidden hover:border-berry cursor-pointer'>
                                        <img src={cake.image[0]} alt='' className='w-full aspect-square object-cover' />
                                        <span className='block p-3 text-sm'><b className='block'>{cake.name}</b>from {money(Math.min(...cake.sizes.map(s => priceOf(cake, s))))}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (() => {
                            const cake = byId(draft.cake._id)
                            return (
                                <div className='flex flex-col gap-4'>
                                    <div className='flex items-center gap-4'>
                                        <img src={cake?.image[0]} alt='' className='w-20 h-20 rounded-2xl object-cover' />
                                        <div className='flex-1'>
                                            <p className='font-bold'>{cake?.name}</p>
                                            <button type='button' onClick={() => set({ cake: null })} className='text-sm text-berry underline cursor-pointer'>Remove cake</button>
                                        </div>
                                    </div>
                                    <div className='grid sm:grid-cols-2 gap-3'>
                                        <label className='text-sm font-bold flex flex-col gap-1.5'>Size
                                            <select value={draft.cake.size} onChange={e => setCake({ size: e.target.value })} className='field font-normal'>
                                                {cake?.sizes.map(s => <option key={s} value={s}>{s} — {money(priceOf(cake, s))}</option>)}
                                            </select>
                                        </label>
                                        <label className='text-sm font-bold flex flex-col gap-1.5'>Flavour
                                            <select value={draft.cake.custom.cakeFlavour} onChange={e => setCakeCustom({ cakeFlavour: e.target.value })} className='field font-normal'>
                                                {customOptions.cakeOptions.flavours.map(f => <option key={f.id} value={f.id}>{f.name}{f.price ? ` (+${money(f.price)})` : ''}</option>)}
                                            </select>
                                        </label>
                                        <label className='text-sm font-bold flex flex-col gap-1.5 sm:col-span-2'>Message on the cake
                                            <input value={draft.cake.custom.cakeMessage} maxLength={customOptions.cakeOptions.messageLimit} onChange={e => setCakeCustom({ cakeMessage: e.target.value })} className='field font-normal' />
                                        </label>
                                        <label className='flex items-center gap-3 text-sm cursor-pointer'>
                                            <input type='checkbox' className='w-4 h-4 accent-berry' checked={draft.cake.custom.eggless} onChange={() => setCakeCustom({ eggless: !draft.cake.custom.eggless })} />
                                            Eggless (+{money(customOptions.cakeOptions.eggless.price)})
                                        </label>
                                    </div>
                                </div>
                            )
                        })()}
                    </Step>

                    {/* 4. Album */}
                    {albumProduct && (
                        <Step number='4' title='Handmade memory album' hint='Optional — we print your photos and decorate each page by hand with paper-cut love quotes.'>
                            {!draft.album ? (
                                <button type='button' onClick={startAlbum} className='flex items-center gap-4 text-left rounded-2xl border border-dashed border-rose-300 p-4 hover:bg-rose-50 cursor-pointer'>
                                    <img src={albumProduct.image[0]} alt='' className='w-20 h-20 rounded-2xl object-cover' />
                                    <span><b className='block'>Add a handmade photo album</b><span className='text-sm text-mauve'>from {money(priceOf(albumProduct, albumProduct.sizes[0]))} · needs {customOptions.albumLeadDays} days</span></span>
                                </button>
                            ) : (
                                <div className='flex flex-col gap-4'>
                                    <div className='grid sm:grid-cols-2 gap-3'>
                                        <label className='text-sm font-bold flex flex-col gap-1.5'>Album size
                                            <select value={draft.album.size} onChange={e => set({ album: { ...draft.album, size: e.target.value } })} className='field font-normal'>
                                                {albumProduct.sizes.map(s => <option key={s} value={s}>{s} — {money(priceOf(albumProduct, s))}</option>)}
                                            </select>
                                        </label>
                                        <label className='text-sm font-bold flex flex-col gap-1.5'>Cover title
                                            <input value={draft.album.custom.albumTitle} maxLength={customOptions.limits.albumTitle} onChange={e => setAlbumCustom({ albumTitle: e.target.value })} placeholder='Our Little Forever' className='field font-normal' />
                                        </label>
                                    </div>
                                    <label className='text-sm font-bold flex flex-col gap-1.5'>Love quotes to paper-cut on the pages
                                        <textarea rows={3} value={draft.album.custom.albumQuotes} maxLength={customOptions.limits.albumQuotes} onChange={e => setAlbumCustom({ albumQuotes: e.target.value })} placeholder='You are my today and all of my tomorrows · Forever yours…' className='field font-normal resize-y' />
                                    </label>
                                    <div>
                                        <p className='text-sm font-bold mb-2'>Your photos <span className='font-medium text-muted'>— {draft.album.custom.photos.length} of {albumLimit}</span></p>
                                        <div className='flex flex-wrap gap-2'>
                                            {draft.album.custom.photos.map((url, i) => (
                                                <div key={url} className='relative'>
                                                    <img src={url} alt={`Album photo ${i + 1}`} className='w-20 h-20 rounded-xl object-cover border border-line' />
                                                    <button type='button' aria-label={`Remove photo ${i + 1}`} onClick={() => setAlbumCustom({ photos: draft.album.custom.photos.filter(p => p !== url) })}
                                                        className='absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-white flex items-center justify-center cursor-pointer'><Icon name='close' size={12} /></button>
                                                </div>
                                            ))}
                                            {draft.album.custom.photos.length < albumLimit && (
                                                <label className={`w-20 h-20 rounded-xl border border-dashed border-rose-300 flex flex-col items-center justify-center text-xs text-muted ${uploading ? 'opacity-60' : 'cursor-pointer hover:bg-rose-50'}`}>
                                                    {uploading ? <span className='w-5 h-5 border-2 border-rose-200 border-t-berry rounded-full animate-spin'></span> : <><Icon name='plus' />Add</>}
                                                    <input type='file' accept='image/*' multiple className='sr-only' disabled={uploading} onChange={e => { uploadAlbumPhotos(e.target.files); e.target.value = '' }} />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                    <button type='button' onClick={() => set({ album: null })} className='self-start text-sm text-berry underline cursor-pointer'>Remove album</button>
                                </div>
                            )}
                        </Step>
                    )}

                    {/* 5. Card & delivery */}
                    <Step number={albumProduct ? '5' : '4'} title='Card & delivery' hint='We hand-letter your card and deliver everything together.'>
                        <div className='grid sm:grid-cols-2 gap-4'>
                            <label className='text-sm font-bold flex flex-col gap-1.5'>Recipient's name
                                <input value={draft.name} maxLength={customOptions.limits.name} onChange={e => set({ name: e.target.value })} placeholder='e.g. Amaya' className='field font-normal' />
                            </label>
                            <div className='text-sm font-bold flex flex-col gap-1.5'>Ribbon colour
                                <div role='radiogroup' aria-label='Ribbon colour' className='flex flex-wrap gap-2'>
                                    {customOptions.ribbonColors.map(r => (
                                        <button key={r.id} type='button' role='radio' aria-checked={draft.ribbon === r.id} aria-label={r.name} title={r.name} onClick={() => set({ ribbon: r.id })}
                                            className={`w-10 h-10 rounded-full border-2 cursor-pointer ${draft.ribbon === r.id ? 'border-ink ring-2 ring-offset-2 ring-ink' : 'border-white shadow-[0_0_0_1px_#E4C9D0]'}`} style={{ background: r.hex }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <label className='text-sm font-bold flex flex-col gap-1.5'>Message for the card
                            <textarea rows={3} value={draft.message} maxLength={customOptions.limits.message} onChange={e => set({ message: e.target.value })} placeholder='Happy birthday my love! Every day with you is a gift…' className='field font-normal resize-y' />
                        </label>
                        <div className='grid sm:grid-cols-2 gap-4'>
                            <label className='text-sm font-bold flex flex-col gap-1.5'>Delivery date
                                <input type='date' value={draft.deliveryDate} min={minDate} max={dayOffset(120)} onChange={e => set({ deliveryDate: e.target.value })} className='field font-normal' />
                                <span className='text-xs font-medium text-muted'>Earliest: {minDate}{draft.album ? ' (handmade album)' : ''}</span>
                            </label>
                            <label className='text-sm font-bold flex flex-col gap-1.5'>Delivery time
                                <select value={draft.timeSlot} onChange={e => set({ timeSlot: e.target.value })} className='field font-normal'>
                                    <option value=''>Any time</option>
                                    {customOptions.cakeOptions.timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                                </select>
                            </label>
                        </div>
                        <label className='flex items-start gap-3 rounded-2xl bg-shell p-4 text-sm cursor-pointer'>
                            <input type='checkbox' className='w-4 h-4 mt-0.5 accent-berry' checked={draft.surprise} onChange={() => set({ surprise: !draft.surprise })} />
                            <span><b>Keep it a surprise</b><span className='block text-mauve'>Our courier calls you, not the recipient, to arrange the drop-off.</span></span>
                        </label>
                    </Step>
                </div>

                {/* Summary */}
                <aside className='bg-white border border-line rounded-[28px] p-6 lg:sticky lg:top-28 flex flex-col gap-4'>
                    <h2 className='font-display text-3xl font-semibold'>Your surprise box</h2>
                    <div className='flex justify-between text-sm'><span>{draft.style}</span><span>{money(boxPrice)}</span></div>
                    {draft.items.length === 0 && <p className='text-sm text-mauve'>No gifts yet — add some from step 2.</p>}
                    <ul className='flex flex-col gap-2 max-h-72 overflow-y-auto'>
                        {draft.items.map((line, index) => {
                            const product = byId(line._id)
                            if (!product) return null
                            return (
                                <li key={line._id + line.size} className='flex items-center gap-3 text-sm'>
                                    <img src={product.image[0]} alt='' className='w-10 h-10 rounded-lg object-cover' />
                                    <span className='flex-1 min-w-0'>
                                        <span className='block truncate font-semibold'>{product.name}</span>
                                        <span className='text-xs text-muted'>{product.sizes.length > 1 ? line.size : ''}</span>
                                    </span>
                                    <span className='flex items-center gap-1'>
                                        <button type='button' aria-label='One less' onClick={() => changeQty(index, -1)} className='w-7 h-7 rounded-full border border-rose-300 flex items-center justify-center cursor-pointer'><Icon name='minus' size={12} /></button>
                                        <span className='w-5 text-center'>{line.quantity}</span>
                                        <button type='button' aria-label='One more' onClick={() => changeQty(index, 1)} className='w-7 h-7 rounded-full border border-rose-300 flex items-center justify-center cursor-pointer'><Icon name='plus' size={12} /></button>
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                    {draft.items.length > 0 && <div className='flex justify-between text-sm'><span>Gifts ({giftCount})</span><span>{money(giftsTotal)}</span></div>}
                    {draft.cake && <div className='flex justify-between text-sm'><span>Cake ({draft.cake.size})</span><span>{money(cakeTotal)}</span></div>}
                    {draft.album && <div className='flex justify-between text-sm'><span>Photo album ({draft.album.size})</span><span>{money(albumTotal)}</span></div>}
                    <hr className='border-line' />
                    <div className='flex justify-between text-lg font-bold'><span>Total</span><span>{money(total)}</span></div>
                    <p className='text-xs text-muted -mt-2'>Delivery is added at checkout.</p>
                    {problems.length > 0 && <ul className='text-xs text-berry-dark bg-rose-50 rounded-xl p-3 list-disc pl-5'>{problems.map(p => <li key={p}>{p}</li>)}</ul>}
                    <button type='button' onClick={addBoxToBag} disabled={problems.length > 0} className='btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed'><Icon name='gift' size={18} /> Add surprise box to bag</button>
                    <Link to='/contact' className='text-center text-xs text-mauve underline'>Need help? Chat with us</Link>
                </aside>
            </div>
        </div>
    )
}

export default BuildBox
