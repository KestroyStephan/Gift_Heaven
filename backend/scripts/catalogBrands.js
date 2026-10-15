// Brands for the gift mall: the real brands our products are named after,
// plus Surprise Heaven's own house labels for everything we make or source ourselves.
// Real brands use their official logos from Wikimedia Commons; house labels show a coloured wordmark.
export const brands = [
    { slug: 'cadbury', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Cadbury_logo_new.jpg', name: 'Cadbury', colour: '#4B0F7A', featured: true, tagline: 'Dairy Milk chocolates, gift-wrapped by us', description: 'Cadbury Dairy Milk favourites arranged into buckets and bouquets by our gift team.' },
    { slug: 'ferrero', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Ferrero_-_logo_brown_%28Italy%2C_1964-%29.svg', name: 'Ferrero', colour: '#B82D6E', featured: true, tagline: 'Golden pralines for golden moments', description: 'Ferrero Rocher pralines styled into elegant buckets for anniversaries and celebrations.' },
    { slug: 'nestle', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Nestle_textlogo_blue.svg', name: 'Nestlé', colour: '#C8102E', tagline: 'Kit Kat and more, made into gifts', description: 'Kit Kat chocolate bars packed into cheerful buckets with a satin bow and gift tag.' },
    { slug: 'hot-wheels', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Hot_wheels_textlogo.svg', name: 'Hot Wheels', colour: '#E35205', featured: true, tagline: 'Die-cast cars for little racers', description: 'Hot Wheels die-cast car packs, ready to gift with a ribbon and card.' },

    { slug: 'surprise-heaven-signature', name: 'Surprise Heaven Signature', colour: '#A3214F', featured: true, tagline: 'Our hand-packed hampers and love boxes', description: 'Hampers, gift packages, love boxes and festival collections designed and hand-packed in our Colombo studio.' },
    { slug: 'heaven-bakes', name: 'Heaven Bakes', colour: '#D23A7F', featured: true, tagline: 'Fresh celebration cakes, baked to order', description: 'Birthday, wedding and photo cakes baked fresh for your date — eggless on request.' },
    { slug: 'heaven-blooms', name: 'Heaven Blooms', colour: '#C2185B', tagline: 'Bouquets and living plants', description: 'Fresh rose bouquets, flower-and-chocolate duos and easy-care plants in hand-painted pots.' },
    { slug: 'heaven-prints', name: 'Heaven Prints', colour: '#3949AB', tagline: 'Your photos on mugs, frames and more', description: 'Custom printed mugs, T-shirts, cushions, canvases, frames and handmade photo albums.' },
    { slug: 'cocoa-heaven', name: 'Cocoa Heaven', colour: '#9A2459', tagline: 'Chocolate buckets for every budget', description: 'Mixed chocolate buckets and assortments packed to the budget you choose.' },
    { slug: 'little-heaven', name: 'Little Heaven', colour: '#00897B', featured: true, tagline: 'Toys, plush and baby gifts', description: 'Toys, learning kits, plush friends and baby gift sets for little ones.' },
    { slug: 'luxe-heaven', name: 'Luxe Heaven', colour: '#6B1940', featured: true, tagline: 'Jewellery, watches and fragrances', description: 'Fine jewellery, watches and perfumes for the people who deserve a little luxury.' },
    { slug: 'heaven-style', name: 'Heaven Style', colour: '#A52A65', tagline: 'Bags, shoes, sunglasses and accessories', description: 'Handbags, wallets, shoes, sunglasses and everyday accessories.' },
    { slug: 'glow-heaven', name: 'Glow Heaven', colour: '#D81B60', featured: true, tagline: 'Makeup and skincare sets', description: 'Makeup kits, lipsticks, palettes and skincare gift sets.' },
    { slug: 'heaven-tech', name: 'Heaven Tech', colour: '#1565C0', featured: true, tagline: 'Headphones, chargers and phone cases', description: 'Headphones, earbuds, power banks, chargers and phone cases.' },
    { slug: 'heaven-play', name: 'Heaven Play', colour: '#6A1B9A', tagline: 'Gaming gear, puzzles and board games', description: 'Gaming keyboards, mice and headsets, plus chess boards, puzzles and family games.' },
    { slug: 'heaven-home', name: 'Heaven Home', colour: '#2E7D32', tagline: 'Kitchen, dining and home décor', description: 'Mugs, tea sets, bottles, dinnerware, clocks and wall art for the home.' },
    { slug: 'heaven-studio', name: 'Heaven Studio', colour: '#EF6C00', tagline: 'Art supplies, journals and pens', description: 'Colour pencils, paints, sketchbooks, journals, pens and key tags.' },
]

const byName = [
    [/dairy milk/i, 'cadbury'],
    [/ferrero/i, 'ferrero'],
    [/kit kat/i, 'nestle'],
    [/hot wheels/i, 'hot-wheels'],
]

const byCategory = {
    GiftHamper: 'surprise-heaven-signature', GiftPackage: 'surprise-heaven-signature', LoveFocil: 'surprise-heaven-signature', Festive: 'surprise-heaven-signature',
    Cake: 'heaven-bakes',
    Bouquet: 'heaven-blooms', Plants: 'heaven-blooms',
    CustomPrint: 'heaven-prints', Personalised: 'heaven-prints',
    ChocolateBucket: 'cocoa-heaven',
    Toys: 'little-heaven', Baby: 'little-heaven', Teddy: 'little-heaven',
    Jewellery: 'luxe-heaven', Watches: 'luxe-heaven', Fragrances: 'luxe-heaven',
    BagsWallets: 'heaven-style', Footwear: 'heaven-style', Eyewear: 'heaven-style', Accessories: 'heaven-style',
    Beauty: 'glow-heaven',
    Tech: 'heaven-tech',
    Gaming: 'heaven-play', Games: 'heaven-play',
    KitchenDining: 'heaven-home', HomeDecor: 'heaven-home',
    ArtSupplies: 'heaven-studio', Stationery: 'heaven-studio',
}

export const brandFor = (product) => byName.find(([pattern]) => pattern.test(product.name))?.[1] || byCategory[product.category] || 'surprise-heaven-signature'
