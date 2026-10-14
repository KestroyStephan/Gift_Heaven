import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import Title from './Title'
import Icon from './Icons'
import { prettify, recipientNames } from './ProductItem'

const categories = [
    { key: 'ChocolateBucket', tint: 'bg-cream' },
    { key: 'Bouquet', tint: 'bg-blush' },
    { key: 'Cake', tint: 'bg-cream' },
    { key: 'CustomPrint', tint: 'bg-lilac' },
    { key: 'GiftPackage', tint: 'bg-blush' },
    { key: 'GiftHamper', tint: 'bg-sage' },
    { key: 'Jewellery', tint: 'bg-lilac' },
    { key: 'Accessories', tint: 'bg-blush' },
    { key: 'Toys', tint: 'bg-cream' },
    { key: 'Baby', tint: 'bg-blush' },
    { key: 'Teddy', tint: 'bg-cream' },
    { key: 'Plants', tint: 'bg-sage' },
    { key: 'HomeDecor', tint: 'bg-lilac' },
    { key: 'KitchenDining', tint: 'bg-cream' },
    { key: 'ArtSupplies', tint: 'bg-cream' },
    { key: 'Stationery', tint: 'bg-sage' },
    { key: 'Games', tint: 'bg-lilac' },
    { key: 'LoveFocil', tint: 'bg-blush' },
    { key: 'Personalised', tint: 'bg-blush' },
    { key: 'Festive', tint: 'bg-sage' },
]

const occasions = [
    { key: 'BirthdayGift', tint: 'bg-cream' },
    { key: 'AnniversaryGift', tint: 'bg-blush' },
    { key: 'WeddingGift', tint: 'bg-[#F7F1EA]' },
    { key: 'HousewarmingGift', tint: 'bg-sage' },
    { key: 'BabyGift', tint: 'bg-cream' },
    { key: 'ValentineGift', tint: 'bg-blush' },
    { key: 'GraduationGift', tint: 'bg-lilac' },
    { key: 'SurpriseGift', tint: 'bg-lilac' },
    { key: 'ThankYouGift', tint: 'bg-sage' },
]

const festivals = [
    { key: 'AvuruduGift', note: 'April' },
    { key: 'PongalGift', note: 'January' },
    { key: 'DiwaliGift', note: 'Oct – Nov' },
    { key: 'EidGift', note: 'Eid al-Fitr & al-Adha' },
    { key: 'ChristmasGift', note: 'December' },
]

const recipientTiles = [
    { key: 'her', text: 'Girlfriends, wives, mothers & sisters', tint: 'bg-blush' },
    { key: 'him', text: 'Boyfriends, husbands, fathers & brothers', tint: 'bg-lilac' },
    { key: 'couples', text: 'Lovers, newlyweds & anniversaries', tint: 'bg-blush' },
    { key: 'kids', text: 'Toys, art kits & party cakes', tint: 'bg-cream' },
    { key: 'teens', text: 'Music, journals, art & tech', tint: 'bg-sage' },
    { key: 'elders', text: 'Grandparents, parents & teachers', tint: 'bg-cream' },
    { key: 'baby', text: 'Newborns & proud parents', tint: 'bg-sage' },
]

