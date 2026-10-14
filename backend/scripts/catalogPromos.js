// Starter coupons and offers. Dates are relative to when the seed runs; edit or end them in Admin → Offers & coupons.
const DAY = 24 * 60 * 60 * 1000

export const promoCoupons = (now = Date.now()) => [
    { code: 'WELCOME10', description: '10% off your first order (up to Rs. 2,000)', type: 'percent', value: 10, maxDiscount: 2000, firstOrderOnly: true, perUserLimit: 1, showOnSite: true },
    { code: 'FREEDELIVERY', description: 'Free delivery on orders over Rs. 5,000', type: 'delivery', minOrder: 5000, perUserLimit: 0, showOnSite: true },
    { code: 'LOVE500', description: 'Rs. 500 off orders over Rs. 7,500', type: 'fixed', value: 500, minOrder: 7500, perUserLimit: 1, showOnSite: true, endsAt: now + 60 * DAY },
    { code: 'BIRTHDAY15', description: '15% off cakes and gift packages (up to Rs. 3,000)', type: 'percent', value: 15, maxDiscount: 3000, categories: ['Cake', 'GiftPackage'], perUserLimit: 2, showOnSite: true },
]

export const promoOffers = (now = Date.now()) => [
    { name: 'Chocolate Week', badge: 'Chocolate Week', type: 'percent', value: 15, scope: 'category', targets: ['ChocolateBucket'], startsAt: now - DAY, endsAt: now + 21 * DAY },
    { name: 'Glow Heaven Beauty Sale', badge: 'Beauty Sale', type: 'percent', value: 10, scope: 'brand', targets: ['glow-heaven'], startsAt: now - DAY, endsAt: now + 30 * DAY },
    { name: 'Kids Toy Fest', badge: 'Toy Fest', type: 'fixed', value: 500, scope: 'category', targets: ['Toys'], startsAt: now - DAY, endsAt: now + 14 * DAY },
]
