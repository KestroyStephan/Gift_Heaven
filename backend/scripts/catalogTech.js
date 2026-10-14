// Phone covers, headphones, power banks and charging accessories. Prices in LKR.
// Photos are Unsplash images (free for commercial use) and are illustrative —
// chosen without visible brand logos so no brand is implied.

const plain = { name: true, message: true, ribbon: true, wrap: true, addOns: true, photo: false, print: false, cake: false, engrave: false }
const engrave = { ...plain, engrave: true }
const printGift = { name: false, message: true, ribbon: false, wrap: true, addOns: false, photo: true, print: true, cake: false, engrave: false }

const phoneModels = ['iPhone 13 / 14', 'iPhone 15', 'iPhone 16', 'Samsung Galaxy A series', 'Samsung Galaxy S series', 'Other model (tell us in the note)']

export const techProducts = [
    // ---- Phone covers
    { name: 'Custom Photo Phone Case', category: 'Tech', subCategory: 'BirthdayGift', price: 2900, sizes: phoneModels, recipients: ['her', 'him', 'teens', 'couples'], bestseller: true, customization: printGift,
      description: 'Your favourite photo, name or design printed on a slim, scratch-resistant case. Upload the photo below and choose your phone model.',
      photos: ['1623393884989-cb3663e431c5', '1678930427302-381e63fbe826'] },
    { name: 'Silicone Phone Case', category: 'Tech', subCategory: 'SurpriseGift', price: 2200, sizes: phoneModels, recipients: ['her', 'teens', 'him'], customization: plain,
      description: 'Soft-touch silicone case with a microfibre lining, in pastel and bold colours. Mention your colour in the gift note.',
      photos: ['1535157412991-2ef801c1748b', '1535469145415-8e49c30eae75'] },
    { name: 'Clear Shockproof Case', category: 'Tech', subCategory: 'SurpriseGift', price: 1800, sizes: phoneModels, recipients: ['her', 'him', 'teens'], customization: plain,
      description: 'Crystal-clear case with air-cushion corners that show off the phone while protecting it from drops.',
      photos: ['1583291023438-41cef6453b1f'] },
    { name: 'Rugged Armour Case', category: 'Tech', subCategory: 'BirthdayGift', price: 2600, sizes: phoneModels, recipients: ['him', 'teens'], customization: plain,
      description: 'Tough matte case with raised camera edges and reinforced corners for everyday adventures.',
      photos: ['1625102217544-a096a17018f7'] },
    { name: 'Leather Phone Case', category: 'Tech', subCategory: 'AnniversaryGift', price: 4500, sizes: phoneModels, recipients: ['him', 'her', 'elders'], customization: engrave,
      description: 'Genuine leather case that ages beautifully. Emboss initials on the back for a personal touch.',
      photos: ['1589895224585-94d71f7873fc', '1628483211662-9bcc692c46dc'] },

    // ---- Headphones
    { name: 'Wireless Over-ear Headphones', category: 'Tech', subCategory: 'BirthdayGift', price: 12500, sizes: ['Black', 'White'], recipients: ['teens', 'him', 'her'], bestseller: true, customization: plain,
      description: 'Bluetooth headphones with deep bass, soft cushions and up to 40 hours of playtime — for music, calls and study sessions.',
      photos: ['1505740420928-5e560c06d30e', '1641048930621-ab5d225ae5b0'] },
    { name: 'Studio Bass Headphones', category: 'Tech', subCategory: 'GraduationGift', price: 9500, sizes: ['Standard'], recipients: ['him', 'teens'], customization: plain,
      description: 'Foldable headphones with powerful bass and a detachable cable — wired or wireless.',
      photos: ['1505740106531-4243f3831c78', '1612858249937-1cc0852093dd'] },
    { name: 'True Wireless Earbuds', category: 'Tech', subCategory: 'BirthdayGift', price: 7900, sizes: ['Black', 'White'], recipients: ['teens', 'him', 'her'], bestseller: true, customization: plain,
      description: 'Compact earbuds with touch controls, clear calls and a pocket charging case.',
      photos: ['1655560378428-7605bda51749', '1578319439584-104c94d37305'] },
    { name: 'Sport Bluetooth Earbuds', category: 'Tech', subCategory: 'SurpriseGift', price: 5900, sizes: ['Standard'], recipients: ['him', 'teens'], customization: plain,
      description: 'Sweat-resistant earbuds with a secure fit for running, gym and cycling.',
      photos: ['1606220945770-b5b6c2c55bf1', '1606220588913-b3aacb4d2f46'] },
    { name: 'Kids’ Headphones', category: 'Tech', subCategory: 'BirthdayGift', price: 4200, sizes: ['Standard'], recipients: ['kids'], customization: plain,
      description: 'Comfortable, volume-limited headphones designed to protect young ears — great for tablets and online classes.',
      photos: ['1723035092325-03ad613d3dae', '1617203442202-5a1219d37247'] },

    // ---- Power banks & charging
    { name: 'Power Bank', category: 'Tech', subCategory: 'GraduationGift', price: 4900, sizes: ['10,000 mAh', '20,000 mAh'], sizePrices: { '10,000 mAh': 4900, '20,000 mAh': 7500 }, recipients: ['him', 'her', 'teens', 'elders'], bestseller: true, customization: plain,
      description: 'Slim power bank with USB-C and USB-A ports that charges a phone two to four times — essential for travel and power cuts.',
      photos: ['1706275399494-fb26bbc5da63', '1566554738544-d962991c3fee'] },
    { name: 'Fast-charge Power Bank 20,000 mAh', category: 'Tech', subCategory: 'BirthdayGift', price: 8500, sizes: ['Standard'], recipients: ['him', 'teens'], customization: plain,
      description: 'High-capacity power bank with fast charging and an LED display — charges phones, tablets and earbuds.',
      photos: ['1736516434209-51ece1006788', '1644571669401-9ab344866592'] },
    { name: 'Cute Printed Power Bank', category: 'Tech', subCategory: 'SurpriseGift', price: 3900, sizes: ['5,000 mAh'], recipients: ['her', 'teens', 'kids'], customization: plain,
      description: 'A pocket-size power bank with a fun printed design — small enough for any bag.',
      photos: ['1706275400998-7fc21c8cd8ed'] },
    { name: 'Wireless Charging Pad', category: 'Tech', subCategory: 'ThankYouGift', price: 3500, sizes: ['Standard'], recipients: ['him', 'her', 'couples'], customization: plain,
      description: 'Just place the phone down to charge — a tidy bedside or desk charger for Qi-enabled phones.',
      photos: ['1591290619618-904f6dd935e3', '1633381638729-27f730955c23'] },
    { name: 'Adjustable Phone Stand', category: 'Tech', subCategory: 'GraduationGift', price: 2500, sizes: ['Standard'], recipients: ['him', 'her', 'teens', 'elders'], customization: engrave,
      description: 'A sturdy aluminium stand for video calls, recipes and online classes. Engrave a name on the base.',
      photos: ['1617975316514-69cd7e16c2a4', '1617975426095-f073792aef15'] },
    { name: '3-in-1 Fast Charging Cable', category: 'Tech', subCategory: 'ThankYouGift', price: 1500, sizes: ['1 m', '2 m'], sizePrices: { '1 m': 1500, '2 m': 1900 }, recipients: ['him', 'her', 'teens', 'elders'], customization: { ...plain, addOns: false },
      description: 'One braided cable with USB-C, Lightning and Micro-USB tips — charges almost any phone.',
      photos: ['1572721546624-05bf65ad7679', '1585995603413-eb35b5f4a50b'] },
]
