import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl } from '../App'
import { Icon, PageHeader, Empty } from '../components/ui'

const storeUrl = import.meta.env.VITE_STORE_URL || 'http://localhost:5173'
const when = (ms) => new Date(ms).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })

const Stars = ({ value, size = 15 }) => (
  <span className='inline-flex gap-0.5' role='img' aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map(n => (
      <svg key={n} width={size} height={size} viewBox='0 0 24 24' aria-hidden='true'><path d='M12 2.8l2.83 5.73 6.33.92-4.58 4.46 1.08 6.3L12 17.24l-5.66 2.97 1.08-6.3L2.84 9.45l6.33-.92L12 2.8z' fill={n <= value ? '#E84F93' : '#F9D3E4'} /></svg>
    ))}
  </span>
)

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'reply', label: 'Needs a reply' },
  { id: 'photos', label: 'With photos' },
  { id: 'hidden', label: 'Hidden' },
]

const ReviewRow = ({ review, token, onChanged }) => {
  const [replying, setReplying] = useState(false)
  const [reply, setReply] = useState(review.reply?.text || '')
  const [saving, setSaving] = useState(false)

  const update = async (body) => {
    setSaving(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/review/admin/update', { id: review._id, ...body }, { headers: { token } })
      if (data.success) { toast.success(data.message); setReplying(false); onChanged() } else toast.error(data.message)
    } catch (error) { toast.error(error.message) } finally { setSaving(false) }
  }
  const remove = async () => {
    if (!window.confirm('Delete this review permanently? You can hide it instead.')) return
    const { data } = await axios.post(backendUrl + '/api/review/admin/delete', { id: review._id }, { headers: { token } })
    if (data.success) { toast.success(data.message); onChanged() } else toast.error(data.message)
  }

  return (
    <div className={`card p-5 flex flex-col gap-3 ${review.status === 'hidden' ? 'opacity-70' : ''} ${review.rating <= 3 && !review.reply?.text && review.status === 'published' ? 'border-amber-200' : ''}`}>
      <div className='flex flex-wrap items-start gap-4'>
        <a href={`${storeUrl}/product/${review.productId}#reviews`} target='_blank' rel='noreferrer' className='flex items-center gap-3 min-w-0 flex-1'>
          {review.product.image ? <img src={review.product.image} alt='' className='w-12 h-12 rounded-xl object-cover border border-line' /> : <span className='w-12 h-12 rounded-xl bg-pink-50'></span>}
          <span className='min-w-0'>
            <span className='block font-semibold text-ink truncate hover:text-berry'>{review.product.name}</span>
            <span className='flex flex-wrap items-center gap-x-2 text-xs text-mauve'>
              <Stars value={review.rating} />
              <span><b className='text-ink'>{review.name}</b>{review.verified ? ' · verified purchase' : ''} · {when(review.date)}</span>
            </span>
          </span>
        </a>
        <span className='flex items-center gap-1'>
          {review.status === 'hidden' && <span className='px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-semibold mr-1'>Hidden</span>}
          {review.helpful > 0 && <span className='text-xs text-mauve mr-2'>{review.helpful} found helpful</span>}
          <button onClick={() => setReplying(!replying)} className='btn-ghost px-3 py-1 text-xs'>{review.reply?.text ? 'Edit reply' : 'Reply'}</button>
          <button onClick={() => update({ status: review.status === 'hidden' ? 'published' : 'hidden' })} disabled={saving} className='btn-ghost px-3 py-1 text-xs'>{review.status === 'hidden' ? 'Publish' : 'Hide'}</button>
          <button onClick={remove} aria-label='Delete review' title='Delete' className='w-8 h-8 rounded-full text-mauve hover:bg-rose-50 hover:text-rose-700 flex items-center justify-center cursor-pointer'><Icon name='trash' size={16} /></button>
        </span>
      </div>
      {review.title && <p className='font-bold text-ink'>{review.title}</p>}
      {review.comment && <p className='text-sm text-mauve whitespace-pre-line leading-relaxed'>{review.comment}</p>}
      {review.photos.length > 0 && (
        <div className='flex flex-wrap gap-2'>{review.photos.map((url, i) => <a key={url} href={url} target='_blank' rel='noreferrer'><img src={url} alt={`Customer photo ${i + 1}`} className='w-20 h-20 rounded-xl object-cover border border-line' /></a>)}</div>
      )}
      {review.reply?.text && !replying && (
        <div className='pl-4 border-l-[3px] border-berry text-sm'>
          <p className='font-bold text-berry'>Your reply · {when(review.reply.date)}</p>
          <p className='text-mauve whitespace-pre-line'>{review.reply.text}</p>
        </div>
      )}
      {replying && (
        <form onSubmit={(e) => { e.preventDefault(); update({ reply }) }} className='flex flex-col gap-2'>
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3} maxLength={1000} placeholder={`Thank ${review.name.split(' ')[0]} and answer any concern — your reply is public.`} className='field resize-y' autoFocus />
          <div className='flex gap-2'>
            <button disabled={saving} className='btn-dark px-5 py-2 text-sm'>{saving ? 'Saving…' : 'Post reply'}</button>
            {review.reply?.text && <button type='button' onClick={() => update({ reply: '' })} className='btn-ghost px-4 py-2 text-sm'>Remove reply</button>}
            <button type='button' onClick={() => setReplying(false)} className='px-3 text-sm text-mauve cursor-pointer'>Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}

const Reviews = ({ token }) => {
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('all')
  const [rating, setRating] = useState(0)
  const [query, setQuery] = useState('')

  const load = async () => {
    try {
      const { data } = await axios.post(backendUrl + '/api/review/admin/list', {}, { headers: { token } })
      if (data.success) setData(data); else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
  }
  useEffect(() => { load() }, [token])

  if (!data) return <div className='card h-40 animate-pulse'></div>
  const { reviews, summary } = data
  const matchTab = (r) => tab === 'all' ? true : tab === 'reply' ? r.status === 'published' && r.rating <= 3 && !r.reply?.text : tab === 'photos' ? r.photos.length > 0 : r.status === 'hidden'
  const q = query.toLowerCase()
  const visible = reviews.filter(r => matchTab(r) && (!rating || r.rating === rating) &&
    (!q || [r.product.name, r.name, r.title, r.comment].some(v => String(v || '').toLowerCase().includes(q))))
  const count = (id) => reviews.filter(r => id === 'all' || (id === 'reply' ? r.status === 'published' && r.rating <= 3 && !r.reply?.text : id === 'photos' ? r.photos.length > 0 : r.status === 'hidden')).length

  return (
    <>
      <PageHeader title='Reviews' subtitle='Ratings from customers whose orders were delivered. Reply publicly, or hide anything inappropriate.' />

      <div className='grid grid-cols-2 xl:grid-cols-4 gap-5 mb-6'>
        <div className='card p-5'><p className='text-[13px] font-semibold text-mauve'>Average rating</p><p className='text-[1.6rem] font-bold text-ink mt-1 flex items-center gap-2'>{summary.average ? summary.average.toFixed(1) : '—'} {summary.average > 0 && <Stars value={Math.round(summary.average)} size={17} />}</p></div>
        <div className='card p-5'><p className='text-[13px] font-semibold text-mauve'>Reviews</p><p className='text-[1.6rem] font-bold text-ink mt-1'>{summary.total}</p></div>
        <div className='card p-5'><p className='text-[13px] font-semibold text-mauve'>5-star reviews</p><p className='text-[1.6rem] font-bold text-ink mt-1'>{summary.fiveStar}</p></div>
        <div className='card p-5'><p className='text-[13px] font-semibold text-mauve'>Low ratings to answer</p><p className={`text-[1.6rem] font-bold mt-1 ${summary.needsReply ? 'text-amber-700' : 'text-ink'}`}>{summary.needsReply}</p></div>
      </div>

      <div className='flex flex-wrap items-center gap-3 mb-5'>
        <div className='overflow-x-auto max-w-full'>
          <div className='tabs'>
            {tabs.map(t => <button key={t.id} aria-pressed={tab === t.id} onClick={() => setTab(t.id)} className='tab'>{t.label} <span className='opacity-60'>{count(t.id)}</span></button>)}
          </div>
        </div>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))} aria-label='Filter by stars' className='field !w-auto'>
          <option value={0}>All ratings</option>
          {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} star{n === 1 ? '' : 's'}</option>)}
        </select>
        <label className='relative flex-1 min-w-[200px]'>
          <Icon name='search' size={17} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-mauve' />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search product, customer or words' aria-label='Search reviews' className='field !pl-10' />
        </label>
      </div>

      {visible.length === 0
        ? <Empty icon='star' title={reviews.length ? 'No reviews match' : 'No reviews yet'} text={reviews.length ? 'Try another filter.' : 'Customers can review gifts once their order is delivered. Delivery emails invite them to.'} />
        : <div className='flex flex-col gap-4'>{visible.map(r => <ReviewRow key={r._id} review={r} token={token} onChanged={load} />)}</div>}
    </>
  )
}

export default Reviews
