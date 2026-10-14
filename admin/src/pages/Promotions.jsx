import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl, categories } from '../App'
import { Icon, PageHeader, Empty, money, useBrands } from '../components/ui'

const toInput = (ms) => { if (!ms) return ''; const d = new Date(ms); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const fromInput = (v, endOfDay) => v ? new Date(`${v}T${endOfDay ? '23:59:59' : '00:00:00'}`).getTime() : 0
const shortDate = (ms) => new Date(ms).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' })
const catName = (v) => categories.find(c => c.value === v)?.label || v

// Running, scheduled, ended or paused
const statusOf = (p) => {
  const now = Date.now()
  if (!p.active) return { label: 'Paused', style: 'bg-stone-100 text-stone-600 ring-stone-200' }
  if (p.startsAt && p.startsAt > now) return { label: 'Scheduled', style: 'bg-sky-50 text-sky-800 ring-sky-200' }
  if (p.endsAt && p.endsAt <= now) return { label: 'Ended', style: 'bg-stone-100 text-stone-600 ring-stone-200' }
  if (p.usageLimit && p.usedCount >= p.usageLimit) return { label: 'Used up', style: 'bg-amber-50 text-amber-800 ring-amber-200' }
  return { label: 'Live', style: 'bg-emerald-50 text-emerald-700 ring-emerald-200' }
}
const Status = ({ promo }) => { const s = statusOf(promo); return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset whitespace-nowrap ${s.style}`}>{s.label}</span> }
const discountText = (p) => p.type === 'delivery' ? 'Free delivery' : p.type === 'percent' ? `${p.value}% off${p.maxDiscount ? ` (max ${money(p.maxDiscount)})` : ''}` : `${money(p.value)} off`
const window_ = (p) => p.startsAt || p.endsAt ? `${p.startsAt ? shortDate(p.startsAt) : 'Now'} → ${p.endsAt ? shortDate(p.endsAt) : 'no end'}` : 'Always on'

// Pick several values from a list (categories / brands / products)
const MultiPick = ({ options, value, onChange, placeholder = 'Search…' }) => {
  const [q, setQ] = useState('')
  const shown = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase())).slice(0, 60)
  return (
    <div className='flex flex-col gap-2'>
      {value.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {value.map(v => (
            <button type='button' key={v} onClick={() => onChange(value.filter(x => x !== v))} className='flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-semibold cursor-pointer'>
              {options.find(o => o.value === v)?.label || v} <Icon name='close' size={12} />
            </button>
          ))}
        </div>
      )}
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className='field font-normal' />
      <div className='max-h-40 overflow-y-auto border border-line rounded-xl divide-y divide-line'>
        {shown.map(o => (
          <label key={o.value} className='flex items-center gap-2 px-3 py-2 text-sm font-normal cursor-pointer hover:bg-[#FCF8F9]'>
            <input type='checkbox' className='accent-berry' checked={value.includes(o.value)} onChange={() => onChange(value.includes(o.value) ? value.filter(x => x !== o.value) : [...value, o.value])} />
            {o.label}
          </label>
        ))}
        {shown.length === 0 && <p className='px-3 py-2 text-sm text-mauve'>Nothing found</p>}
      </div>
    </div>
  )
}

const Modal = ({ title, onClose, onSubmit, saving, children }) => (
  <div className='fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4' onClick={onClose}>
    <form onSubmit={onSubmit} onClick={(e) => e.stopPropagation()} className='bg-white rounded-3xl p-7 w-full max-w-2xl max-h-[92vh] overflow-y-auto flex flex-col gap-4 shadow-2xl'>
      <div className='flex justify-between items-center'>
        <h3 className='font-display text-3xl font-semibold text-ink'>{title}</h3>
        <button type='button' onClick={onClose} aria-label='Close' className='w-9 h-9 rounded-full hover:bg-pink-50 flex items-center justify-center cursor-pointer'><Icon name='close' /></button>
      </div>
      {children}
      <button disabled={saving} className='btn-dark py-3 mt-1'>{saving ? 'Saving…' : 'Save'}</button>
    </form>
  </div>
)

const TypePicker = ({ value, onChange, types }) => (
  <div className={`grid ${types.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
    {types.map(t => (
      <button type='button' key={t.id} onClick={() => onChange(t.id)} aria-pressed={value === t.id}
        className={`text-left p-3 rounded-2xl border-2 cursor-pointer ${value === t.id ? 'border-berry bg-pink-50' : 'border-line hover:border-pink-100'}`}>
        <span className='block text-sm font-bold text-ink'>{t.label}</span>
        <span className='block text-[11px] text-mauve'>{t.hint}</span>
      </button>
    ))}
  </div>
)

const CouponForm = ({ coupon, token, brands, onClose, onSaved }) => {
  const [f, setF] = useState(coupon ? { ...coupon, startsAt: toInput(coupon.startsAt), endsAt: toInput(coupon.endsAt) } : {
    code: '', description: '', type: 'percent', value: 10, maxDiscount: '', minOrder: '', categories: [], brands: [],
    startsAt: '', endsAt: '', usageLimit: '', perUserLimit: 1, firstOrderOnly: false, showOnSite: true, active: true,
  })
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setF(prev => ({ ...prev, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/promo/coupon', { ...f, id: coupon?._id, startsAt: fromInput(f.startsAt), endsAt: fromInput(f.endsAt, true) }, { headers: { token } })
      if (data.success) { toast.success(data.message); onSaved() } else toast.error(data.message)
    } catch (error) { toast.error(error.message) } finally { setSaving(false) }
  }

  return (
    <Modal title={coupon ? `Edit ${coupon.code}` : 'New coupon'} onClose={onClose} onSubmit={submit} saving={saving}>
      <div className='grid sm:grid-cols-[1fr_2fr] gap-3'>
        <label className='label'>Code<input value={f.code} onChange={(e) => setF(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/\s/g, '') }))} maxLength={20} placeholder='SUMMER20' className='field font-normal uppercase tracking-wider' required /></label>
        <label className='label'>Description customers see<input value={f.description} onChange={set('description')} maxLength={120} placeholder='20% off birthday gifts' className='field font-normal' /></label>
      </div>
      <TypePicker value={f.type} onChange={(type) => setF(prev => ({ ...prev, type }))} types={[
        { id: 'percent', label: '% off', hint: 'Percentage of the bag' },
        { id: 'fixed', label: 'Rs. off', hint: 'A fixed amount' },
        { id: 'delivery', label: 'Free delivery', hint: 'No delivery fee' },
      ]} />
      <div className='grid sm:grid-cols-3 gap-3'>
        {f.type !== 'delivery' && <label className='label'>{f.type === 'percent' ? 'Percent off' : 'Amount off (Rs.)'}<input type='number' min='1' max={f.type === 'percent' ? 90 : undefined} value={f.value} onChange={set('value')} className='field font-normal' required /></label>}
        {f.type === 'percent' && <label className='label'>Max discount (Rs.)<input type='number' min='0' value={f.maxDiscount} onChange={set('maxDiscount')} placeholder='No cap' className='field font-normal' /></label>}
        <label className='label'>Minimum order (Rs.)<input type='number' min='0' value={f.minOrder} onChange={set('minOrder')} placeholder='None' className='field font-normal' /></label>
      </div>
      <div className='grid sm:grid-cols-2 gap-3'>
        <label className='label'>Starts<input type='date' value={f.startsAt} onChange={set('startsAt')} className='field font-normal' /></label>
        <label className='label'>Ends<input type='date' value={f.endsAt} onChange={set('endsAt')} className='field font-normal' /></label>
        <label className='label'>Total uses<input type='number' min='0' value={f.usageLimit} onChange={set('usageLimit')} placeholder='Unlimited' className='field font-normal' /></label>
        <label className='label'>Uses per customer<input type='number' min='0' value={f.perUserLimit} onChange={set('perUserLimit')} placeholder='Unlimited' className='field font-normal' /></label>
      </div>
      {f.type !== 'delivery' && (
        <details className='rounded-2xl border border-line p-4' open={f.categories.length > 0 || f.brands.length > 0}>
          <summary className='text-sm font-semibold text-ink cursor-pointer'>Only for some categories or brands <span className='font-normal text-mauve'>(optional)</span></summary>
          <div className='grid sm:grid-cols-2 gap-4 mt-3'>
            <div className='label'>Categories<MultiPick options={categories} value={f.categories} onChange={(categories) => setF(prev => ({ ...prev, categories }))} placeholder='Search categories' /></div>
            <div className='label'>Brands<MultiPick options={brands.map(b => ({ value: b.slug, label: b.name }))} value={f.brands} onChange={(brands) => setF(prev => ({ ...prev, brands }))} placeholder='Search brands' /></div>
          </div>
        </details>
      )}
      <div className='flex flex-wrap gap-x-6 gap-y-2 text-sm'>
        <label className='flex items-center gap-2 cursor-pointer'><input type='checkbox' className='accent-berry' checked={f.firstOrderOnly} onChange={set('firstOrderOnly')} />First order only</label>
        <label className='flex items-center gap-2 cursor-pointer'><input type='checkbox' className='accent-berry' checked={f.showOnSite} onChange={set('showOnSite')} />Show on the Offers page</label>
        <label className='flex items-center gap-2 cursor-pointer'><input type='checkbox' className='accent-berry' checked={f.active} onChange={set('active')} />Active</label>
      </div>
    </Modal>
  )
}

