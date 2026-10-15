import { useEffect } from 'react'

// Fades `.sr` elements in as they scroll into view (see .sr-* in index.css).
// Watches the page for new elements, so content that loads later animates too.
const useReveal = (key) => {
    useEffect(() => {
        const root = document.documentElement
        if (!('IntersectionObserver' in window)) return
        root.classList.add('reveal-on')

        const io = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    const el = entry.target
                    el.classList.add('sr-in')
                    io.unobserve(el)
                    // Once it has arrived, drop the reveal classes so hover effects and timings work normally
                    setTimeout(() => el.classList.remove('sr', 'sr-up', 'sr-left', 'sr-right', 'sr-scale', 'sr-d1', 'sr-d2', 'sr-d3', 'sr-d4', 'sr-d5'), 1400)
                }
            }
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })

        const seen = new WeakSet()
        const scan = () => document.querySelectorAll('.sr:not(.sr-in)').forEach(el => { if (!seen.has(el)) { seen.add(el); io.observe(el) } })
        scan()
        const mo = new MutationObserver(scan)
        mo.observe(document.body, { childList: true, subtree: true })
        return () => { io.disconnect(); mo.disconnect() }
    }, [key])
}

export default useReveal
