import React, { useContext, useMemo } from 'react'
import { ShopContext } from '../Context/ShopContext'
import ProductItem from '../Components/ProductItem'
import Icon from '../Components/Icons'

const steps = [
  { title: 'Pick a design', text: 'Choose one of our cake designs below — or send us your own idea in chat.' },
  { title: 'Choose flavour & size', text: 'From rich chocolate to Sri Lankan ribbon cake, 0.5 kg to two tiers. Eggless available.' },
  { title: 'Add your message or photo', text: 'Write the message for the top, or upload a photo for an edible print.' },
  { title: 'Pick the day', text: 'Choose a delivery date and time slot — we bake fresh, so allow 2 days.' },
]

const Cakes = () => {

  const { products, productsLoading, customOptions, openChat } = useContext(ShopContext)
  const cakes = useMemo(() => products.filter(p => p.category === 'Cake'), [products])

  return (
    <div>
      <section className='bg-[#F7E7D7]'>
        <div className='shell grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center py-14'>
          <div className='flex flex-col gap-5'>
            <p className='eyebrow'>Cake studio</p>
            <h1 className='font-display font-semibold text-[2.75rem] sm:text-[4rem] leading-[1.03]'>Cakes made for <span className='italic text-berry'>your moment</span>.</h1>
            <p className='text-lg text-mauve leading-relaxed max-w-xl'>Birthdays, anniversaries, weddings and homecomings — pick a design, then make it yours with the flavour, message, photo and delivery time you want.</p>
            <div className='flex flex-wrap gap-3 mt-1'>
              <a href='#designs' className='btn-primary'>Browse cake designs</a>
              <button onClick={() => openChat('Custom cake design')} className='btn-outline'>Design a custom cake</button>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            {cakes.slice(0, 4).map((cake, i) => (
              <img key={cake._id} src={cake.image[0]} alt={cake.name} className={`w-full aspect-square object-cover rounded-[24px] ${i % 2 ? 'mt-8' : ''}`} />
            ))}
          </div>
        </div>
      </section>

      <section className='shell py-16'>
        <ol className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {steps.map((step, i) => (
            <li key={step.title} className='flex flex-col gap-2'>
              <span className='font-display text-4xl text-gold'>{String(i + 1).padStart(2, '0')}</span>
              <span className='font-bold text-lg'>{step.title}</span>
              <span className='text-mauve leading-relaxed'>{step.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section id='designs' className='shell scroll-mt-28'>
        <h2 className='font-display font-semibold text-[2rem] sm:text-[2.6rem] mb-8'>Cake <span className='italic text-berry'>designs</span></h2>
        {!productsLoading && cakes.length === 0 && <p className='text-mauve'>Cake designs are coming soon — chat with us to order one today.</p>}
        <div className='grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-9'>
          {cakes.map(item => (
            <ProductItem key={item._id} id={item._id} name={item.name} price={item.price} image={item.image} category={item.subCategory} bestseller={item.bestseller} sizePrices={item.sizePrices} brand={item.brand} />
          ))}
        </div>
      </section>

      {customOptions && (
        <section className='shell pt-16'>
          <div className='rounded-[28px] bg-white border border-line p-8 grid md:grid-cols-[1fr_1.4fr] gap-8 items-center'>
            <div>
              <h2 className='font-display text-3xl font-semibold'>Flavours we bake</h2>
              <p className='text-mauve mt-2'>Every design can be made in any flavour. Eggless on request.</p>
            </div>
            <ul className='flex flex-wrap gap-2'>
              {customOptions.cakeOptions.flavours.map(f => (
                <li key={f.id} className='px-4 py-2 rounded-full bg-[#F7E7D7] text-sm font-semibold'>{f.name}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className='shell pt-12'>
        <button onClick={() => openChat('Custom cake design')} className='w-full text-left rounded-[28px] bg-ink text-[#F6E9EE] p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer hover:bg-black'>
          <span>
            <span className='block font-display text-3xl sm:text-4xl text-white'>Have a dream cake in mind?</span>
            <span className='block mt-2 text-[#D9C6CE]'>Send us a photo or sketch — themes, tiers, colours and toppers. We'll design it with you and send a quote.</span>
          </span>
          <span className='btn-primary !bg-white !text-ink shrink-0'><Icon name='mail' size={18} /> Chat with a baker</span>
        </button>
      </section>
    </div>
  )
}

export default Cakes
