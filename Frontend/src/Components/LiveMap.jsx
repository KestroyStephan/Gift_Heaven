import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Icon from './Icons'

const POLL_MS = 8000
const COLOMBO = [6.9271, 79.8612]

const riderIcon = (heading) => L.divIcon({
    className: '',
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    html: `<div class="rider-pin">
             <span class="rider-pulse"></span>
             <span class="rider-dot"${heading !== null && heading !== undefined ? ` style="--heading:${heading}deg"` : ''}>🛵</span>
           </div>`,
})

const ago = (ms) => {
    const s = Math.max(0, Math.round((Date.now() - ms) / 1000))
    if (s < 60) return `${s}s ago`
    const m = Math.round(s / 60)
    return m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`
}

// Live map of the delivery rider: marker, route so far and a "last updated" line.
// `initial` is the live block from the order; `load()` fetches a fresh one.
const LiveMap = ({ initial, load }) => {
    const box = useRef(null)
    const map = useRef(null)
    const marker = useRef(null)
    const line = useRef(null)
    const follow = useRef(true)
    const [live, setLive] = useState(initial)
    const [, tick] = useState(0)
    const [following, setFollowing] = useState(true)

    // Create the map once
    useEffect(() => {
        if (!box.current || map.current) return
        map.current = L.map(box.current, { zoomControl: true, attributionControl: true }).setView(COLOMBO, 12)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map.current)
        line.current = L.polyline([], { color: '#E84F93', weight: 5, opacity: 0.85, lineCap: 'round', dashArray: '1 10' }).addTo(map.current)
        map.current.on('dragstart', () => { follow.current = false; setFollowing(false) })
        return () => { map.current?.remove(); map.current = null; marker.current = null }
    }, [])

    // Draw the latest position and route
    useEffect(() => {
        if (!map.current || !live) return
        const trail = live.trail || []
        line.current.setLatLngs(trail)
        if (!live.last) return
        const pos = [live.last.lat, live.last.lng]
        if (!marker.current) {
            marker.current = L.marker(pos, { icon: riderIcon(live.last.heading), keyboard: false, title: `${live.riderName || 'Rider'}'s location` }).addTo(map.current)
            map.current.fitBounds(trail.length > 1 ? L.latLngBounds(trail).pad(0.3) : L.latLngBounds([pos, pos]).pad(0.01), { maxZoom: 16 })
        } else {
            marker.current.setLatLng(pos)
            marker.current.setIcon(riderIcon(live.last.heading))
            if (follow.current) map.current.panTo(pos, { animate: true, duration: 1 })
        }
    }, [live])

    // Poll for new positions while the rider is out
    useEffect(() => {
        if (!live?.active || !load) return
        const id = setInterval(async () => {
            try { const fresh = await load(); if (fresh) setLive(fresh) } catch { /* keep the last known position */ }
        }, POLL_MS)
        return () => clearInterval(id)
    }, [live?.active])

    // Keep "updated Xs ago" fresh
    useEffect(() => { const id = setInterval(() => tick(t => t + 1), 5000); return () => clearInterval(id) }, [])

    const recenter = () => {
        follow.current = true
        setFollowing(true)
        if (live?.last) map.current.setView([live.last.lat, live.last.lng], Math.max(map.current.getZoom(), 15), { animate: true })
    }

    const stale = live?.last && Date.now() - live.last.at > 2 * 60 * 1000
    const kmh = live?.last?.speed ? Math.round(live.last.speed * 3.6) : null

    return (
        <div className='rounded-[24px] overflow-hidden border border-line bg-white shadow-[0_24px_60px_-34px_rgba(107,25,64,.5)]'>
            <div className='flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 bg-[#FFF6FA] border-b border-line text-sm'>
                <span className='relative flex w-2.5 h-2.5'>
                    <span className={`absolute inset-0 rounded-full ${stale || !live?.last ? 'bg-rose-200' : 'bg-brand animate-ping'}`}></span>
                    <span className={`relative w-2.5 h-2.5 rounded-full ${stale || !live?.last ? 'bg-rose-300' : 'bg-brand'}`}></span>
                </span>
                <b className='text-ink'>{live?.last ? `${live.riderName || 'Your rider'} is on the way` : `Waiting for ${live?.riderName || 'the rider'}'s location…`}</b>
                {live?.last && <span className={stale ? 'text-berry font-semibold' : 'text-muted'}>· updated {ago(live.last.at)}{kmh ? ` · ${kmh} km/h` : ''}</span>}
                <span className='flex-1'></span>
                {live?.riderPhone && <a href={`tel:${live.riderPhone}`} className='inline-flex items-center gap-1.5 font-bold text-berry hover:underline underline-offset-4'><Icon name='phone' size={15} />Call rider</a>}
            </div>
            <div className='relative'>
                <div ref={box} className='h-[320px] sm:h-[380px] w-full z-0' role='application' aria-label='Live map of the delivery rider'></div>
                {!live?.last && (
                    <div className='absolute inset-0 z-[400] flex items-center justify-center bg-white/60 backdrop-blur-[2px] text-sm text-mauve text-center p-6'>
                        The map will show the rider as soon as their phone shares its location.
                    </div>
                )}
                {live?.last && !following && (
                    <button onClick={recenter} className='absolute right-3 bottom-3 z-[400] btn-primary !h-10 !px-4 text-sm'>Re-centre on rider</button>
                )}
            </div>
            {stale && <p className='px-4 py-2 text-xs text-berry bg-rose-50 border-t border-dashed border-rose-300'>The rider's phone hasn't sent a new position for a while — it may be out of signal. The last known position is shown.</p>}
        </div>
    )
}

export default LiveMap
