import React, { useContext } from 'react'
import { ShopContext } from '../Context/ShopContext'

// Short list of a gift's personalisation for the bag and order pages
const CustomSummary = ({ custom, className = '' }) => {

    const { customOptions, products } = useContext(ShopContext)
    if (!custom) return null

    const ribbon = customOptions?.ribbonColors.find(r => r.id === custom.ribbon)
    const wrap = customOptions?.wrapOptions.find(w => w.id === custom.wrap)
    const colour = customOptions?.printColours.find(c => c.id === custom.printColour)
    const flavour = customOptions?.cakeOptions.flavours.find(f => f.id === custom.cakeFlavour)
    const addOns = (custom.addOns || []).map(id => customOptions?.addOns.find(a => a.id === id)?.name || id)
    const date = custom.deliveryDate && new Date(custom.deliveryDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })

    return (
        <div className={`mt-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs text-mauve flex flex-col gap-1 ${className}`}>
            <span className='font-bold text-berry-dark tracking-[0.06em]'>{custom.boxItems ? 'SURPRISE BOX' : custom.cakeFlavour ? 'CAKE DETAILS' : 'PERSONALISED'}</span>
            {flavour && <span>Flavour: <b className='text-ink'>{flavour.name}</b>{custom.eggless ? ' · Eggless' : ''}</span>}
            {custom.cakeMessage && <span>On the cake: <i>“{custom.cakeMessage}”</i></span>}
            {date && <span>Delivery: <b className='text-ink'>{date}</b>{custom.timeSlot ? `, ${custom.timeSlot}` : ''}</span>}
            {custom.printText && <span>Text: <i>“{custom.printText}”</i></span>}
            {colour && <span className='flex items-center gap-1.5'>Colour: <span className='inline-block w-3 h-3 rounded-full border border-rose-300' style={{ background: colour.hex }}></span>{colour.name}</span>}
            {custom.name && <span>For: <b className='text-ink'>{custom.name}</b></span>}
            {custom.message && <span className='italic'>“{custom.message}”</span>}
            {ribbon && <span className='flex items-center gap-1.5'>Ribbon: <span className='inline-block w-3 h-3 rounded-full border border-white' style={{ background: ribbon.hex }}></span>{ribbon.name}</span>}
            {wrap && <span>Wrapping: {wrap.name}</span>}
            {addOns.length > 0 && <span>Add-ons: {addOns.join(', ')}</span>}
            {custom.photos?.length > 0 && (
                <span className='flex flex-col gap-1'>
                    <span>Album: <b className='text-ink'>{custom.photos.length} photos</b>{custom.albumTitle ? ` · “${custom.albumTitle}”` : ''}</span>
                    <span className='flex flex-wrap gap-1'>{custom.photos.slice(0, 8).map(url => <img key={url} src={url} alt='' className='w-7 h-7 rounded object-cover' />)}</span>
                </span>
            )}
            {custom.albumQuotes && <span>Quotes: <i>“{custom.albumQuotes}”</i></span>}
            {custom.boxItems?.length > 0 && (
                <span className='flex flex-col gap-1.5 mt-1'>
                    <span className='font-bold text-ink'>Inside the box:</span>
                    {custom.boxItems.map((item, i) => {
                        const product = products.find(p => p._id === item._id)
                        return (
                            <span key={i} className='flex flex-col'>
                                <span>• {item.name || product?.name || 'Gift'} {item.size ? `(${item.size})` : ''} × {item.quantity}</span>
                                {item.custom && <CustomSummary custom={item.custom} className='ml-3 !mt-1 !bg-white' />}
                            </span>
                        )
                    })}
                </span>
            )}
            {custom.surprise && <span className='font-semibold text-berry-dark'>Surprise delivery — we'll call you, not the recipient</span>}
            {custom.photo && <a href={custom.photo} target='_blank' rel='noreferrer' className='flex items-center gap-2 text-berry'><img src={custom.photo} alt='' className='w-8 h-8 rounded object-cover' />Your photo</a>}
        </div>
    )
}

export default CustomSummary