// Gifts grouped by who they are for
export const ShopByRecipient = () => {

    const { products } = useContext(ShopContext)

    // Each tile shows a different photo, preferring gifts made just for that person
    const used = new Set()
    const covers = Object.fromEntries(recipientTiles.map(tile => {
        const items = products
            .filter(p => p.recipients?.includes(tile.key))
            .sort((x, y) => x.recipients.length - y.recipients.length || (y.bestseller ? 1 : 0) - (x.bestseller ? 1 : 0))
        const pick = items.find(p => !used.has(p.image?.[0])) || items[0]
        if (pick) used.add(pick.image?.[0])
        return [tile.key, pick?.image?.[0]]
    }))

    return (
        <section className='shell py-16'>
            <div className='flex flex-wrap items-end justify-between gap-4 mb-8'>
                <div>
                    <Title eyebrow='Find the perfect gift' text1='Who is it' text2='for?' />
                    <p className='text-mauve max-w-xl -mt-1'>From little ones to grandparents — and that special someone.</p>
                </div>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4'>
                {recipientTiles.map(tile => {
                    const cover = covers[tile.key]
                    return (
                        <Link key={tile.key} to={`/collection?for=${tile.key}`} className='group flex flex-col gap-3'>
                            <span className={`relative overflow-hidden rounded-[22px] aspect-[4/5] ${tile.tint}`}>
                                {cover && <img src={cover} alt='' className='absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105' />}
                            </span>
                            <span>
                                <span className='block font-display text-[1.45rem] font-semibold leading-tight group-hover:text-berry'>{recipientNames[tile.key]}</span>
                                <span className='block text-xs text-muted mt-0.5'>{tile.text}</span>
                            </span>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}

// Festivals across Sinhala, Tamil, Hindu, Muslim and Christian homes
export const Festivals = () => {

    const { products } = useContext(ShopContext)

    return (
        <section className='shell py-20'>
            <div className='flex flex-wrap items-end justify-between gap-4 mb-8'>
                <div>
                    <Title eyebrow='Celebrate together' text1='Festival' text2='gifts' />
                    <p className='text-mauve max-w-xl -mt-1'>Sweets, lamps and hampers for the festivals we celebrate in Sri Lanka and India.</p>
                </div>
                <Link to='/gift-guide' className='font-bold text-sm text-berry flex items-center gap-1'>Read the gift guide <Icon name='arrow' size={16} /></Link>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4'>
                {festivals.map(festival => {
                    const item = products.find(p => p.subCategory === festival.key)
                    return (
                        <Link key={festival.key} to={`/collection?sub=${festival.key}`} className='group relative overflow-hidden rounded-[22px] aspect-[3/4] bg-ink flex items-end'>
                            {item && <img src={item.image[0]} alt='' className='absolute inset-0 w-full h-full object-cover opacity-80 transition duration-500 group-hover:scale-105' />}
                            <span className='absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent'></span>
                            <span className='relative p-4 text-white'>
                                <span className='block text-[11px] font-bold tracking-[0.14em] text-gold-light uppercase'>{festival.note}</span>
                                <span className='block font-display text-2xl leading-tight mt-1'>{prettify(festival.key)}</span>
                            </span>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}

// Round category chips with a product photo
export const ShopByCategory = () => {

    const { products } = useContext(ShopContext)
    const visible = categories.filter(c => products.some(p => p.category === c.key))
    if (visible.length === 0) return null

    return (
        <section className='shell py-16'>
            <Title text1='Shop by' text2='category' className='mb-8' />
            <div className='grid grid-cols-3 sm:grid-cols-6 gap-x-4 gap-y-8'>
                {visible.map(category => {
                    const cover = products.find(p => p.category === category.key)?.image?.[0]
                    return (
                        <Link key={category.key} to={`/collection?category=${category.key}`} className='group flex flex-col items-center gap-3 text-center'>
                            <span className={`w-full aspect-square rounded-full overflow-hidden ${category.tint} ring-0 group-hover:ring-4 ring-rose-200 transition`}>
                                {cover && <img src={cover} alt='' className='w-full h-full object-cover transition duration-500 group-hover:scale-105' />}
                            </span>
                            <span className='font-semibold text-sm sm:text-[15px] group-hover:text-berry'>{prettify(category.key)}</span>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}

const Occasions = () => {

    const { products } = useContext(ShopContext)

    return (
        <section id='occasions' className='bg-white py-20 scroll-mt-24'>
            <div className='shell'>
                <div className='flex flex-wrap items-end justify-between gap-4 mb-8'>
                    <Title text1='Shop by' text2='occasion' />
                    <Link to='/collection' className='font-bold text-sm text-berry flex items-center gap-1 mb-5'>View all gifts <Icon name='arrow' size={16} /></Link>
                </div>
                <div className='grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8'>
                    {occasions.map(occasion => {
                        const items = products.filter(p => p.subCategory === occasion.key)
                        const cover = items[0]?.image?.[0]
                        return (
                            <Link key={occasion.key} to={`/collection?sub=${occasion.key}`} className='group flex flex-col gap-3'>
                                <span className={`relative overflow-hidden rounded-[22px] aspect-[4/3] ${occasion.tint}`}>
                                    {cover && <img src={cover} alt='' className='absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105' />}
                                </span>
                                <span className='flex items-center justify-between gap-2'>
                                    <span className='font-display text-[1.4rem] sm:text-[1.65rem] font-semibold group-hover:text-berry'>{prettify(occasion.key)}</span>
                                    <span className='text-sm text-muted whitespace-nowrap'>{items.length} {items.length === 1 ? 'gift' : 'gifts'}</span>
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default Occasions
