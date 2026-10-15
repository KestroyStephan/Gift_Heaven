import React, { useContext, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../Context/ShopContext'
import Icon from '../Components/Icons'

const channels = [
  { icon: 'phone', title: 'Call or WhatsApp', value: '(+94) 77-554-9857', href: 'tel:+94775549857' },
  { icon: 'mail', title: 'Email', value: 'hello@surpriseheaven.com', href: 'mailto:hello@surpriseheaven.com' },
  { icon: 'pin', title: 'Visit the boutique', value: '6700 Main Road, PillayarKovil Road' },
  { icon: 'clock', title: 'We reply', value: 'Within one working day' },
]

const faqs = [
  { q: 'How do I track my order?', a: 'Log in and open My Orders, then select Track Order to see each step from packing to delivery. We also send email and SMS updates.' },
  { q: 'Which payment methods do you accept?', a: 'Cards through Stripe or Razorpay, and cash on delivery.' },
  { q: 'Can I add a personal note?', a: 'Yes — add a gift message at checkout and we hand-letter it on a card inside the box, free of charge.' },
  { q: 'What is your exchange policy?', a: 'If something is not right, contact us within 7 days of delivery and we will arrange an exchange.' },
]

const emptyForm = { name: '', email: '', phone: '', topic: 'An existing order', orderNumber: '', message: '' }

const Contact = () => {

  const { backendUrl, openChat } = useContext(ShopContext)
  const [form, setForm] = useState(emptyForm)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/contact/send', form)
      if (data.success) {
        setSent(true)
        setForm(emptyForm)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <section className='bg-ink text-[#F6E9EE] pt-16 pb-28'>
        <div className='shell flex flex-col gap-4'>
          <p className='eyebrow eyebrow-dark'>Contact us</p>
          <h1 className='font-display font-semibold text-white text-[2.75rem] sm:text-[4rem] leading-[1.04] max-w-3xl'>
            We'd love to help you plan the <span className='italic text-[#FFB3D4]'>perfect surprise</span>.
          </h1>
          <p className='text-lg text-[#D9C6CE] max-w-2xl leading-relaxed'>Questions about an order, a custom hamper or corporate gifting — send us a message and we'll get back to you.</p>
          <button onClick={() => openChat()} className='btn-primary !bg-white !text-ink self-start mt-2'><Icon name='mail' size={18} /> Start a live chat</button>
        </div>
      </section>

      <div className='shell -mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {channels.map(channel => {
          const Body = channel.href ? 'a' : 'div'
          return (
            <Body key={channel.title} {...(channel.href ? { href: channel.href } : {})} className='bg-white border border-line rounded-[22px] p-6 flex flex-col gap-3 shadow-sm hover:border-rose-300'>
              <span className='w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center text-berry'><Icon name={channel.icon} /></span>
              <span className='font-bold'>{channel.title}</span>
              <span className={`text-[15px] ${channel.href ? 'text-berry' : 'text-mauve'}`}>{channel.value}</span>
            </Body>
          )
        })}
      </div>

      <div className='shell grid lg:grid-cols-[1.6fr_1fr] gap-8 pt-12'>
        <div className='bg-white border border-line rounded-[28px] p-6 sm:p-10'>
          {sent ? (
            <div className='flex flex-col items-start gap-4 py-10'>
              <span className='w-14 h-14 rounded-full bg-sage text-[#2F5A37] flex items-center justify-center'><Icon name='check' size={26} strokeWidth={2.4} /></span>
              <h2 className='font-display text-4xl font-semibold'>Thank you — message sent</h2>
              <p className='text-mauve'>We've emailed you a confirmation and will reply shortly.</p>
              <button onClick={() => setSent(false)} className='btn-outline mt-2'>Send another message</button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className='flex flex-col gap-5'>
              <h2 className='font-display text-4xl font-semibold mb-1'>Send us a message</h2>
              <div className='grid sm:grid-cols-2 gap-4'>
                <label className='flex flex-col gap-2 text-sm font-semibold'>Your name
                  <input value={form.name} onChange={set('name')} autoComplete='name' className='field' required />
                </label>
                <label className='flex flex-col gap-2 text-sm font-semibold'>Email
                  <input value={form.email} onChange={set('email')} type='email' autoComplete='email' className='field' required />
                </label>
                <label className='flex flex-col gap-2 text-sm font-semibold'>Phone <span className='font-medium text-muted -mt-1'>Optional</span>
                  <input value={form.phone} onChange={set('phone')} type='tel' autoComplete='tel' className='field' />
                </label>
                <label className='flex flex-col gap-2 text-sm font-semibold'>Topic
                  <select value={form.topic} onChange={set('topic')} className='field'>
                    <option>An existing order</option>
                    <option>Custom hamper</option>
                    <option>Corporate gifting</option>
                    <option>Delivery question</option>
                    <option>Something else</option>
                  </select>
                </label>
              </div>
              <label className='flex flex-col gap-2 text-sm font-semibold'>Order number <span className='font-medium text-muted -mt-1'>If you have one</span>
                <input value={form.orderNumber} onChange={set('orderNumber')} placeholder='e.g. #F6DEDD23' className='field' />
              </label>
              <label className='flex flex-col gap-2 text-sm font-semibold'>Message
                <textarea value={form.message} onChange={set('message')} rows={5} className='field resize-y' required minLength={5} />
              </label>
              <button type='submit' disabled={sending} className='btn-primary self-start'>{sending ? 'Sending…' : 'Send message'}</button>
            </form>
          )}
        </div>

        <aside id='faq' className='bg-white border border-line rounded-[28px] p-6 sm:p-8 h-fit scroll-mt-28'>
          <h2 className='font-display text-3xl font-semibold mb-3'>Quick answers</h2>
          {faqs.map((faq, index) => (
            <details key={faq.q} className='group border-t border-line py-4' open={index === 0}>
              <summary className='font-bold cursor-pointer list-none flex justify-between items-center gap-4'>
                {faq.q}<Icon name='chevron' size={18} className='shrink-0 transition group-open:rotate-90' />
              </summary>
              <p className='mt-3 text-sm text-mauve leading-relaxed'>{faq.a}</p>
            </details>
          ))}
        </aside>
      </div>
    </div>
  )
}

export default Contact
