import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl, categories } from '../App'
import { Icon, PageHeader, money, downloadCsv } from '../components/ui'

const DAY = 24 * 60 * 60 * 1000
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.getTime() }
const toInput = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const short = (n) => Math.abs(n) >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : Math.abs(n) >= 1e3 ? `${Math.round(n / 1e3)}k` : String(Math.round(n))
const categoryName = (v) => categories.find(c => c.value === v)?.label || v
const methodName = { COD: 'Cash on delivery', Stripe: 'Card (Stripe)', Razorpay: 'Razorpay' }

const presets = [
  { id: 'today', label: 'Today', range: () => [startOfDay(Date.now()), Date.now()] },
  { id: '7', label: '7 days', range: () => [startOfDay(Date.now() - 6 * DAY), Date.now()] },
  { id: '30', label: '30 days', range: () => [startOfDay(Date.now() - 29 * DAY), Date.now()] },
  { id: '90', label: '90 days', range: () => [startOfDay(Date.now() - 89 * DAY), Date.now()] },
  { id: 'month', label: 'This month', range: () => { const d = new Date(); return [new Date(d.getFullYear(), d.getMonth(), 1).getTime(), Date.now()] } },
  { id: 'year', label: 'This year', range: () => [new Date(new Date().getFullYear(), 0, 1).getTime(), Date.now()] },
]

const change = (now, before) => before ? Math.round(((now - before) / Math.abs(before)) * 100) : now ? 100 : 0

