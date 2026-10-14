import React from 'react'

const steps = [
  { title: 'Pick a gift', text: 'Browse by occasion or category and choose the size that fits.' },
  { title: 'Add your note', text: 'Write a message at checkout — we hand-letter it on a card inside the box.' },
  { title: 'Pay your way', text: 'Card via Stripe or Razorpay, or simply pay cash on delivery.' },
  { title: 'Track to the door', text: 'Follow every step from packing to delivered, with email and SMS updates.' },
]

// "How it works" band
const OurPolicy = () => {
  return (
    <section className='bg-ink text-[#F6E9EE] py-20'>
      <div className='shell'>
        <h2 className='font-display font-semibold text-white text-[2rem] sm:text-[2.6rem] leading-tight mb-10'>
          From our hands <span className='italic text-[#F2B8C9]'>to theirs</span>
        </h2>
        <ol className='grid sm:grid-cols-2 lg:grid-cols-4 gap-8'>
          {steps.map((step, index) => (
            <li key={step.title} className='border-t border-white/15 pt-6 flex flex-col gap-3'>
              <span className='font-display text-4xl text-gold-light'>{String(index + 1).padStart(2, '0')}</span>
              <span className='font-bold text-lg text-white'>{step.title}</span>
              <span className='text-[15px] leading-relaxed text-[#D9C6CE]'>{step.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default OurPolicy
