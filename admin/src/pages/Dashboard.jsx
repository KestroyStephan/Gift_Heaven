import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { backendUrl, currency, categories } from '../App'
import { Icon, PageHeader, StatusBadge, PayBadge, statusColours, orderNo } from '../components/ui'

const money = (n) => `${currency}${Math.round(n || 0).toLocaleString('en-LK')}`
const short = (n) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(Math.round(n))
const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0)

// Percentage change between the last 7 days and the 7 before
const trendOf = (daily, key) => {
  const now = sum(daily.slice(-7), key), before = sum(daily.slice(-14, -7), key)
  if (!before) return now ? 100 : 0
  return Math.round(((now - before) / before) * 100)
}

const Trend = ({ value }) => (
  <span className={`inline-flex items-center gap-0.5 text-xs font-extrabold px-2.5 py-1 rounded-full ${value >= 0 ? 'bg-gradient-to-r from-berry to-berry-dark text-white shadow-[0_6px_14px_-6px_rgba(210,58,127,.8)]' : 'bg-[#F6EEF2] text-muted'}`}>
    {value >= 0 ? '▲' : '▼'} {Math.abs(value)}%
  </span>
)

const StatCard = ({ icon, tint, label, value, note, trend }) => (
  <div className='card p-5 flex flex-col gap-4'>
    <div className='flex items-center justify-between'>
      <span className={`w-11 h-11 rounded-2xl flex items-center justify-center ${tint}`}><Icon name={icon} /></span>
      {trend !== undefined && <Trend value={trend} />}
    </div>
    <div>
      <p className='text-[13px] font-semibold text-mauve'>{label}</p>
      <p className='text-[1.7rem] font-bold text-ink mt-0.5 tracking-tight'>{value}</p>
      {note && <p className='text-xs text-mauve mt-1'>{note}</p>}
    </div>
  </div>
)