const Kpi = ({ label, value, now, before, note, invert }) => {
  const pct = change(now, before)
  const good = invert ? pct <= 0 : pct >= 0
  return (
    <div className='card p-5'>
      <p className='text-[13px] font-semibold text-mauve'>{label}</p>
      <p className='text-[1.6rem] font-bold text-ink tracking-tight mt-1'>{value}</p>
      <p className='text-xs mt-1 flex flex-wrap items-center gap-x-2 gap-y-1'>
        {before !== undefined && <span className={`font-bold px-2 py-0.5 rounded-full ${good ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{pct >= 0 ? '▲' : '▼'} {Math.abs(pct)}%</span>}
        <span className='text-mauve'>{note || 'vs previous period'}</span>
      </p>
    </div>
  )
}

const series = [
  { key: 'sales', label: 'Sales', colour: '#E84F93' },
  { key: 'income', label: 'Income received', colour: '#059669' },
  { key: 'profit', label: 'Gross profit', colour: '#E84F93' },
]

// Sales, income and profit per day
const TrendChart = ({ daily }) => {
  const [hover, setHover] = useState(null)
  const [shown, setShown] = useState(['sales', 'income', 'profit'])
  const W = 760, H = 260, P = { l: 48, r: 12, t: 16, b: 28 }
  const values = daily.flatMap(d => shown.map(k => d[k]))
  const max = Math.max(1, ...values), min = Math.min(0, ...values)
  const step = Math.ceil((max - min) / 4 / 1000) * 1000 || 1
  const top = Math.ceil(max / step) * step, bottom = Math.floor(min / step) * step
  const x = (i) => P.l + (daily.length < 2 ? (W - P.l - P.r) / 2 : (i * (W - P.l - P.r)) / (daily.length - 1))
  const y = (v) => H - P.b - ((v - bottom) / (top - bottom || 1)) * (H - P.t - P.b)
  const ticks = []
  for (let v = bottom; v <= top; v += step) ticks.push(v)
  const every = Math.max(1, Math.ceil(daily.length / 7))
  const label = (s) => new Date(s).toLocaleDateString('en-LK', { day: 'numeric', month: 'short' })

  return (
    <div>
      <div className='flex flex-wrap gap-2 mb-3'>
        {series.map(s => (
          <button key={s.key} onClick={() => setShown(prev => prev.includes(s.key) ? prev.filter(k => k !== s.key) : [...prev, s.key])} aria-pressed={shown.includes(s.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer ${shown.includes(s.key) ? 'border-line bg-white text-ink' : 'border-transparent text-mauve opacity-50'}`}>
            <span className='w-3 h-3 rounded-full' style={{ background: s.colour }}></span>{s.label}
          </button>
        ))}
      </div>
      <div className='relative'>
        <svg viewBox={`0 0 ${W} ${H}`} className='w-full h-auto' onMouseLeave={() => setHover(null)} role='img' aria-label='Sales, income and profit per day'>
          {ticks.map(v => (
            <g key={v}>
              <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke={v === 0 ? '#E4D3D8' : '#F4ECEE'} />
              <text x={P.l - 8} y={y(v) + 4} textAnchor='end' fontSize='11' fill='#9A8590'>{short(v)}</text>
            </g>
          ))}
          {daily.map((d, i) => i % every === 0 ? <text key={d.day} x={x(i)} y={H - 8} textAnchor='middle' fontSize='11' fill='#9A8590'>{label(d.day)}</text> : null)}
          {series.filter(s => shown.includes(s.key)).map(s => (
            <path key={s.key} d={daily.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d[s.key])}`).join(' ')} fill='none' stroke={s.colour} strokeWidth='2.4' strokeLinejoin='round' strokeLinecap='round' />
          ))}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={H - P.b} stroke='#3D0B27' strokeOpacity='.25' strokeDasharray='4 4' />}
          {hover !== null && series.filter(s => shown.includes(s.key)).map(s => <circle key={s.key} cx={x(hover)} cy={y(daily[hover][s.key])} r='4.5' fill='#fff' stroke={s.colour} strokeWidth='2.2' />)}
          {daily.map((d, i) => <rect key={d.day} x={x(i) - (W - P.l - P.r) / daily.length / 2} y={P.t} width={(W - P.l - P.r) / daily.length} height={H - P.t - P.b} fill='transparent' onMouseEnter={() => setHover(i)} />)}
        </svg>
        {hover !== null && (
          <div className='absolute top-0 pointer-events-none bg-ink text-white rounded-xl px-3 py-2 text-xs shadow-lg -translate-x-1/2 min-w-36' style={{ left: `${Math.min(85, Math.max(15, (x(hover) / W) * 100))}%` }}>
            <p className='text-white/60 mb-1'>{label(daily[hover].day)} · {daily[hover].orders} order{daily[hover].orders === 1 ? '' : 's'}</p>
            {series.map(s => <p key={s.key} className='flex justify-between gap-4'><span>{s.label}</span><b>{money(daily[hover][s.key])}</b></p>)}
          </div>
        )}
      </div>
    </div>
  )
}

const BreakdownTable = ({ title, rows, nameOf = (n) => n, showProfit = true }) => {
  const total = rows.reduce((s, r) => s + r.sales, 0) || 1
  return (
    <div className='card p-6'>
      <p className='card-title mb-4'>{title}</p>
      {rows.length === 0 ? <p className='text-sm'>No sales in this period.</p> : (
        <div className='flex flex-col gap-3.5'>
          {rows.slice(0, 8).map(r => (
            <div key={r.name} className='text-sm'>
              <div className='flex justify-between gap-3 mb-1.5'>
                <span className='truncate'>{nameOf(r.name)}</span>
                <span className='whitespace-nowrap'><b className='text-ink'>{money(r.sales)}</b>{showProfit && r.profit !== undefined && <span className='text-xs text-emerald-700 ml-2'>+{money(r.profit)}</span>}</span>
              </div>
              <div className='h-2 rounded-full bg-pink-50'><div className='h-2 rounded-full bg-gradient-to-r from-berry to-pink-400' style={{ width: `${(r.sales / total) * 100}%` }}></div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const Reports = ({ token }) => {
  const [preset, setPreset] = useState('30')
  const [range, setRange] = useState(presets[2].range())
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    axios.post(backendUrl + '/api/orders/report', { from: range[0], to: range[1] }, { headers: { token } })
      .then(({ data }) => data.success ? setReport(data) : toast.error(data.message))
      .catch(error => toast.error(error.message))
      .finally(() => setLoading(false))
  }, [range, token])

  const choose = (p) => { setPreset(p.id); setRange(p.range()) }
  const setCustom = (index, value) => {
    if (!value) return
    const ms = index === 0 ? startOfDay(value) : startOfDay(value) + DAY - 1
    setPreset('custom')
    setRange(prev => index === 0 ? [ms, Math.max(ms + DAY - 1, prev[1])] : [Math.min(prev[0], ms - DAY + 1), ms])
  }

  const exportCsv = () => {
    if (!report) return
    const s = report.summary
    const name = `sales-report-${toInput(range[0])}-to-${toInput(range[1])}.csv`
    downloadCsv(name, [
      ['Sales report', `${toInput(range[0])} to ${toInput(range[1])}`],
      [],
      ['Orders', s.orders], ['Units sold', s.units], ['Sales (incl. delivery)', s.sales], ['Delivery fees', s.delivery], ['Product sales', s.productSales],
      ['Cost of goods', s.cost], ['Gross profit', s.profit], ['Margin %', s.margin], ['Income received', s.income], ['Still to collect (COD)', s.outstanding],
      ['Cancelled orders', s.cancelledOrders], ['Cancelled value', s.cancelledValue],
      [],
      ['Date', 'Orders', 'Sales', 'Income received', 'Gross profit'],
      ...report.daily.map(d => [d.day, d.orders, d.sales, d.income, d.profit]),
      [],
      ['Product', 'Category', 'Units', 'Sales', 'Cost', 'Profit'],
      ...report.products.map(p => [p.name, categoryName(p.category), p.units, p.sales, p.cost, p.profit]),
    ])
  }

  const s = report?.summary, prev = report?.previous

  return (
    <>
      <PageHeader title='Sales & income' subtitle='Sales, money received, costs and profit for any period.'>
        <button onClick={exportCsv} disabled={!report} className='btn-ghost px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50'><Icon name='download' size={17} />Export CSV</button>
      </PageHeader>

      <div className='flex flex-wrap items-center gap-3 mb-6'>
        <div className='overflow-x-auto max-w-full'>
          <div className='tabs'>
            {presets.map(p => <button key={p.id} aria-pressed={preset === p.id} onClick={() => choose(p)} className='tab'>{p.label}</button>)}
          </div>
        </div>
        <span className='flex items-center gap-2 text-sm'>
          <input type='date' aria-label='From' value={toInput(range[0])} max={toInput(Date.now())} onChange={(e) => setCustom(0, e.target.value)} className='field !w-auto !py-1.5' />
          <span>to</span>
          <input type='date' aria-label='To' value={toInput(range[1])} max={toInput(Date.now())} onChange={(e) => setCustom(1, e.target.value)} className='field !w-auto !py-1.5' />
        </span>
        {loading && <span className='w-5 h-5 border-2 border-pink-100 border-t-berry rounded-full animate-spin' aria-label='Loading'></span>}
      </div>

      {!report ? <div className='grid grid-cols-2 lg:grid-cols-4 gap-5'>{[0, 1, 2, 3].map(i => <div key={i} className='card h-28 animate-pulse'></div>)}</div> : (
        <div className='flex flex-col gap-5'>
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5'>
            <Kpi label='Sales' value={money(s.sales)} now={s.sales} before={prev.sales} />
            <Kpi label='Income received' value={money(s.income)} now={s.income} before={prev.income} />
            <Kpi label='Gross profit' value={money(s.profit)} now={s.profit} before={prev.profit} />
            <Kpi label='Orders' value={s.orders.toLocaleString('en-LK')} now={s.orders} before={prev.orders} />
          </div>

          {/* Profit & loss style breakdown */}
          <div className='grid xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-5'>
            <div className='card p-6 min-w-0'>
              <p className='card-title mb-4'>Sales, income and profit per day</p>
              <TrendChart daily={report.daily} />
            </div>
            <div className='card p-6'>
              <p className='card-title mb-4'>Profit & loss</p>
              <dl className='text-sm flex flex-col'>
                {[
                  ...(s.offerSavings || s.discounts ? [
                    ['Gifts at full price', s.productSales + s.offerSavings + s.discounts],
                    ...(s.offerSavings ? [['− Offer savings', -s.offerSavings]] : []),
                    ...(s.discounts ? [['− Coupon discounts', -s.discounts]] : []),
                    ['= Product sales', s.productSales, true],
                  ] : [['Product sales', s.productSales]]),
                  ['+ Delivery fees', s.delivery],
                  ['= Total sales', s.sales, true],
                  ['− Cost of goods', -s.cost],
                  ['− Delivery fees passed on', -s.delivery],
                  ['= Gross profit', s.profit, true],
                ].map(([label, value, strong]) => (
                  <div key={label} className={`flex justify-between py-2 ${strong ? 'border-t border-line font-bold text-ink' : ''}`}>
                    <dt>{label}</dt><dd className={value < 0 ? 'text-rose-700' : ''}>{money(label.startsWith('−') ? -value : value)}</dd>
                  </div>
                ))}
              </dl>
              <div className='mt-3 grid grid-cols-2 gap-3 text-sm'>
                <div className='rounded-2xl bg-emerald-50 p-3'><p className='text-xs text-emerald-800'>Margin</p><p className='font-bold text-emerald-800 text-lg'>{s.margin}%</p></div>
                <div className='rounded-2xl bg-amber-50 p-3'><p className='text-xs text-amber-800'>Still to collect</p><p className='font-bold text-amber-800 text-lg'>{money(s.outstanding)}</p></div>
                <div className='rounded-2xl bg-sky-50 p-3'><p className='text-xs text-sky-800'>Average order</p><p className='font-bold text-sky-800 text-lg'>{money(s.averageOrder)}</p></div>
                <div className='rounded-2xl bg-stone-100 p-3'><p className='text-xs text-stone-600'>Cancelled</p><p className='font-bold text-stone-700 text-lg'>{s.cancelledOrders} · {money(s.cancelledValue)}</p></div>
              </div>
              <p className='text-xs text-mauve mt-3'>{s.units} units sold{s.couponOrders ? ` · ${s.couponOrders} orders used a coupon` : ''}. Offer savings and coupon discounts are already taken off product sales. Income counts paid orders; cash-on-delivery money is received when the order is delivered.</p>
            </div>
          </div>

          <div className='grid lg:grid-cols-3 gap-5'>
            <BreakdownTable title='By category' rows={report.byCategory} nameOf={categoryName} />
            <BreakdownTable title='By brand' rows={report.byBrand} />
            <BreakdownTable title='By payment method' rows={report.byPayment} nameOf={(n) => methodName[n] || n} showProfit={false} />
          </div>

          <div className='card overflow-hidden'>
            <p className='card-title px-6 py-5'>Product performance</p>
            {report.products.length === 0 ? <p className='px-6 pb-6 text-sm'>No sales in this period.</p> : (
              <div className='overflow-x-auto max-h-[60vh]'>
                <table className='w-full text-sm'>
                  <thead className='bg-[#FCF8F9] border-y border-line sticky top-0'>
                    <tr className='table-head text-left'>
                      <th className='pl-6 pr-3 py-3 font-bold'>Product</th>
                      <th className='px-3 py-3 font-bold text-right'>Units</th>
                      <th className='px-3 py-3 font-bold text-right'>Sales</th>
                      <th className='px-3 py-3 font-bold text-right hidden md:table-cell'>Cost</th>
                      <th className='px-3 py-3 font-bold text-right'>Profit</th>
                      <th className='pl-3 pr-6 py-3 font-bold text-right hidden sm:table-cell'>Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.products.map(p => (
                      <tr key={p._id} className='border-b border-line last:border-0 hover:bg-[#FCF8F9]'>
                        <td className='pl-6 pr-3 py-3'>
                          <span className='flex items-center gap-3 min-w-[200px]'>
                            {p.image ? <img src={p.image} alt='' loading='lazy' className='w-10 h-10 rounded-xl object-cover border border-line' /> : <span className='w-10 h-10 rounded-xl bg-pink-50'></span>}
                            <span><span className='block font-semibold text-ink'>{p.name}</span><span className='block text-xs text-mauve'>{categoryName(p.category)}</span></span>
                          </span>
                        </td>
                        <td className='px-3 py-3 text-right'>{p.units}</td>
                        <td className='px-3 py-3 text-right font-semibold text-ink whitespace-nowrap'>{money(p.sales)}</td>
                        <td className='px-3 py-3 text-right hidden md:table-cell whitespace-nowrap'>{money(p.cost)}</td>
                        <td className={`px-3 py-3 text-right font-semibold whitespace-nowrap ${p.profit < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{money(p.profit)}</td>
                        <td className='pl-3 pr-6 py-3 text-right hidden sm:table-cell'>{p.sales ? Math.round((p.profit / p.sales) * 100) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Reports
