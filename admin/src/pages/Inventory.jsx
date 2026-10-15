import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl, categories } from '../App'
import { Icon, PageHeader, Empty, StockBadge, stockStatus, money, downloadCsv } from '../components/ui'

const reasons = { order: 'Sold', cancel: 'Returned (cancelled)', restock: 'Received', adjust: 'Count corrected', damaged: 'Damaged / lost', initial: 'Opening stock' }
const when = (date) => new Date(date).toLocaleString('en-LK', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
const labelOf = (value) => categories.find(c => c.value === value)?.label || value

const Summary = ({ icon, tint, label, value, note }) => (
  <div className='card p-5 flex flex-col gap-3'>
    <span className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${tint}`}><Icon name={icon} /></span>
    <div className='min-w-0'>
      <p className='text-[13px] font-semibold text-mauve'>{label}</p>
      <p className='text-[1.35rem] font-bold text-ink tracking-tight leading-tight mt-0.5 whitespace-nowrap'>{value}</p>
      {note && <p className='text-xs text-mauve mt-0.5'>{note}</p>}
    </div>
  </div>
)

// Receive stock, write off damaged units, correct the count, and edit SKU / alert level / cost
const StockForm = ({ product, token, onClose, onSaved }) => {
  const [mode, setMode] = useState('restock')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [form, setForm] = useState({ sku: product.sku || '', trackStock: product.trackStock, lowStock: product.lowStock, costPrice: product.costPrice || '' })
  const [history, setHistory] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axios.post(backendUrl + '/api/product/stock-history', { id: product._id }, { headers: { token } })
      .then(({ data }) => data.success && setHistory(data.moves)).catch(() => setHistory([]))
  }, [product._id])

  const qty = Math.max(0, Math.floor(Number(quantity) || 0))
  const after = mode === 'restock' ? product.stock + qty : mode === 'damaged' ? product.stock - qty : qty
  const margin = form.costPrice && product.price ? Math.round(((product.price - form.costPrice) / product.price) * 100) : null

  const save = async (e) => {
    e.preventDefault()
    if (mode === 'damaged' && after < 0) return toast.error(`Only ${product.stock} in stock`)
    setSaving(true)
    try {
      const body = { id: product._id, ...form, ...(form.trackStock && (qty > 0 || (mode === 'set' && quantity !== '')) ? { mode, quantity: qty, note } : {}) }
      const { data } = await axios.post(backendUrl + '/api/product/stock', body, { headers: { token } })
      if (data.success) { toast.success(data.message); onSaved() }
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const modes = [
    { id: 'restock', label: 'Receive stock', hint: 'A delivery from your supplier' },
    { id: 'damaged', label: 'Write off', hint: 'Damaged, lost or used' },
    { id: 'set', label: 'Set count', hint: 'After a stock take' },
  ]

  return (
    <div className='fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4' onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className='bg-white rounded-3xl p-7 w-full max-w-2xl max-h-[92vh] overflow-y-auto flex flex-col gap-5 shadow-2xl'>
        <div className='flex items-start gap-4'>
          <img src={product.image?.[0]} alt='' className='w-16 h-16 rounded-2xl object-cover border border-line' />
          <div className='flex-1 min-w-0'>
            <h3 className='font-display text-[1.7rem] leading-tight font-semibold text-ink'>{product.name}</h3>
            <p className='text-sm text-mauve flex flex-wrap items-center gap-2 mt-1'>{form.sku || 'No SKU'} · <StockBadge product={product} /></p>
          </div>
          <button type='button' onClick={onClose} aria-label='Close' className='w-9 h-9 rounded-full hover:bg-pink-50 flex items-center justify-center cursor-pointer'><Icon name='close' /></button>
        </div>

        <label className='flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#FCF8F9] cursor-pointer'>
          <span>
            <span className='block font-semibold text-ink text-sm'>Track stock for this product</span>
            <span className='block text-xs text-mauve'>Turn off for made-to-order gifts like cakes and custom prints.</span>
          </span>
          <input type='checkbox' className='accent-berry w-5 h-5' checked={form.trackStock} onChange={() => setForm(prev => ({ ...prev, trackStock: !prev.trackStock }))} />
        </label>

        {form.trackStock && (
          <div className='flex flex-col gap-4'>
            <div className='grid grid-cols-3 gap-2'>
              {modes.map(m => (
                <button type='button' key={m.id} onClick={() => setMode(m.id)} aria-pressed={mode === m.id}
                  className={`text-left p-3 rounded-2xl border-2 cursor-pointer ${mode === m.id ? 'border-berry bg-pink-50' : 'border-line hover:border-pink-100'}`}>
                  <span className='block text-sm font-bold text-ink'>{m.label}</span>
                  <span className='block text-[11px] text-mauve'>{m.hint}</span>
                </button>
              ))}
            </div>
            <div className='grid sm:grid-cols-[140px_1fr] gap-3 items-end'>
              <label className='label'>{mode === 'set' ? 'Units counted' : 'Units'}
                <input type='number' min='0' value={quantity} onChange={(e) => setQuantity(e.target.value)} className='field font-normal' placeholder='0' />
              </label>
              <label className='label'>Note <span className='font-normal text-xs text-mauve -mt-1'>Optional, e.g. supplier invoice no.</span>
                <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} className='field font-normal' />
              </label>
            </div>
            <p className='text-sm'>In stock: <b className='text-ink'>{product.stock}</b> <span className='mx-1.5'>→</span> after saving: <b className={after < 0 ? 'text-rose-700' : 'text-ink'}>{(qty || mode === 'set') && quantity !== '' ? after : product.stock}</b></p>
          </div>
        )}

        <div className='grid sm:grid-cols-3 gap-3'>
          <label className='label'>SKU<input value={form.sku} onChange={(e) => setForm(prev => ({ ...prev, sku: e.target.value }))} maxLength={40} className='field font-normal' /></label>
          <label className='label'>Low stock alert at<input type='number' min='0' value={form.lowStock} onChange={(e) => setForm(prev => ({ ...prev, lowStock: e.target.value }))} className='field font-normal' disabled={!form.trackStock} /></label>
          <label className='label'>Cost price (Rs.)<input type='number' min='0' step='0.01' value={form.costPrice} onChange={(e) => setForm(prev => ({ ...prev, costPrice: e.target.value }))} className='field font-normal' /></label>
        </div>
        <p className='text-xs text-mauve -mt-2'>Selling price {money(product.price)}{margin !== null && <> · margin <b className={margin < 20 ? 'text-muted' : 'text-berry'}>{margin}%</b></>}. Bigger sizes use the same margin.</p>

        <button disabled={saving} className='btn-dark py-3'>{saving ? 'Saving…' : 'Save'}</button>

        <div>
          <p className='card-title mb-2 flex items-center gap-2'><Icon name='history' size={17} />Stock history</p>
          {!history ? <p className='text-sm'>Loading…</p> : history.length === 0 ? <p className='text-sm'>No stock changes yet.</p> : (
            <ul className='divide-y divide-line text-sm max-h-56 overflow-y-auto'>
              {history.map(m => (
                <li key={m._id} className='py-2 flex items-center gap-3'>
                  <b className={`w-12 text-right ${m.change > 0 ? 'text-berry' : 'text-muted'}`}>{m.change > 0 ? '+' : ''}{m.change}</b>
                  <span className='flex-1 min-w-0'>{reasons[m.reason]}{m.orderId ? ` · order #${m.orderId.slice(-8).toUpperCase()}` : ''}{m.note ? ` · ${m.note}` : ''}</span>
                  <span className='text-xs text-mauve whitespace-nowrap'>{when(m.date)} · left {m.stockAfter}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>
    </div>
  )
}

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'low', label: 'Low stock' },
  { id: 'out', label: 'Out of stock' },
  { id: 'tracked', label: 'Stocked' },
  { id: 'made', label: 'Made to order' },
]

