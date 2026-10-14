import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import { Stars, StarInput } from './Stars'
import Icon from './Icons'

const when = (ms) => new Date(ms).toLocaleDateString('en-LK', { day: 'numeric', month: 'long', year: 'numeric' })
const PAGE = 5

// Write or edit your review of a delivered gift
const ReviewForm = ({ productId, existing, onSaved, onCancel }) => {
    const { backendUrl, token } = useContext(ShopContext)
    const [rating, setRating] = useState(existing?.rating || 0)
    const [title, setTitle] = useState(existing?.title || '')
    const [comment, setComment] = useState(existing?.comment || '')
    const [photos, setPhotos] = useState(existing?.photos || [])
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)

    const upload = async (files) => {
        setUploading(true)
        for (const file of [...files].slice(0, 4 - photos.length)) {
            if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} is over 5 MB`); continue }
            try {
                const form = new FormData()
                form.append('photo', file)
                const { data } = await axios.post(backendUrl + '/api/product/upload-photo', form, { headers: { token } })
                if (data.success) setPhotos(prev => [...prev, data.url].slice(0, 4))
                else toast.error(data.message)
            } catch (error) { toast.error(error.message) }
        }
        setUploading(false)
    }

    const submit = async (e) => {
        e.preventDefault()
        if (!rating) return toast.error('Please choose a star rating')
        setSaving(true)
        try {
            const { data } = await axios.post(backendUrl + '/api/review/save', { productId, rating, title, comment, photos }, { headers: { token } })
            if (data.success) { toast.success(data.message); onSaved() }
            else toast.error(data.message)
        } catch (error) { toast.error(error.message) } finally { setSaving(false) }
    }

    return (
        <form id='write-review' onSubmit={submit} className='rounded-[28px] bg-white border border-line p-6 sm:p-8 flex flex-col gap-5 scroll-mt-28'>
            <div>
                <h3 className='font-display text-3xl font-semibold'>{existing ? 'Edit your review' : 'How was your gift?'}</h3>
                <p className='text-sm text-mauve mt-1'>Your review shows your first name and last initial, with a "Verified purchase" badge.</p>
            </div>
            <StarInput value={rating} onChange={setRating} />
            <label className='flex flex-col gap-2 text-sm font-bold'>Headline <span className='font-medium text-muted -mt-1'>Optional</span>
                <input value={title} onChange={e => setTitle(e.target.value)} maxLength={100} placeholder='e.g. She loved it!' className='field font-normal' />
            </label>
            <label className='flex flex-col gap-2 text-sm font-bold'>Your review
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} maxLength={2000} placeholder='What did you like? How was the packing and delivery?' className='field font-normal resize-y' />
            </label>
            <div className='flex flex-col gap-2'>
                <p className='text-sm font-bold'>Photos <span className='font-medium text-muted'>· up to 4</span></p>
                <div className='flex flex-wrap gap-2'>
                    {photos.map((url, i) => (
                        <span key={url} className='relative'>
                            <img src={url} alt={`Your photo ${i + 1}`} className='w-20 h-20 rounded-xl object-cover border border-line' />
                            <button type='button' onClick={() => setPhotos(photos.filter(p => p !== url))} aria-label={`Remove photo ${i + 1}`} className='absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-white flex items-center justify-center cursor-pointer'><Icon name='close' size={12} /></button>
                        </span>
                    ))}
                    {photos.length < 4 && (
                        <label className={`w-20 h-20 rounded-xl border border-dashed border-rose-300 flex flex-col items-center justify-center text-xs text-muted ${uploading ? 'opacity-60' : 'cursor-pointer hover:bg-rose-50'}`}>
                            {uploading ? <span className='w-5 h-5 border-2 border-rose-200 border-t-berry rounded-full animate-spin'></span> : <><Icon name='plus' />Add</>}
                            <input type='file' accept='image/*' multiple className='sr-only' disabled={uploading} onChange={e => { upload(e.target.files); e.target.value = '' }} />
                        </label>
                    )}
                </div>
            </div>
            <div className='flex flex-wrap gap-3'>
                <button disabled={saving || uploading} className='btn-primary'>{saving ? 'Posting…' : existing ? 'Save changes' : 'Post review'}</button>
                {onCancel && <button type='button' onClick={onCancel} className='btn-outline'>Cancel</button>}
            </div>
        </form>
    )
}

const ReviewCard = ({ review, onHelpful, mine }) => (
    <article className='py-6 border-b border-line last:border-0 flex flex-col gap-2.5'>
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
            <Stars value={review.rating} size={17} />
            {review.title && <h4 className='font-bold text-ink'>{review.title}</h4>}
        </div>
        <p className='text-sm text-muted flex flex-wrap items-center gap-x-2'>
            <span className='font-semibold text-ink'>{review.name}</span>
            {review.verified && <span className='flex items-center gap-1 text-[#2F5A37] font-semibold'><Icon name='check' size={14} strokeWidth={2.4} />Verified purchase</span>}
            <span>· {when(review.date)}{review.edited ? ' · edited' : ''}</span>
            {mine && <span className='px-2 py-0.5 rounded-full bg-rose-50 text-berry text-xs font-bold'>Your review</span>}
        </p>
        {review.comment && <p className='text-[15px] leading-relaxed text-mauve whitespace-pre-line'>{review.comment}</p>}
        {review.photos.length > 0 && (
            <div className='flex flex-wrap gap-2'>
                {review.photos.map((url, i) => <a key={url} href={url} target='_blank' rel='noreferrer'><img src={url} alt={`Photo ${i + 1} from ${review.name}`} loading='lazy' className='w-24 h-24 rounded-xl object-cover border border-line hover:opacity-90' /></a>)}
            </div>
        )}
        {review.reply && (
            <div className='mt-1 ml-1 pl-4 border-l-[3px] border-berry text-sm'>
                <p className='font-bold text-berry'>Reply from Surprise Heaven</p>
                <p className='text-mauve mt-0.5 whitespace-pre-line'>{review.reply.text}</p>
            </div>
        )}
        {!mine && (
            <button onClick={() => onHelpful(review)} aria-pressed={review.markedHelpful}
                className={`self-start mt-1 flex items-center gap-2 text-sm rounded-full border px-3.5 py-1.5 cursor-pointer ${review.markedHelpful ? 'border-berry text-berry bg-rose-50' : 'border-line text-mauve hover:border-rose-300'}`}>
                <Icon name='heart' size={15} /> Helpful{review.helpful ? ` (${review.helpful})` : ''}
            </button>
        )}
    </article>
)

// Ratings summary, filters, the review list and the write-a-review form
const Reviews = ({ product }) => {
    const { backendUrl, token, navigate } = useContext(ShopContext)
    const [data, setData] = useState(null)
    const [mine, setMine] = useState(null)
    const [editing, setEditing] = useState(false)
    const [filter, setFilter] = useState(0)
    const [photosOnly, setPhotosOnly] = useState(false)
    const [sort, setSort] = useState('recent')
    const [shown, setShown] = useState(PAGE)

    const load = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/review/product/${product._id}`)
            if (data.success) setData(data)
            if (token) {
                const res = await axios.post(backendUrl + '/api/review/mine', { productId: product._id }, { headers: { token } })
                if (res.data.success) setMine(res.data)
            } else setMine(null)
        } catch (error) { console.log(error) }
    }
    useEffect(() => { setEditing(false); setFilter(0); setShown(PAGE); load() }, [product._id, token])

    // Open the form straight away when arriving from "Rate this gift"
    useEffect(() => {
        if (window.location.hash === '#write-review' && mine?.canReview && !mine.review) setTimeout(() => document.getElementById('write-review')?.scrollIntoView({ behavior: 'smooth' }), 300)
    }, [mine])

    const helpful = async (review) => {
        if (!token) return navigate(`/login?redirect=/product/${product._id}`)
        const { data: res } = await axios.post(backendUrl + '/api/review/helpful', { id: review._id }, { headers: { token } })
        if (!res.success) return toast.info(res.message)
        setData(prev => ({ ...prev, reviews: prev.reviews.map(r => r._id === review._id ? { ...r, helpful: res.helpful, markedHelpful: res.markedHelpful } : r) }))
    }

    const removeMine = async () => {
        if (!window.confirm('Delete your review?')) return
        const { data: res } = await axios.post(backendUrl + '/api/review/delete', { id: mine.review._id }, { headers: { token } })
        if (res.success) { toast.success(res.message); load() }
    }

    if (!data) return null
    const myId = mine?.review?._id
    let list = data.reviews.filter(r => (!filter || r.rating === filter) && (!photosOnly || r.photos.length))
    if (sort === 'high') list = [...list].sort((a, b) => b.rating - a.rating || b.date - a.date)
    if (sort === 'low') list = [...list].sort((a, b) => a.rating - b.rating || b.date - a.date)
    if (sort === 'helpful') list = [...list].sort((a, b) => b.helpful - a.helpful || b.date - a.date)

    return (
        <section id='reviews' className='mt-20 scroll-mt-28'>
            <div className='flex flex-wrap items-end justify-between gap-4 mb-8'>
                <div>
                    <p className='eyebrow mb-2'>Customer reviews</p>
                    <h2 className='font-display font-semibold text-[2rem] sm:text-[2.6rem] leading-[1.05]'>What people <span className='italic text-berry'>say</span></h2>
                </div>
            </div>

            <div className='grid lg:grid-cols-[320px_minmax(0,1fr)] gap-10 items-start'>
                <aside className='flex flex-col gap-6 lg:sticky lg:top-28'>
                    {data.count > 0 ? (
                        <div className='rounded-[28px] bg-white border border-line p-6'>
                            <div className='flex items-center gap-4'>
                                <span className='font-display text-6xl font-semibold leading-none'>{data.average.toFixed(1)}</span>
                                <span><Stars value={data.average} size={20} /><span className='block text-sm text-muted mt-1'>{data.count} review{data.count === 1 ? '' : 's'}</span></span>
                            </div>
                            <ul className='mt-5 flex flex-col gap-1.5'>
                                {data.breakdown.map(b => (
                                    <li key={b.stars}>
                                        <button onClick={() => { setFilter(filter === b.stars ? 0 : b.stars); setShown(PAGE) }} disabled={!b.count} aria-pressed={filter === b.stars}
                                            className={`w-full flex items-center gap-3 text-sm rounded-lg px-1.5 py-1 ${b.count ? 'cursor-pointer hover:bg-rose-50' : 'opacity-50'} ${filter === b.stars ? 'bg-rose-50 font-bold' : ''}`}>
                                            <span className='w-10 text-left'>{b.stars} star</span>
                                            <span className='flex-1 h-2 rounded-full bg-[#F1E7D6]'><span className='block h-2 rounded-full bg-gold' style={{ width: `${(b.count / data.count) * 100}%` }}></span></span>
                                            <span className='w-6 text-right text-muted'>{b.count}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className='rounded-[28px] bg-white border border-line p-6 text-center flex flex-col items-center gap-2'>
                            <Stars value={0} size={22} />
                            <p className='font-display text-2xl font-semibold'>No reviews yet</p>
                            <p className='text-sm text-mauve'>Bought this gift? Be the first to share how it went.</p>
                        </div>
                    )}

                    {!token ? (
                        <p className='text-sm text-mauve'><Link to={`/login?redirect=/product/${product._id}`} className='font-bold text-berry underline underline-offset-4'>Log in</Link> to review a gift you've received.</p>
                    ) : mine?.review ? (
                        <div className='flex flex-wrap gap-2'>
                            <button onClick={() => setEditing(true)} className='btn-outline !py-2.5 text-sm'>Edit your review</button>
                            <button onClick={removeMine} className='text-sm font-semibold text-muted hover:text-berry cursor-pointer px-2'>Delete</button>
                            {mine.review.status === 'hidden' && <p className='w-full text-xs text-amber-700'>Your review is hidden by our team.</p>}
                        </div>
                    ) : mine?.canReview ? (
                        <a href='#write-review' className='btn-primary self-start'><Icon name='star' size={18} /> Write a review</a>
                    ) : (
                        <p className='text-sm text-mauve'>You can review this gift once your order has been delivered.</p>
                    )}
                </aside>

                <div className='min-w-0 flex flex-col gap-6'>
                    {((mine?.canReview && !mine.review) || editing) && (
                        <ReviewForm productId={product._id} existing={editing ? mine.review : null} onCancel={editing ? () => setEditing(false) : null} onSaved={() => { setEditing(false); load() }} />
                    )}

                    {data.count > 0 && (
                        <div>
                            <div className='flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line'>
                                <div className='flex flex-wrap gap-2'>
                                    {filter > 0 && <button onClick={() => setFilter(0)} className='flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-ink text-white text-sm font-semibold cursor-pointer'>{filter} star <Icon name='close' size={14} /></button>}
                                    {data.withPhotos > 0 && <button onClick={() => setPhotosOnly(!photosOnly)} aria-pressed={photosOnly} className={`h-9 px-3.5 rounded-full text-sm font-semibold border cursor-pointer ${photosOnly ? 'bg-ink text-white border-ink' : 'bg-white border-line'}`}>With photos ({data.withPhotos})</button>}
                                </div>
                                <label className='flex items-center gap-2 text-sm'>
                                    <span className='text-mauve'>Sort</span>
                                    <select value={sort} onChange={e => setSort(e.target.value)} className='h-9 px-3 rounded-full border border-rose-300 bg-white font-semibold cursor-pointer'>
                                        <option value='recent'>Most recent</option>
                                        <option value='helpful'>Most helpful</option>
                                        <option value='high'>Highest rated</option>
                                        <option value='low'>Lowest rated</option>
                                    </select>
                                </label>
                            </div>
                            {list.length === 0 ? <p className='py-8 text-mauve'>No reviews match.</p> : list.slice(0, shown).map(r => <ReviewCard key={r._id} review={r} onHelpful={helpful} mine={r._id === myId} />)}
                            {list.length > shown && <button onClick={() => setShown(shown + PAGE)} className='btn-outline mt-4'>Show more reviews ({list.length - shown})</button>}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default Reviews
