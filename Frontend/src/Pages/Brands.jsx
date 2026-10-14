import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import Title from '../Components/Title'
import Icon from '../Components/Icons'
import { BrandMark } from '../Components/Mall'

// A–Z directory of every brand in the store
const Brands = () => {
  const { brands, products } = useContext(ShopContext)
  const [query, setQuery] = useState('')

  const visible = brands.filter(b => b.productCount > 0 && b.name.toLowerCase().includes(query.toLowerCase()))
  const groups = visible.reduce((acc, b) => {
    const letter = b.name[0].toUpperCase()
    ;(acc[letter] = acc[letter] || []).push(b)
    return acc
  }, {})
  const letters = Object.keys(groups).sort()
  const coverOf = (slug) => products.find(p => p.brand === slug && p.bestseller)?.image?.[0] || products.find(p => p.brand === slug)?.image?.[0]

  return (
    <div className='pt-10 pb-16'>
      <div className='flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 mb-8'>
        <div>
          <Title as='h1' eyebrow='Brand directory' text1='Our' text2='brands' />
          <p className='text-mauve -mt-1'>{visible.length} brands — favourite names and our own Surprise Heaven labels.</p>
        </div>
        <label className='relative w-full sm:w-72'>
          <Icon name='search' size={18} className='absolute left-4 top-1/2 -translate-y-1/2 text-muted' />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Find a brand' aria-label='Find a brand' className='w-full h-11 pl-11 pr-4 rounded-full border border-rose-300 bg-white' />
        </label>
      </div>

      {letters.length > 1 && (
        <nav aria-label='Jump to letter' className='flex flex-wrap gap-1.5 mb-10'>
          {letters.map(l => <a key={l} href={`#brands-${l}`} className='w-9 h-9 rounded-full border border-line bg-white flex items-center justify-center text-sm font-bold hover:border-berry hover:text-berry'>{l}</a>)}
        </nav>
      )}

      {letters.length === 0 && <p className='text-center text-mauve py-16'>No brands match “{query}”.</p>}

      <div className='flex flex-col gap-12'>
        {letters.map(letter => (
          <section key={letter} id={`brands-${letter}`} className='scroll-mt-32'>
            <h2 className='font-display text-4xl font-semibold text-berry mb-5'>{letter}</h2>
            <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5'>
              {groups[letter].map(b => (
                <Link key={b.slug} to={`/brand/${b.slug}`} className='group rounded-[24px] bg-white border border-line overflow-hidden flex hover:shadow-[0_14px_34px_-16px_rgba(43,27,36,.35)] transition'>
                  <span className='w-28 shrink-0 relative' style={{ background: `${b.colour}14` }}>
                    {coverOf(b.slug) && <img src={coverOf(b.slug)} alt='' className='absolute inset-0 w-full h-full object-cover' />}
                  </span>
                  <span className='p-5 flex flex-col gap-1.5 min-w-0'>
                    <BrandMark brand={b} className='!text-left text-[1.6rem] max-h-12 self-start' />
                    {b.logo && <span className='font-bold text-ink'>{b.name}</span>}
                    <span className='text-sm text-mauve line-clamp-2'>{b.tagline}</span>
                    <span className='text-xs font-bold text-berry mt-1 flex items-center gap-1'>{b.productCount} gift{b.productCount === 1 ? '' : 's'} <Icon name='arrow' size={13} className='transition group-hover:translate-x-1' /></span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default Brands
