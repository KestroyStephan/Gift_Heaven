import React from 'react'
import Icon from './Icons'

const steps = [
  { icon: 'gift', title: 'Pick a gift', text: 'Browse by occasion, brand or budget and choose the size that fits.' },
  { icon: 'heart', title: 'Add your note', text: 'Write a message at checkout — we hand-letter it on a card inside the box.' },
  { icon: 'lock', title: 'Pay your way', text: 'Card via Stripe or Razorpay, or simply pay cash on delivery.' },
  { icon: 'truck', title: 'Track to the door', text: 'Follow every step from packing to delivered, with email and SMS updates.' },
]

// "How it works" band
const OurPolicy = () => {
  return (
    <section className='relative overflow-hidden bg-white py-24'>
      <span aria-hidden='true' className='pointer-events-none absolute top-1/2 right-0 translate-x-1/3 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(232,79,147,.14),transparent_70%)] blur-2xl'></span>
      <div className='shell relative'>
        <div className='flex flex-col gap-3 mb-12 sr sr-up'>
          <p className='eyebrow'>How it works</p>
          <h2 className='font-display font-semibold text-ink text-[2.2rem] sm:text-[3rem] leading-[1.02]'>
            From our hands <span className='block italic text-brand'>to theirs.</span>
          </h2>
        </div>
        <ol className='grid sm:grid-cols-2 lg:grid-cols-4 gap-5'>
          {steps.map((step, index) => (
            <li key={step.title} className={`card-lift rounded-[24px] border border-line bg-[#FFF6FA] p-6 flex flex-col gap-3 sr sr-up sr-d${index + 1}`}>
              <span className='flex items-center justify-between'>
                <span className='w-12 h-12 rounded-2xl bg-white border border-rose-200 text-berry flex items-center justify-center shadow-[0_8px_20px_-10px_rgba(232,79,147,.6)]'><Icon name={step.icon} size={22} /></span>
                <span className='font-display text-4xl text-rose-200 font-semibold'>{String(index + 1).padStart(2, '0')}</span>
              </span>
              <span className='font-bold text-lg text-ink mt-2'>{step.title}</span>
              <span className='text-[15px] leading-relaxed text-mauve'>{step.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default OurPolicy
