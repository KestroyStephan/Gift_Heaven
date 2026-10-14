import React, { useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext, fromPrice } from '../Context/ShopContext'
import ProductItem from '../Components/ProductItem'
import Icon from '../Components/Icons'

const ideas = [
  { title: 'Photo frame art & canvas', text: 'Weddings, family portraits, first trips — printed as gallery canvas or collage frames.' },
  { title: 'Mugs', text: 'A favourite photo and a few words on a mug they will use every morning.' },
  { title: 'T-shirts', text: 'Birthday crews, family trips, couple tees and team shirts — your photo or design.' },
  { title: 'Cushions & phone cases', text: 'A soft cushion or a slim phone case with a photo and message.' },
  { title: 'Something else?', text: 'Keychains, puzzles, calendars, return gifts for parties — ask us in chat.', chat: true },
]

const CustomStudio = () => {

  const { products, currency, openChat } = useContext(ShopContext)
  const printed = useMemo(() => products.filter(p => p.category === 'CustomPrint' || p.category === 'Personalised' || p.name === 'Custom Photo Phone Case'), [products])

  return (
    <div>
      <section className='bg-lilac/60'>
        <div className='shell py-14 flex flex-col gap-5 max-w-4xl'>
          <p className='eyebrow'>Custom studio</p>
          <h1 className='font-display font-semibold text-[2.75rem] sm:text-[4rem] leading-[1.03]'>Turn your memories into <span className='italic text-berry'>gifts</span>.</h1>
          <p className='text-lg text-mauve leading-relaxed max-w-2xl'>Upload a photo, add your words and we'll print it on frames, canvas, mugs, T-shirts and cushions. For anything bigger — party return gifts, matching family outfits, corporate orders — design it with us in chat.</p>
          <div className='flex flex-wrap gap-3 mt-1'>
            <a href='#printed' className='btn-primary'>Start creating</a>
            <button onClick={() => openChat('Photo frame art')} className='btn-outline'>Chat with a designer</button>
          </div>
        </div>
      </section>

      <section className='shell py-16 grid sm:grid-cols-2 lg:grid-cols-5 gap-4'>
        {ideas.map(idea => {
          const content = (
            <>
              <span className='font-bold text-lg'>{idea.title}</span>
              <span className='text-sm text-mauve leading-relaxed'>{idea.text}</span>
              {idea.chat && <span className='text-sm font-bold text-berry flex items-center gap-1 mt-auto'>Ask us <Icon name='arrow' size={16} /></span>}
            </>
          )
          return idea.chat
            ? <button key={idea.title} onClick={() => openChat('Something else')} className='text-left rounded-[22px] bg-ink/[0.03] border border-dashed border-rose-300 p-5 flex flex-col gap-2 cursor-pointer hover:bg-rose-50'>{content}</button>
            : <div key={idea.title} className='rounded-[22px] bg-white border border-line p-5 flex flex-col gap-2'>{content}</div>
        })}
      </section>

      <section id='printed' className='shell scroll-mt-28'>
        <div className='flex flex-wrap items-end justify-between gap-4 mb-8'>
          <h2 className='font-display font-semibold text-[2rem] sm:text-[2.6rem]'>Choose what to <span className='italic text-berry'>print</span></h2>
          <Link to='/collection?category=CustomPrint' className='font-bold text-sm text-berry flex items-center gap-1'>See all <Icon name='arrow' size={16} /></Link>
        </div>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-9'>
          {printed.map(item => (
            <ProductItem key={item._id} id={item._id} name={item.name} price={item.price} image={item.image} category={item.category} bestseller={item.bestseller} sizePrices={item.sizePrices} brand={item.brand} />
          ))}
        </div>
      </section>

      <section className='shell pt-16'>
        <div className='rounded-[28px] bg-white border border-line p-8 grid md:grid-cols-3 gap-8'>
          {[
            ['Best photo results', 'Use the original photo from your phone, not a screenshot. Good light and faces looking at the camera print best.'],
            ['Want to see it first?', 'Ask in chat for a digital proof before we print — we will adjust crop, text and colours with you.'],
            ['Bulk & event orders', `Birthday return gifts, wedding favours and team T-shirts start from a few pieces. Prices from ${currency}${(printed.length ? Math.min(...printed.map(fromPrice)) : 0).toLocaleString('en-LK')} per item.`],
          ].map(([title, text]) => (
            <div key={title} className='flex flex-col gap-2'>
              <p className='font-bold'>{title}</p>
              <p className='text-sm text-mauve leading-relaxed'>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default CustomStudio
