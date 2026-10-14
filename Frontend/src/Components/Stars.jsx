import React, { useState } from 'react'

const STAR = 'M12 2.8l2.83 5.73 6.33.92-4.58 4.46 1.08 6.3L12 17.24l-5.66 2.97 1.08-6.3L2.84 9.45l6.33-.92L12 2.8z'

// Read-only stars; fractions are filled proportionally (4.5 -> four and a half)
export const Stars = ({ value = 0, size = 16, className = '' }) => (
    <span className={`inline-flex items-center gap-0.5 ${className}`} role='img' aria-label={`${value} out of 5 stars`}>
        {[0, 1, 2, 3, 4].map(i => {
            const fill = Math.max(0, Math.min(1, value - i))
            return (
                <svg key={i} width={size} height={size} viewBox='0 0 24 24' aria-hidden='true'>
                    <defs><linearGradient id={`star-${i}-${Math.round(fill * 100)}`}><stop offset={`${fill * 100}%`} stopColor='#C9973B' /><stop offset={`${fill * 100}%`} stopColor='#E9DCC3' /></linearGradient></defs>
                    <path d={STAR} fill={`url(#star-${i}-${Math.round(fill * 100)})`} />
                </svg>
            )
        })}
    </span>
)

const labels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent']

// Clickable 1–5 star picker
export const StarInput = ({ value, onChange, size = 34 }) => {
    const [hover, setHover] = useState(0)
    const shown = hover || value
    return (
        <span className='flex items-center gap-3'>
            <span className='flex' role='radiogroup' aria-label='Your rating' onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map(n => (
                    <button type='button' key={n} role='radio' aria-checked={value === n} aria-label={`${n} star${n === 1 ? '' : 's'}`}
                        onMouseEnter={() => setHover(n)} onClick={() => onChange(n)} className='p-0.5 cursor-pointer transition-transform hover:scale-110'>
                        <svg width={size} height={size} viewBox='0 0 24 24'><path d={STAR} fill={n <= shown ? '#C9973B' : '#EADFCB'} /></svg>
                    </button>
                ))}
            </span>
            <span className='text-sm font-semibold text-mauve w-20'>{labels[shown]}</span>
        </span>
    )
}

export default Stars
