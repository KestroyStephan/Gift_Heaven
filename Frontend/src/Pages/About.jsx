import React from 'react'
import { Link } from 'react-router-dom'
import NewsletterBox from '../Components/NewsletterBox'
import Icon from '../Components/Icons'
import { LogoMark } from '../Components/Logo'

const values = [
  { icon: 'gift', title: 'Thoughtfully curated', text: 'Every chocolate bucket, bouquet and keepsake is chosen to feel personal — never generic.' },
  { icon: 'heart', title: 'Hand-packed with care', text: 'Each order is wrapped by hand in our boutique, with a hand-lettered note from you.' },
  { icon: 'truck', title: 'Delivered on time', text: 'Careful local delivery and live order tracking, so the moment lands exactly when it should.' },
]

const About = () => {
  return (
    <div>
      <section className='shell grid lg:grid-cols-2 gap-12 items-center pt-14 pb-20'>
        <div className='flex flex-col gap-6'>
          <p className='eyebrow'>Our story</p>
          <h1 className='font-display font-semibold text-[2.75rem] sm:text-[4rem] leading-[1.04]'>
            Gifts that make someone feel <span className='italic text-berry'>truly seen</span>.
          </h1>
          <p className='text-lg text-mauve leading-relaxed'>
            Surprise Heaven began with a simple belief: the best gifts are the ones chosen with care.
            We curate chocolate hampers, bouquets and keepsakes for birthdays, anniversaries and every
            surprise worth celebrating.
          </p>
          <p className='text-mauve leading-relaxed'>
            Browse online, pay securely or on delivery, and let us handle the wrapping, the note and
            the journey to their door.
          </p>
          <Link to='/collection' className='btn-primary self-start mt-2'>Explore the collection <Icon name='arrow' size={18} /></Link>
        </div>
        <div className='rounded-[32px] bg-blush aspect-[4/3.4] flex flex-col items-center justify-center gap-6 p-10 text-center'>
          <LogoMark size={180} />
          <p className='font-display italic text-3xl text-berry-dark max-w-sm leading-snug'>“Little boxes of big feelings.”</p>
        </div>
      </section>

      <section className='bg-white py-20'>
        <div className='shell'>
          <h2 className='font-display font-semibold text-[2rem] sm:text-[2.6rem] mb-10'>Why choose <span className='italic text-berry'>Surprise Heaven</span></h2>
          <div className='grid md:grid-cols-3 gap-6'>
            {values.map(value => (
              <div key={value.title} className='rounded-[24px] border border-line p-8 flex flex-col gap-4'>
                <span className='w-12 h-12 rounded-full bg-rose-50 text-berry flex items-center justify-center'><Icon name={value.icon} size={22} /></span>
                <h3 className='font-bold text-lg'>{value.title}</h3>
                <p className='text-mauve leading-relaxed'>{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='shell pt-20'>
        <div className='rounded-[28px] bg-gradient-to-br from-berry-dark via-[#9A2459] to-[#5E1238] text-[#F6E9EE] px-8 py-12 sm:px-14 flex flex-col md:flex-row md:items-center justify-between gap-6'>
          <div>
            <p className='eyebrow eyebrow-dark mb-2'>Our mission</p>
            <p className='font-display text-3xl sm:text-4xl text-white leading-tight max-w-2xl'>To make it effortless to celebrate the people you love — beautifully, and on time.</p>
          </div>
          <Link to='/contact' className='btn-primary !bg-white !text-ink hover:!bg-rose-50 shrink-0'>Talk to us</Link>
        </div>
      </section>

      <NewsletterBox />
    </div>
  )
}

export default About