const OfferForm = ({ offer, token, brands, products, onClose, onSaved }) => {
  const [f, setF] = useState(offer ? { ...offer, startsAt: toInput(offer.startsAt), endsAt: toInput(offer.endsAt) } : {
    name: '', badge: '', type: 'percent', value: 10, scope: 'category', targets: [], startsAt: toInput(Date.now()), endsAt: '', active: true,
  })
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setF(prev => ({ ...prev, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const options = f.scope === 'category' ? categories : f.scope === 'brand' ? brands.map(b => ({ value: b.slug, label: b.name })) : products.map(p => ({ value: p._id, label: p.name }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await axios.post(backendUrl + '/api/promo/offer', { ...f, id: offer?._id, startsAt: fromInput(f.startsAt), endsAt: fromInput(f.endsAt, true) }, { headers: { token } })
      if (data.success) { toast.success(data.message); onSaved() } else toast.error(data.message)
    } catch (error) { toast.error(error.message) } finally { setSaving(false) }
  }

  return (
    <Modal title={offer ? 'Edit offer' : 'New offer'} onClose={onClose} onSubmit={submit} saving={saving}>
      <p className='text-sm text-mauve -mt-2'>Offers lower prices in the store automatically — no code needed. If several offers cover a gift, the customer gets the biggest saving.</p>
      <div className='grid sm:grid-cols-[2fr_1fr] gap-3'>
        <label className='label'>Offer name<input value={f.name} onChange={set('name')} maxLength={80} placeholder='Avurudu Festival Sale' className='field font-normal' required /></label>
        <label className='label'>Badge on products<input value={f.badge} onChange={set('badge')} maxLength={24} placeholder='Avurudu Sale' className='field font-normal' /></label>
      </div>
      <TypePicker value={f.type} onChange={(type) => setF(prev => ({ ...prev, type }))} types={[
        { id: 'percent', label: '% off', hint: 'Percentage of the price' },
        { id: 'fixed', label: 'Rs. off', hint: 'Fixed amount per gift' },
      ]} />
      <label className='label sm:w-1/2'>{f.type === 'percent' ? 'Percent off' : 'Amount off each gift (Rs.)'}<input type='number' min='1' max={f.type === 'percent' ? 90 : undefined} value={f.value} onChange={set('value')} className='field font-normal' required /></label>
      <div className='label'>Applies to
        <div className='tabs self-start'>
          {[['all', 'Everything'], ['category', 'Categories'], ['brand', 'Brands'], ['products', 'Products']].map(([id, label]) => (
            <button type='button' key={id} aria-pressed={f.scope === id} onClick={() => setF(prev => ({ ...prev, scope: id, targets: [] }))} className='tab'>{label}</button>
          ))}
        </div>
      </div>
      {f.scope !== 'all' && <MultiPick options={options} value={f.targets} onChange={(targets) => setF(prev => ({ ...prev, targets }))} placeholder={`Search ${f.scope === 'products' ? 'products' : f.scope === 'brand' ? 'brands' : 'categories'}`} />}
      <div className='grid sm:grid-cols-2 gap-3'>
        <label className='label'>Starts<input type='date' value={f.startsAt} onChange={set('startsAt')} className='field font-normal' /></label>
        <label className='label'>Ends<input type='date' value={f.endsAt} onChange={set('endsAt')} className='field font-normal' /></label>
      </div>
      <label className='flex items-center gap-2 text-sm cursor-pointer'><input type='checkbox' className='accent-berry' checked={f.active} onChange={set('active')} />Active</label>
    </Modal>
  )
}

const Promotions = ({ token }) => {
  const [tab, setTab] = useState('coupons')
  const [data, setData] = useState(null)
  const [editing, setEditing] = useState(null)
  const [brands] = useBrands()
  const [products, setProducts] = useState([])

  const load = async () => {
    try {
      const { data } = await axios.post(backendUrl + '/api/promo/list', {}, { headers: { token } })
      if (data.success) setData(data); else toast.error(data.message)
    } catch (error) { toast.error(error.message) }
  }
  useEffect(() => {
    load()
    axios.get(backendUrl + '/api/product/list', { params: { limit: 1000 } }).then(({ data }) => data.success && setProducts(data.products)).catch(() => {})
  }, [token])

  const remove = async (kind, item) => {
    if (!window.confirm(`Delete ${kind === 'offer' ? `the offer "${item.name}"` : `coupon ${item.code}`}? Past orders keep their discount.`)) return
    const { data } = await axios.post(backendUrl + '/api/promo/remove', { kind, id: item._id }, { headers: { token } })
    if (data.success) { toast.success(data.message); load() } else toast.error(data.message)
  }
  const toggle = async (kind, item) => {
    const body = { ...item, id: item._id, active: !item.active }
    const { data } = await axios.post(backendUrl + `/api/promo/${kind}`, body, { headers: { token } })
    if (data.success) { toast.success(item.active ? 'Paused' : 'Resumed'); load() } else toast.error(data.message)
  }

  const coupons = data?.coupons || [], offers = data?.offers || []
  const live = (list) => list.filter(p => statusOf(p).label === 'Live').length
  const scopeText = (o) => o.scope === 'all' ? 'Everything' : o.scope === 'category' ? o.targets.map(catName).join(', ')
    : o.scope === 'brand' ? o.targets.map(t => brands.find(b => b.slug === t)?.name || t).join(', ') : `${o.targets.length} products`
  const limits = (c) => [
    c.minOrder ? `min ${money(c.minOrder)}` : null,
    c.firstOrderOnly ? 'first order' : null,
    c.perUserLimit ? `${c.perUserLimit}× per customer` : null,
    c.categories.length ? c.categories.map(catName).join(', ') : null,
    c.brands.length ? c.brands.map(t => brands.find(b => b.slug === t)?.name || t).join(', ') : null,
  ].filter(Boolean).join(' · ') || 'No conditions'

  const actions = (kind, item) => (
    <span className='flex justify-end gap-1'>
      <button onClick={() => toggle(kind, item)} className='btn-ghost px-3 py-1 text-xs'>{item.active ? 'Pause' : 'Resume'}</button>
      <button onClick={() => setEditing({ kind, item })} aria-label='Edit' title='Edit' className='w-8 h-8 rounded-full text-mauve hover:bg-pink-50 hover:text-berry flex items-center justify-center cursor-pointer'><Icon name='edit' size={16} /></button>
      <button onClick={() => remove(kind, item)} aria-label='Delete' title='Delete' className='w-8 h-8 rounded-full text-mauve hover:bg-rose-50 hover:text-rose-700 flex items-center justify-center cursor-pointer'><Icon name='trash' size={16} /></button>
    </span>
  )

  return (
    <>
      <PageHeader title='Offers & coupons' subtitle={`${live(offers)} offers and ${live(coupons)} coupons live`}>
        <button onClick={() => setEditing({ kind: tab === 'coupons' ? 'coupon' : 'offer' })} className='btn-dark px-5 py-2.5 text-sm flex items-center gap-2'>
          <Icon name='plus' size={17} strokeWidth={2.2} />{tab === 'coupons' ? 'New coupon' : 'New offer'}
        </button>
      </PageHeader>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6'>
        <div className='card p-5'><p className='text-[13px] font-semibold text-mauve'>Coupon orders</p><p className='text-[1.6rem] font-bold text-ink mt-1'>{coupons.reduce((s, c) => s + c.orders, 0)}</p></div>
        <div className='card p-5'><p className='text-[13px] font-semibold text-mauve'>Discount given with coupons</p><p className='text-[1.6rem] font-bold text-ink mt-1'>{money(coupons.reduce((s, c) => s + c.discountGiven, 0))}</p></div>
        <div className='card p-5'><p className='text-[13px] font-semibold text-mauve'>Sales from coupon orders</p><p className='text-[1.6rem] font-bold text-ink mt-1'>{money(coupons.reduce((s, c) => s + c.revenue, 0))}</p></div>
      </div>

      <div className='tabs mb-5'>
        <button aria-pressed={tab === 'coupons'} onClick={() => setTab('coupons')} className='tab'>Coupon codes <span className='opacity-60'>{coupons.length}</span></button>
        <button aria-pressed={tab === 'offers'} onClick={() => setTab('offers')} className='tab'>Automatic offers <span className='opacity-60'>{offers.length}</span></button>
      </div>

      {!data ? <div className='card h-40 animate-pulse'></div> : tab === 'coupons' ? (
        coupons.length === 0 ? <Empty icon='tag' title='No coupons yet' text='Create a code like WELCOME10 for customers to use at checkout.' /> : (
          <div className='card overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-[#FCF8F9] border-b border-line'>
                <tr className='table-head text-left'>
                  <th className='pl-5 pr-3 py-3 font-bold'>Code</th><th className='px-3 py-3 font-bold'>Discount</th>
                  <th className='px-3 py-3 font-bold hidden lg:table-cell'>Valid</th><th className='px-3 py-3 font-bold text-right'>Used</th>
                  <th className='px-3 py-3 font-bold text-right hidden md:table-cell'>Discount given</th><th className='px-3 py-3 font-bold'>Status</th><th className='pr-5 py-3'></th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c._id} className='border-b border-line last:border-0 hover:bg-[#FCF8F9] align-top'>
                    <td className='pl-5 pr-3 py-3.5'>
                      <span className='inline-block font-mono font-bold tracking-wider text-berry border-2 border-dashed border-pink-100 rounded-lg px-2 py-0.5'>{c.code}</span>
                      <span className='block text-xs text-mauve mt-1.5 max-w-[16rem]'>{c.description}</span>
                      {c.showOnSite && <span className='inline-block mt-1 text-[11px] font-semibold text-sky-800'>Shown on site</span>}
                    </td>
                    <td className='px-3 py-3.5'><b className='text-ink'>{discountText(c)}</b><span className='block text-xs text-mauve mt-0.5 max-w-[14rem]'>{limits(c)}</span></td>
                    <td className='px-3 py-3.5 hidden lg:table-cell whitespace-nowrap text-xs'>{window_(c)}</td>
                    <td className='px-3 py-3.5 text-right whitespace-nowrap'><b className='text-ink'>{c.usedCount}</b>{c.usageLimit ? <span className='text-mauve'> / {c.usageLimit}</span> : ''}</td>
                    <td className='px-3 py-3.5 text-right hidden md:table-cell whitespace-nowrap'>{money(c.discountGiven)}<span className='block text-xs text-mauve'>{money(c.revenue)} sales</span></td>
                    <td className='px-3 py-3.5'><Status promo={c} /></td>
                    <td className='pr-5 py-3.5'>{actions('coupon', c)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        offers.length === 0 ? <Empty icon='tag' title='No offers yet' text='Run a sale on a category, brand or hand-picked gifts.' /> : (
          <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-5'>
            {offers.map(o => (
              <div key={o._id} className='card overflow-hidden flex flex-col'>
                <div className='p-5 bg-gradient-to-br from-berry to-ink text-white'>
                  <p className='text-[11px] font-bold tracking-[0.18em] uppercase text-white/70'>{o.badge || 'Offer'}</p>
                  <p className='font-display text-[2.2rem] leading-none font-semibold mt-2'>{o.type === 'percent' ? `${o.value}% off` : `${money(o.value)} off`}</p>
                  <p className='mt-1 text-white/85'>{o.name}</p>
                </div>
                <div className='p-5 flex flex-col gap-1.5 text-sm flex-1'>
                  <p><span className='text-mauve'>Applies to:</span> <b className='text-ink'>{scopeText(o)}</b></p>
                  <p><span className='text-mauve'>Gifts on sale:</span> <b className='text-ink'>{o.products}</b></p>
                  <p className='text-xs'>{window_(o)}</p>
                </div>
                <div className='px-5 py-3 border-t border-line flex items-center justify-between'><Status promo={o} />{actions('offer', o)}</div>
              </div>
            ))}
          </div>
        )
      )}

      {editing?.kind === 'coupon' && <CouponForm coupon={editing.item} token={token} brands={brands} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />}
      {editing?.kind === 'offer' && <OfferForm offer={editing.item} token={token} brands={brands} products={products} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />}
    </>
  )
}

export default Promotions
