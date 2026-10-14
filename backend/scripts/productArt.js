// Draws simple, on-brand product illustrations (800x800 SVG) used as
// placeholder product photos until real photography is uploaded.

const heart = (cx, cy, s, fill, extra = '') =>
    `<path transform="translate(${cx} ${cy}) scale(${s})" d="M0 30C0 30-40 5-40-15C-40-32-25-40-14-40C-6-40 0-34 0-27C0-34 6-40 14-40C25-40 40-32 40-15C40 5 0 30 0 30Z" fill="${fill}" ${extra}/>`

const sparkle = (x, y, s, fill) =>
    `<path transform="translate(${x} ${y}) scale(${s})" d="M0-20C2-6 6-2 20 0C6 2 2 6 0 20C-2 6-6 2-20 0C-6-2-2-6 0-20Z" fill="${fill}"/>`

const bow = (x, y, color, s = 1) => `
    <g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="-34" cy="0" rx="36" ry="20" transform="rotate(-20 -34 0)" fill="${color}"/>
      <ellipse cx="34" cy="0" rx="36" ry="20" transform="rotate(20 34 0)" fill="${color}"/>
      <path d="M-8 6L-26 52L-8 44ZM8 6L26 52L8 44Z" fill="${color}"/>
      <circle r="13" fill="${color}" stroke="#00000022" stroke-width="3"/>
    </g>`

const frameOf = (bg, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <rect width="800" height="800" fill="${bg}"/>
  <circle cx="400" cy="400" r="300" fill="#ffffff" opacity="0.38"/>
  <ellipse cx="400" cy="700" rx="235" ry="24" fill="#2B1B24" opacity="0.09"/>
  ${body}
</svg>`

const bucket = (p) => {
    const items = []
    const xs = [280, 330, 380, 430, 480, 530]
    if (p.balls) {
        ;[[300, 330], [360, 300], [420, 290], [480, 305], [530, 340], [330, 380], [400, 360], [470, 370]].forEach(([x, y]) =>
            items.push(`<circle cx="${x}" cy="${y}" r="38" fill="${p.choc1}"/><circle cx="${x - 12}" cy="${y - 12}" r="10" fill="#ffffff" opacity="0.45"/>`))
    } else {
        xs.forEach((x, i) => {
            const top = 230 + (i % 3) * 28
            const fill = i % 2 ? p.choc2 : p.choc1
            items.push(`<rect x="${x - 24}" y="${top}" width="48" height="230" rx="9" fill="${fill}"/>
              <rect x="${x - 24}" y="${top + 34}" width="48" height="22" fill="#ffffff" opacity="0.55"/>`)
        })
    }
    if (p.hearts) items.push(heart(320, 250, 1.1, p.accent), heart(490, 235, 0.9, p.accent))
    return frameOf(p.bg, `
      ${items.join('')}
      <path d="M225 405L575 405L538 680L262 680Z" fill="${p.primary}"/>
      <rect x="205" y="385" width="390" height="44" rx="14" fill="${p.secondary}"/>
      <rect x="236" y="505" width="328" height="34" fill="${p.ribbon}"/>
      ${bow(400, 520, p.ribbon, 0.9)}
      ${heart(400, 620, 0.7, '#ffffff', 'opacity="0.55"')}
      ${sparkle(615, 225, 1.1, p.ribbon)}${sparkle(195, 300, 0.8, p.ribbon)}`)
}

const flower = (x, y, petal, center, r = 30) => {
    const petals = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 6
        return `<circle cx="${(x + Math.cos(a) * r * 0.9).toFixed(1)}" cy="${(y + Math.sin(a) * r * 0.9).toFixed(1)}" r="${r}" fill="${petal}"/>`
    }).join('')
    return petals + `<circle cx="${x}" cy="${y}" r="${r * 0.72}" fill="${center}"/>`
}

const bouquet = (p) => {
    const spots = [[400, 250], [325, 290], [475, 290], [360, 345], [440, 345], [290, 360], [510, 360], [400, 395]]
    const leaves = [[270, 410, -35], [530, 410, 35], [330, 440, -15], [470, 440, 15]]
        .map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="55" ry="22" transform="rotate(${r} ${x} ${y})" fill="${p.leaf}"/>`).join('')
    const flowers = spots.map(([x, y], i) => flower(x, y, i % 3 === 2 && p.flower2 ? p.flower2 : p.flower, p.center, i === 0 ? 34 : 30)).join('')
    return frameOf(p.bg, `
      ${leaves}${flowers}
      ${p.chocolates ? `<circle cx="300" cy="455" r="30" fill="#C9973B"/><circle cx="500" cy="455" r="30" fill="#C9973B"/>` : ''}
      <path d="M240 420L560 420L432 690L368 690Z" fill="${p.secondary}"/>
      <path d="M268 430L532 430L425 690L375 690Z" fill="${p.primary}"/>
      ${bow(400, 560, p.ribbon, 0.95)}
      ${sparkle(610, 220, 1, p.ribbon)}${sparkle(200, 240, 0.8, p.ribbon)}`)
}

