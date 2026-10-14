import React from 'react'

// Section heading: "text1 text2" with the second word in italic berry
const Title = ({text1, text2, eyebrow, as = 'h2', className = ''}) => {
  const Heading = as
  const cap = (s) => String(s || '').charAt(0) + String(s || '').slice(1).toLowerCase()
  return (
    <div className={`flex flex-col gap-2 mb-4 ${className}`}>
        {eyebrow && <p className='eyebrow'>{eyebrow}</p>}
        <Heading className='font-display font-semibold text-ink text-[2rem] sm:text-[2.6rem] leading-[1.05]'>
          {cap(text1)} <span className='italic text-berry'>{cap(text2)}</span>
        </Heading>
    </div>
  )
}

export default Title