// 30-day sales as an area chart, with a tooltip on hover
const SalesChart = ({ daily }) => {
  const [hover, setHover] = useState(null)
  const W = 720, H = 240, P = { l: 44, r: 12, t: 16, b: 28 }
  const max = Math.max(1, ...daily.map(d => d.sales))
  const top = Math.ceil(max / 4 / 1000) * 4000 || 4
  const x = (i) => P.l + (i * (W - P.l - P.r)) / (daily.length - 1)
  const y = (v) => H - P.b - (v / top) * (H - P.t - P.b)
  const line = daily.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.sales)}`).join(' ')
  const area = `${line} L${x(daily.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`
  const day = (s) => new Date(s).toLocaleDateString('en-LK', { day: 'numeric', month: 'short' })

  return (
    <div className='relative'>
      <svg viewBox={`0 0 ${W} ${H}`} className='w-full h-auto' onMouseLeave={() => setHover(null)} role='img' aria-label='Sales over the last 30 days'>
        <defs>
          <linearGradient id='salesFill' x1='0' x2='0' y1='0' y2='1'>
            <stop offset='0%' stopColor='#E84F93' stopOpacity='.28' />
            <stop offset='100%' stopColor='#E84F93' stopOpacity='0' />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map(i => (
          <g key={i}>
            <line x1={P.l} x2={W - P.r} y1={y((top / 4) * i)} y2={y((top / 4) * i)} stroke='#F1E6E9' />
            <text x={P.l - 8} y={y((top / 4) * i) + 4} textAnchor='end' fontSize='11' fill='#9A8590'>{short((top / 4) * i)}</text>
          </g>
        ))}
        {daily.map((d, i) => i % 5 === 4 || i === 0 ? <text key={d.day} x={x(i)} y={H - 8} textAnchor='middle' fontSize='11' fill='#9A8590'>{day(d.day)}</text> : null)}
        <path d={area} fill='url(#salesFill)' />
        <path d={line} fill='none' stroke='#E84F93' strokeWidth='2.5' strokeLinejoin='round' strokeLinecap='round' />
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={H - P.b} stroke='#E84F93' strokeDasharray='4 4' />}
        {hover !== null && <circle cx={x(hover)} cy={y(daily[hover].sales)} r='5' fill='#fff' stroke='#E84F93' strokeWidth='2.5' />}
        {daily.map((d, i) => (
          <rect key={d.day} x={x(i) - (W - P.l - P.r) / daily.length / 2} y={P.t} width={(W - P.l - P.r) / daily.length} height={H - P.t - P.b}
            fill='transparent' onMouseEnter={() => setHover(i)} />
        ))}
      </svg>
      {hover !== null && (
        <div className='absolute top-0 pointer-events-none bg-ink text-white rounded-xl px-3 py-2 text-xs shadow-lg -translate-x-1/2'
          style={{ left: `${(x(hover) / W) * 100}%` }}>
          <p className='text-white/60'>{day(daily[hover].day)}</p>
          <p className='font-bold text-sm'>{money(daily[hover].sales)}</p>
          <p className='text-white/60'>{daily[hover].orders} order{daily[hover].orders === 1 ? '' : 's'}</p>
        </div>
      )}
    </div>
  )
}

const Donut = ({ data }) => {
  const total = Math.max(1, sum(data, 'value'))
  const R = 52, C = 2 * Math.PI * R
  let offset = 0
  return (
    <svg viewBox='0 0 140 140' className='w-36 h-36 shrink-0 -rotate-90' aria-hidden='true'>
      <circle cx='70' cy='70' r={R} fill='none' stroke='#F4ECEE' strokeWidth='16' />
      {data.filter(d => d.value).map(d => {
        const length = (d.value / total) * C
        const el = <circle key={d.label} cx='70' cy='70' r={R} fill='none' stroke={d.colour} strokeWidth='16' strokeDasharray={`${length} ${C - length}`} strokeDashoffset={-offset} />
        offset += length
        return el
      })}
    </svg>
  )
}

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

const Dashboard = ({ token }) => {

  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    axios.post(backendUrl + '/api/orders/stats', {}, { headers: { token } })
      .then(({ data }) => {
        if (data.success) {
          setStats(data.stats)
          setRecentOrders(data.recentOrders)
        } else {
          toast.error(data.message)
        }
      })
      .catch(error => toast.error(error.message))
  }, [token])

  if (!stats) return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-5'>
      {[0, 1, 2, 3].map(i => <div key={i} className='card h-40 animate-pulse'></div>)}
    </div>
  )

  const daily = stats.daily || []
  const sales30 = sum(daily, 'sales'), orders30 = sum(daily, 'orders')
  const toPack = (stats.byStatus['Order Placed'] || 0) + (stats.byStatus['Packing'] || 0)
  const statusData = Object.entries(stats.byStatus).map(([label, value]) => ({ label, value, colour: statusColours[label] }))
  const categoryRows = Object.entries(stats.byCategory || {}).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const categoryMax = Math.max(1, ...categoryRows.map(r => r[1]))
  const categoryName = (value) => categories.find(c => c.value === value)?.label || value
  const methodTotal = Math.max(1, Object.values(stats.byMethod).reduce((a, b) => a + b, 0))
  const methodName = { COD: 'Cash on delivery', Stripe: 'Card (Stripe)', Razorpay: 'Razorpay' }

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader title={`${greeting()} 👋`} subtitle="Here's how Surprise Heaven is doing today." >
        <Link to='/orders' className='btn-ghost px-4 py-2 text-sm flex items-center gap-2'><Icon name='orders' size={17} />Manage orders</Link>
      </PageHeader>

      {/* Today banner */}
      <div className='sidebar rounded-[22px] p-6 sm:p-7 text-white flex flex-wrap items-center gap-6 justify-between relative overflow-hidden'>
        <div className='relative'>
          <p className='text-gold text-xs font-bold tracking-[0.22em] uppercase'>Today's work</p>
          <p className='font-display text-3xl font-semibold mt-1'>{toPack ? `${toPack} order${toPack === 1 ? '' : 's'} waiting to be packed` : 'All orders are packed — lovely!'}</p>
          <p className='text-white/65 text-sm mt-1'>{stats.unreadChats || 0} chats and {stats.unreadMessages || 0} messages need a reply.</p>
        </div>
        <div className='relative flex gap-2'>
          <Link to='/orders' className='px-5 py-2.5 rounded-full bg-white text-ink font-bold text-sm hover:bg-pink-50'>Start packing</Link>
          <Link to='/chats' className='px-5 py-2.5 rounded-full border border-white/30 text-white font-semibold text-sm hover:bg-white/10'>Open chats</Link>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5'>
        <StatCard icon='revenue' tint='bg-gradient-to-br from-rose-400 to-berry text-white shadow-[0_8px_18px_-8px_rgba(210,58,127,.8)]' label='Revenue (paid)' value={money(stats.revenue)} note={`${money(stats.pendingPayments)} awaiting payment`} trend={trendOf(daily, 'sales')} />
        <StatCard icon='orders' tint='bg-gradient-to-br from-rose-100 to-rose-200 text-rose-800' label='Orders' value={stats.totalOrders.toLocaleString('en-LK')} note={`${orders30} in the last 30 days`} trend={trendOf(daily, 'orders')} />
        <StatCard icon='wallet' tint='bg-gradient-to-br from-rose-50 to-rose-100 text-berry' label='Average order' value={money(orders30 ? sales30 / orders30 : 0)} note='Last 30 days' />
        <StatCard icon='users' tint='bg-gradient-to-br from-berry-dark to-rose-900 text-white shadow-[0_8px_18px_-8px_rgba(107,25,64,.8)]' label='Customers' value={stats.totalUsers.toLocaleString('en-LK')} note={`${stats.totalProducts} products in the catalogue`} />
      </div>

      {stats.lowStock?.length > 0 && (
        <div className='card p-5 !border-rose-300 border-dashed bg-gradient-to-r from-rose-50 to-white'>
          <div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
            <p className='card-title flex items-center gap-2'><span className='w-8 h-8 rounded-full bg-gradient-to-br from-brand to-berry-dark text-white flex items-center justify-center'><Icon name='alert' size={16} /></span>{stats.stockAlerts} product{stats.stockAlerts === 1 ? ' needs' : 's need'} restocking{stats.outOfStock ? ` · ${stats.outOfStock} sold out` : ''}</p>
            <Link to='/inventory' className='text-sm font-semibold text-berry flex items-center gap-1'>Open inventory <Icon name='chevron' size={15} /></Link>
          </div>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-3'>
            {stats.lowStock.map(p => (
              <div key={p._id} className='flex items-center gap-3 bg-white rounded-2xl border border-line p-2.5'>
                {p.image ? <img src={p.image} alt='' className='w-10 h-10 rounded-xl object-cover' /> : <span className='w-10 h-10 rounded-xl bg-pink-50'></span>}
                <span className='flex-1 min-w-0 text-sm font-medium text-ink truncate'>{p.name}</span>
                <span className={p.stock <= 0 ? 'st st-off' : 'st st-warn'}>{p.stock <= 0 ? 'Sold out' : `${p.stock} left`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='grid xl:grid-cols-[1.7fr_1fr] gap-5'>
        <div className='card p-6'>
          <div className='flex flex-wrap items-start justify-between gap-2 mb-4'>
            <div>
              <p className='card-title'>Sales · last 30 days</p>
              <p className='text-2xl font-bold text-ink mt-1'>{money(sales30)}</p>
            </div>
            <span className='text-xs text-mauve'>Excludes cancelled orders</span>
          </div>
          <SalesChart daily={daily} />
        </div>

        <div className='card p-6'>
          <p className='card-title mb-5'>Orders by status</p>
          <div className='flex items-center gap-6'>
            <div className='relative'>
              <Donut data={statusData} />
              <span className='absolute inset-0 flex flex-col items-center justify-center'>
                <b className='text-2xl text-ink'>{stats.totalOrders}</b><span className='text-[11px] text-mauve'>orders</span>
              </span>
            </div>
            <ul className='flex-1 flex flex-col gap-2 text-sm'>
              {statusData.map(d => (
                <li key={d.label} className='flex items-center gap-2'>
                  <span className='w-2.5 h-2.5 rounded-full' style={{ background: d.colour }}></span>
                  <span className='flex-1'>{d.label}</span><b className='text-ink'>{d.value}</b>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className='grid lg:grid-cols-3 gap-5'>
        <div className='card p-6'>
          <p className='card-title mb-4'>Best-selling gifts</p>
          {stats.topProducts?.length ? (
            <ol className='flex flex-col gap-3'>
              {stats.topProducts.map((p, i) => (
                <li key={p._id} className='flex items-center gap-3'>
                  <span className='w-5 text-xs font-bold text-mauve'>{i + 1}</span>
                  {p.image ? <img src={p.image} alt='' className='w-11 h-11 rounded-xl object-cover border border-line' /> : <span className='w-11 h-11 rounded-xl bg-pink-50'></span>}
                  <span className='flex-1 min-w-0'>
                    <span className='block text-sm font-semibold text-ink truncate'>{p.name}</span>
                    <span className='block text-xs text-mauve'>{p.quantity} sold</span>
                  </span>
                  <b className='text-sm text-ink'>{money(p.sales)}</b>
                </li>
              ))}
            </ol>
          ) : <p className='text-sm'>No sales yet.</p>}
        </div>

        <div className='card p-6'>
          <p className='card-title mb-4'>Sales by category</p>
          {categoryRows.length ? (
            <div className='flex flex-col gap-3.5'>
              {categoryRows.map(([cat, value]) => (
                <div key={cat} className='text-sm'>
                  <div className='flex justify-between mb-1.5'><span>{categoryName(cat)}</span><b className='text-ink'>{money(value)}</b></div>
                  <div className='h-2 rounded-full bg-pink-50'><div className='h-2 rounded-full bg-gradient-to-r from-berry to-pink-400' style={{ width: `${(value / categoryMax) * 100}%` }}></div></div>
                </div>
              ))}
            </div>
          ) : <p className='text-sm'>No sales yet.</p>}
        </div>

        <div className='card p-6'>
          <p className='card-title mb-4'>Payment methods</p>
          {Object.keys(stats.byMethod).length === 0 && <p className='text-sm'>No orders yet.</p>}
          <div className='flex flex-col gap-3.5'>
            {Object.entries(stats.byMethod).map(([method, count]) => (
              <div key={method} className='text-sm'>
                <div className='flex justify-between mb-1.5'><span>{methodName[method] || method}</span><b className='text-ink'>{count} · {Math.round((count / methodTotal) * 100)}%</b></div>
                <div className='h-2 rounded-full bg-rose-50'><div className='h-2 rounded-full bg-gradient-to-r from-rose-300 to-brand' style={{ width: `${(count / methodTotal) * 100}%` }}></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {stats.mostWished?.length > 0 && (
        <div className='card p-6'>
          <div className='flex flex-wrap items-baseline justify-between gap-2 mb-4'>
            <p className='card-title'>Most wished-for gifts</p>
            <span className='text-xs text-mauve'>Saved in customers' wishlists — good to keep in stock</span>
          </div>
          <div className='grid sm:grid-cols-2 lg:grid-cols-5 gap-3'>
            {stats.mostWished.map(p => (
              <div key={p._id} className='flex items-center gap-3 rounded-2xl border border-line p-2.5'>
                {p.image ? <img src={p.image} alt='' className='w-11 h-11 rounded-xl object-cover' /> : <span className='w-11 h-11 rounded-xl bg-pink-50'></span>}
                <span className='min-w-0'>
                  <span className='block text-sm font-semibold text-ink truncate'>{p.name}</span>
                  <span className='block text-xs text-mauve'><b className='text-berry'>♥ {p.count}</b>{p.stock !== null ? ` · ${p.stock} in stock` : ''}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='card overflow-hidden'>
        <div className='flex justify-between items-center px-6 py-5'>
          <p className='card-title'>Recent orders</p>
          <Link to='/orders' className='text-sm font-semibold text-berry flex items-center gap-1'>View all <Icon name='chevron' size={15} /></Link>
        </div>
        {recentOrders.length === 0 ? <p className='px-6 pb-6 text-sm'>No orders yet.</p> : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead className='bg-[#FCF8F9] border-y border-line'>
                <tr className='table-head text-left'>
                  <th className='px-6 py-3 font-bold'>Order</th><th className='px-3 py-3 font-bold'>Customer</th>
                  <th className='px-3 py-3 font-bold'>Date</th><th className='px-3 py-3 font-bold'>Payment</th>
                  <th className='px-3 py-3 font-bold'>Status</th><th className='px-6 py-3 font-bold text-right'>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id} className='border-b border-line last:border-0 hover:bg-[#FCF8F9]'>
                    <td className='px-6 py-3.5 font-mono text-xs text-ink'>{orderNo(order._id)}</td>
                    <td className='px-3 py-3.5'>
                      <span className='flex items-center gap-2.5'>
                        <span className='w-8 h-8 rounded-full bg-pink-50 text-berry text-xs font-bold flex items-center justify-center'>{(order.address.firstName?.[0] || '') + (order.address.lastName?.[0] || '')}</span>
                        <span className='text-ink font-medium whitespace-nowrap'>{order.address.firstName} {order.address.lastName}</span>
                      </span>
                    </td>
                    <td className='px-3 py-3.5 whitespace-nowrap'>{new Date(order.date).toLocaleDateString('en-LK', { day: 'numeric', month: 'short' })}</td>
                    <td className='px-3 py-3.5 whitespace-nowrap'><span className='flex items-center gap-2'>{order.paymentMethod}<PayBadge paid={order.payment} cancelled={order.status === 'Cancelled'} label={order.payment ? 'Paid' : 'Pending'} /></span></td>
                    <td className='px-3 py-3.5'><StatusBadge status={order.status} /></td>
                    <td className='px-6 py-3.5 text-right font-bold text-ink whitespace-nowrap'>{money(order.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