const hamper = (p) => {
    const weaveH = Array.from({ length: 7 }, (_, i) => `<line x1="215" x2="585" y1="${465 + i * 32}" y2="${465 + i * 32}" stroke="${p.secondary}" stroke-width="5" opacity="0.55"/>`).join('')
    const weaveV = Array.from({ length: 9 }, (_, i) => `<line y1="440" y2="670" x1="${250 + i * 38}" x2="${250 + i * 38}" stroke="${p.secondary}" stroke-width="5" opacity="0.35"/>`).join('')
    return frameOf(p.bg, `
      <path d="M245 440Q400 140 555 440" stroke="${p.secondary}" stroke-width="24" fill="none" stroke-linecap="round"/>
      <rect x="450" y="215" width="64" height="230" rx="24" fill="${p.bottle}"/><rect x="468" y="180" width="28" height="60" rx="8" fill="${p.bottle}"/>
      <rect x="456" y="300" width="52" height="60" rx="6" fill="#ffffff" opacity="0.75"/>
      <rect x="285" y="285" width="130" height="160" rx="10" fill="${p.box}"/><rect x="340" y="285" width="20" height="160" fill="${p.ribbon}"/>
      <circle cx="275" cy="420" r="34" fill="#C9973B"/><circle cx="535" cy="425" r="30" fill="${p.accent}"/>
      ${p.flowers ? flower(380, 300, p.accent, '#ffffff', 24) : ''}
      <rect x="210" y="430" width="380" height="245" rx="30" fill="${p.primary}"/>
      ${weaveH}${weaveV}
      <rect x="198" y="420" width="404" height="38" rx="16" fill="${p.secondary}"/>
      ${bow(400, 438, p.ribbon, 1)}
      ${sparkle(625, 250, 1, p.ribbon)}${sparkle(180, 300, 0.8, p.ribbon)}`)
}

const teddy = (p) => frameOf(p.bg, `
      <circle cx="300" cy="225" r="58" fill="${p.fur}"/><circle cx="500" cy="225" r="58" fill="${p.fur}"/>
      <circle cx="300" cy="225" r="30" fill="${p.light}"/><circle cx="500" cy="225" r="30" fill="${p.light}"/>
      <ellipse cx="400" cy="555" rx="155" ry="140" fill="${p.fur}"/>
      <ellipse cx="400" cy="575" rx="95" ry="88" fill="${p.light}"/>
      <circle cx="300" cy="665" r="48" fill="${p.fur}"/><circle cx="500" cy="665" r="48" fill="${p.fur}"/>
      <circle cx="400" cy="320" r="125" fill="${p.fur}"/>
      <ellipse cx="400" cy="362" rx="58" ry="44" fill="${p.light}"/>
      <ellipse cx="400" cy="340" rx="20" ry="14" fill="#2B1B24"/>
      <path d="M380 372Q400 390 420 372" stroke="#2B1B24" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="355" cy="295" r="11" fill="#2B1B24"/><circle cx="445" cy="295" r="11" fill="#2B1B24"/>
      <ellipse cx="270" cy="525" rx="40" ry="70" transform="rotate(30 270 525)" fill="${p.fur}"/>
      <ellipse cx="530" cy="525" rx="40" ry="70" transform="rotate(-30 530 525)" fill="${p.fur}"/>
      ${heart(400, 535, 1.9, p.heart)}
      ${p.balloon ? `<line x1="560" y1="460" x2="610" y2="230" stroke="#2B1B24" stroke-width="3"/><ellipse cx="615" cy="185" rx="55" ry="66" fill="${p.balloon}"/>` : ''}
      ${p.bow ? bow(400, 435, p.bow, 0.7) : ''}
      ${sparkle(180, 230, 1, '#C9973B')}`)

const giftBox = (p) => frameOf(p.bg, `
      ${heart(300, 240, 0.9, p.accent, 'opacity="0.8"')}${heart(510, 210, 1.2, p.accent)}${heart(420, 170, 0.6, p.secondary)}
      <rect x="235" y="410" width="330" height="265" rx="14" fill="${p.primary}"/>
      <rect x="212" y="360" width="376" height="80" rx="14" fill="${p.secondary}"/>
      <rect x="380" y="360" width="40" height="315" fill="${p.ribbon}"/>
      <rect x="235" y="530" width="330" height="36" fill="${p.ribbon}" opacity="0.9"/>
      ${bow(400, 350, p.ribbon, 1.15)}
      ${sparkle(620, 330, 1, p.ribbon)}${sparkle(180, 420, 0.9, p.ribbon)}`)

const photoFrame = (p) => frameOf(p.bg, `
      <path d="M330 610L300 690M470 610L500 690" stroke="${p.primary}" stroke-width="16" stroke-linecap="round"/>
      <rect x="225" y="170" width="350" height="450" rx="20" fill="${p.primary}"/>
      <rect x="258" y="203" width="284" height="384" rx="8" fill="#ffffff"/>
      <rect x="288" y="233" width="224" height="240" rx="6" fill="${p.photo}"/>
      ${p.rings
        ? `<circle cx="372" cy="350" r="48" fill="none" stroke="#C9973B" stroke-width="14"/><circle cx="428" cy="350" r="48" fill="none" stroke="#C9973B" stroke-width="14"/>`
        : heart(400, 355, 1.8, p.accent)}
      <rect x="318" y="500" width="164" height="14" rx="7" fill="${p.text}"/>
      <rect x="345" y="530" width="110" height="10" rx="5" fill="${p.text}" opacity="0.5"/>
      ${heart(620, 250, 0.8, p.accent)}${sparkle(190, 280, 1, '#C9973B')}`)

export const drawProduct = (art) => {
    const kinds = { bucket, bouquet, hamper, teddy, box: giftBox, frame: photoFrame }
    return kinds[art.kind](art)
}