const Inventory = ({ token }) => {
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [editing, setEditing] = useState(null)

  const load = async () => {
    try {
      const { data } = await axios.post(backendUrl + '/api/product/inventory', {}, { headers: { token } })
      if (data.success) setData(data)
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
  }
  useEffect(() => { load() }, [token])

  if (!data) return <div className='grid grid-cols-2 lg:grid-cols-4 gap-5'>{[0, 1, 2, 3].map(i => <div key={i} className='card h-28 animate-pulse'></div>)}</div>

  const { products, moves, summary } = data
  const matches = (p) => {
    const s = stockStatus(p).label
    if (tab === 'low' && s !== 'Low stock') return false
    if (tab === 'out' && s !== 'Out of stock') return false
    if (tab === 'tracked' && !p.trackStock) return false
    if (tab === 'made' && p.trackStock) return false
    if (category && p.category !== category) return false
    const q = query.toLowerCase()
    return !q || p.name.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q)
  }
  const count = (id) => products.filter(p => id === 'all' || (id === 'low' ? stockStatus(p).label === 'Low stock' : id === 'out' ? stockStatus(p).label === 'Out of stock' : id === 'tracked' ? p.trackStock : !p.trackStock)).length
  // Lowest stock first, so what needs ordering is at the top
  const visible = products.filter(matches).sort((a, b) => (b.trackStock - a.trackStock) || (a.stock / Math.max(1, a.lowStock)) - (b.stock / Math.max(1, b.lowStock)))

  const exportCsv = () => downloadCsv(`inventory-${new Date().toISOString().slice(0, 10)}.csv`, [
    ['SKU', 'Product', 'Category', 'Status', 'In stock', 'Low stock alert', 'Cost price', 'Selling price', 'Stock value (cost)', 'Stock value (retail)'],
    ...visible.map(p => [p.sku, p.name, labelOf(p.category), stockStatus(p).label, p.trackStock ? p.stock : '', p.trackStock ? p.lowStock : '', p.costPrice, p.price, p.trackStock ? p.stock * p.costPrice : '', p.trackStock ? p.stock * p.price : '']),
  ])

  return (
    <>
      <PageHeader title='Inventory' subtitle={`${summary.tracked} stocked products · ${summary.madeToOrder} made to order`}>
        <button onClick={exportCsv} className='btn-ghost px-4 py-2 text-sm flex items-center gap-2'><Icon name='download' size={17} />Export CSV</button>
      </PageHeader>

      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6'>
        <Summary icon='box' tint='bg-gradient-to-br from-rose-50 to-rose-100 text-berry' label='Units in stock' value={summary.units.toLocaleString('en-LK')} note={`across ${summary.tracked} products`} />
        <Summary icon='wallet' tint='bg-gradient-to-br from-rose-100 to-rose-200 text-rose-800' label='Stock value (cost)' value={money(summary.costValue)} note={`${money(summary.retailValue)} at selling price`} />
        <Summary icon='revenue' tint='bg-gradient-to-br from-rose-400 to-berry text-white shadow-[0_8px_18px_-8px_rgba(210,58,127,.8)]' label='Potential profit' value={money(summary.retailValue - summary.costValue)} note='if all stock sells at full price' />
        <Summary icon='alert' tint='bg-gradient-to-br from-berry-dark to-rose-900 text-white shadow-[0_8px_18px_-8px_rgba(107,25,64,.8)]' label='Needs restocking' value={`${summary.low + summary.out}`} note={`${summary.low} low · ${summary.out} out of stock`} />
      </div>

      <div className='grid 2xl:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start'>
        <div className='card overflow-hidden min-w-0'>
          <div className='flex flex-col gap-3 p-4 border-b border-line'>
            <div className='overflow-x-auto -mx-1 px-1'>
              <div className='tabs'>
                {tabs.map(t => <button key={t.id} aria-pressed={tab === t.id} onClick={() => setTab(t.id)} className='tab'>{t.label} <span className='opacity-60 ml-0.5'>{count(t.id)}</span></button>)}
              </div>
            </div>
            <div className='flex flex-wrap gap-3'>
              <label className='relative flex-1 min-w-[200px]'>
                <Icon name='search' size={17} className='absolute left-3.5 top-1/2 -translate-y-1/2 text-mauve' />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search name or SKU' aria-label='Search inventory' className='field !pl-10' />
              </label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label='Filter by category' className='field !w-auto'>
                <option value=''>All categories</option>
                {categories.filter(c => products.some(p => p.category === c.value)).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {visible.length === 0 ? <div className='p-6'><Empty icon='box' title='Nothing here' text='No products match this view.' /></div> : (
            <div className='overflow-x-auto max-h-[70vh]'>
              <table className='w-full text-sm'>
                <thead className='bg-[#FCF8F9] border-b border-line sticky top-0 z-10'>
                  <tr className='table-head text-left'>
                    <th className='pl-5 pr-3 py-3 font-bold'>Product</th>
                    <th className='px-3 py-3 font-bold'>Status</th>
                    <th className='px-3 py-3 font-bold text-right'>In stock</th>
                    <th className='px-3 py-3 font-bold text-right hidden lg:table-cell'>Cost</th>
                    <th className='px-3 py-3 font-bold text-right hidden lg:table-cell'>Price</th>
                    <th className='px-3 py-3 font-bold text-right hidden md:table-cell'>Value</th>
                    <th className='pl-3 pr-5 py-3'></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(p => (
                    <tr key={p._id} className='border-b border-line last:border-0 hover:bg-[#FCF8F9]'>
                      <td className='pl-5 pr-3 py-3'>
                        <span className='flex items-center gap-3 min-w-[220px]'>
                          <img src={p.image?.[0]} alt='' loading='lazy' className='w-11 h-11 rounded-xl object-cover border border-line shrink-0' />
                          <span className='min-w-0'>
                            <span className='block font-semibold text-ink leading-snug'>{p.name}</span>
                            <span className='block text-xs text-mauve font-mono'>{p.sku || '—'}</span>
                          </span>
                        </span>
                      </td>
                      <td className='px-3 py-3'><StockBadge product={p} /></td>
                      <td className='px-3 py-3 text-right'>
                        {p.trackStock ? (
                          <span className='inline-flex flex-col items-end'>
                            <b className={`text-base ${p.stock <= 0 ? 'text-muted line-through' : p.stock <= p.lowStock ? 'text-berry' : 'text-ink'}`}>{p.stock}</b>
                            <span className='w-16 h-1.5 rounded-full bg-pink-50 mt-1'><span className={`block h-1.5 rounded-full ${p.stock <= p.lowStock ? 'bg-rose-300' : 'bg-gradient-to-r from-brand to-berry-dark'}`} style={{ width: `${Math.min(100, (p.stock / Math.max(1, p.lowStock * 4)) * 100)}%` }}></span></span>
                          </span>
                        ) : <span className='text-xs text-mauve'>—</span>}
                      </td>
                      <td className='px-3 py-3 text-right hidden lg:table-cell whitespace-nowrap'>{p.costPrice ? money(p.costPrice) : <span className='text-rose-700 text-xs'>not set</span>}</td>
                      <td className='px-3 py-3 text-right hidden lg:table-cell whitespace-nowrap'>{money(p.price)}</td>
                      <td className='px-3 py-3 text-right hidden md:table-cell whitespace-nowrap font-semibold text-ink'>{p.trackStock ? money(p.stock * p.costPrice) : '—'}</td>
                      <td className='pl-3 pr-5 py-3 text-right'>
                        <button onClick={() => setEditing(p)} className='btn-ghost px-3.5 py-1.5 text-xs whitespace-nowrap'>{p.trackStock ? 'Update stock' : 'Edit'}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className='card p-5'>
          <p className='card-title mb-3 flex items-center gap-2'><Icon name='history' size={17} />Recent stock changes</p>
          {moves.length === 0 ? <p className='text-sm'>No changes yet.</p> : (
            <ul className='flex flex-col divide-y divide-line text-sm max-h-80 2xl:max-h-[70vh] overflow-y-auto -mx-1 px-1'>
              {moves.map(m => (
                <li key={m._id} className='py-2.5 flex gap-3'>
                  <b className={`w-10 shrink-0 text-right ${m.change > 0 ? 'text-berry' : 'text-muted'}`}>{m.change > 0 ? '+' : ''}{m.change}</b>
                  <span className='min-w-0'>
                    <span className='block text-ink font-medium truncate'>{m.productName}</span>
                    <span className='block text-xs text-mauve'>{reasons[m.reason]} · {when(m.date)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {editing && <StockForm product={editing} token={token} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />}
    </>
  )
}

export default Inventory
