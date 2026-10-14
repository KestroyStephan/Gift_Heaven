import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import logoBadge from '../assets/logo-badge.webp'

// Line icons used across the admin portal
const paths = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  add: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  list: <><path d="M20 7l-8-4-8 4 8 4 8-4z" /><path d="M4 7v10l8 4 8-4V7" /><path d="M12 11v10" /></>,
  orders: <><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></>,
  messages: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  chats: <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.4A8 8 0 1121 12z" />,
  store: <><path d="M3 9l1.5-5h15L21 9" /><path d="M3 9h18v2a3 3 0 01-6 0 3 3 0 01-6 0 3 3 0 01-6 0V9z" /><path d="M5 13v7h14v-7" /></>,
  logout: <><path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3" /><path d="M10 17l-5-5 5-5M5 12h11" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
  revenue: <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  wallet: <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18M16 15h2" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0" /><path d="M16 4.5a3.5 3.5 0 010 7M18 14a6 6 0 013.5 6" /></>,
  gift: <><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M5 12v9h14v-9M12 8v13" /><path d="M12 8S10.5 3 8 3a2.5 2.5 0 000 5M12 8s1.5-5 4-5a2.5 2.5 0 010 5" /></>,
  star: <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1L3.2 9.4l6.1-.8L12 3z" />,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  truck: <><path d="M3 6h11v10H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  pin: <><path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></>,
  sparkle: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  box: <><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  download: <><path d="M12 4v11M7 10l5 5 5-5" /><path d="M4 20h16" /></>,
  alert: <><path d="M12 3l9.5 17h-19L12 3z" /><path d="M12 10v4M12 17.5v.01" /></>,
  history: <><path d="M3 12a9 9 0 103-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
  tag: <><path d="M3 12V4a1 1 0 011-1h8l9 9-9 9-9-9z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
}

export const Icon = ({ name, size = 20, className = '', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>{paths[name]}</svg>
)

export const AdminLogo = ({ size = 40, light = false }) => (
  <span className='flex items-center gap-3'>
    <img src={logoBadge} width={size} height={size} alt='' aria-hidden='true' className='shrink-0 drop-shadow-sm' draggable='false' />
    <span className='flex flex-col leading-none'>
      <span className={`font-display italic font-semibold ${light ? 'text-white' : 'text-berry'}`} style={{ fontSize: size * 0.55 }}>Surprise</span>
      <span className={`font-bold tracking-[0.4em] text-[10px] mt-[3px] ${light ? 'text-gold' : 'text-ink'}`}>HEAVEN · ADMIN</span>
    </span>
  </span>
)

export const PageHeader = ({ title, subtitle, children }) => (
  <div className='flex flex-wrap items-end justify-between gap-4 mb-6'>
    <div>
      <h1 className='font-display text-[2.1rem] leading-tight font-semibold text-ink'>{title}</h1>
      {subtitle && <p className='text-sm text-mauve mt-1'>{subtitle}</p>}
    </div>
    {children && <div className='flex flex-wrap items-center gap-2'>{children}</div>}
  </div>
)

export const statusStyles = {
  'Order Placed': 'bg-sky-50 text-sky-800 ring-sky-200',
  'Packing': 'bg-amber-50 text-amber-800 ring-amber-200',
  'Shipped': 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  'Out for delivery': 'bg-violet-50 text-violet-800 ring-violet-200',
  'Delivered': 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  'Cancelled': 'bg-stone-100 text-stone-600 ring-stone-200',
}
export const statusColours = {
  'Order Placed': '#0284C7', 'Packing': '#D97706', 'Shipped': '#4F46E5',
  'Out for delivery': '#7C3AED', 'Delivered': '#059669', 'Cancelled': '#A8A29E',
}

export const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset whitespace-nowrap ${statusStyles[status] || statusStyles.Cancelled}`}>
    <span className='w-1.5 h-1.5 rounded-full' style={{ background: statusColours[status] }}></span>{status}
  </span>
)

export const Empty = ({ icon = 'gift', title, text }) => (
  <div className='card p-10 flex flex-col items-center text-center gap-2'>
    <span className='w-12 h-12 rounded-2xl bg-pink-50 text-berry flex items-center justify-center'><Icon name={icon} /></span>
    <p className='font-semibold text-ink mt-1'>{title}</p>
    {text && <p className='text-sm text-mauve max-w-sm'>{text}</p>}
  </div>
)

export const orderNo = (id) => '#' + String(id).slice(-8).toUpperCase()

// Brand logo, or its name as a coloured wordmark when no logo is uploaded
export const BrandMark = ({ brand, size = 'md' }) => {
  if (!brand) return null
  const box = size === 'sm' ? 'w-9 h-9 rounded-xl text-[13px]' : 'w-16 h-16 rounded-2xl text-xl'
  return brand.logo
    ? <img src={brand.logo} alt={brand.name} className={`${box} object-contain bg-white border border-line p-1 shrink-0`} />
    : <span className={`${box} shrink-0 flex items-center justify-center font-display italic font-semibold text-white`} style={{ background: brand.colour }}>
        {brand.name.split(/\s+/).slice(0, 2).map(w => w[0]).join('')}
      </span>
}

// Brands for pickers and tables
export const useBrands = () => {
  const [brands, setBrands] = useState([])
  const load = () => axios.get(backendUrl + '/api/brand/list').then(({ data }) => data.success && setBrands(data.brands)).catch(() => {})
  useEffect(() => { load() }, [])
  return [brands, load]
}

export const BrandSelect = ({ brands, value, onChange, className = 'field font-normal' }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
    <option value=''>No brand</option>
    {brands.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
  </select>
)

export const money = (n, currency = 'Rs. ') => `${n < 0 ? '−' : ''}${currency}${Math.abs(Math.round(n || 0)).toLocaleString('en-LK')}`

// Stock status of a product
export const stockStatus = (p) => !p.trackStock ? { label: 'Made to order', style: 'bg-violet-50 text-violet-800 ring-violet-200' }
  : p.stock <= 0 ? { label: 'Out of stock', style: 'bg-rose-50 text-rose-700 ring-rose-200' }
  : p.stock <= p.lowStock ? { label: 'Low stock', style: 'bg-amber-50 text-amber-800 ring-amber-200' }
  : { label: 'In stock', style: 'bg-emerald-50 text-emerald-700 ring-emerald-200' }

export const StockBadge = ({ product }) => {
  const s = stockStatus(product)
  return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset whitespace-nowrap ${s.style}`}>{s.label}</span>
}

// Save rows as a CSV file the owner can open in Excel
export const downloadCsv = (filename, rows) => {
  const escape = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
  const csv = rows.map(r => r.map(escape).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}
