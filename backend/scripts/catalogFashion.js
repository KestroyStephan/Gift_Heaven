// Perfumes, watches, wallets and handbags. Prices in LKR.
// Photos are Unsplash images (free for commercial use) and are illustrative —
// chosen without visible brand logos so no designer brand is implied.

const plain = { name: true, message: true, ribbon: true, wrap: true, addOns: true, photo: false, print: false, cake: false, engrave: false }
const engrave = { ...plain, engrave: true }

export const fashionProducts = [
    // ---- Perfumes & fragrances
    { name: 'Floral Eau de Parfum for Her', category: 'Fragrances', subCategory: 'BirthdayGift', price: 8500, sizes: ['50 ml', '100 ml'], sizePrices: { '50 ml': 8500, '100 ml': 13500 }, recipients: ['her'], bestseller: true, customization: plain,
      description: 'A soft floral fragrance with notes of rose, jasmine and vanilla musk — elegant from morning to evening.',
      photos: ['1733660227163-01bc46e0d7d7', '1571206508927-2ef3026ada5d'] },
    { name: 'Woody Cologne for Him', category: 'Fragrances', subCategory: 'BirthdayGift', price: 7900, sizes: ['50 ml', '100 ml'], sizePrices: { '50 ml': 7900, '100 ml': 12500 }, recipients: ['him'], bestseller: true, customization: plain,
      description: 'A fresh, woody cologne with cedar, bergamot and amber — confident and long-lasting.',
      photos: ['1638295916768-459f6cf440bc', '1647507653704-bde7f2d6dbf0'] },
    { name: 'Fragrance Discovery Set', category: 'Fragrances', subCategory: 'SurpriseGift', price: 6500, sizes: ['5 × 10 ml'], recipients: ['her', 'him', 'teens'], customization: plain,
      description: 'Five travel-size fragrances in a gift box — the perfect way to find a new signature scent.',
      photos: ['1594125311687-3b1b3eafa9f4', '1720423514789-15a33e59fc81'] },
    { name: 'Body Mist Trio', category: 'Fragrances', subCategory: 'BirthdayGift', price: 4200, sizes: ['3 × 100 ml'], recipients: ['teens', 'her'], customization: plain,
      description: 'Three light, fruity body mists — fresh and fun for everyday wear.',
      photos: ['1784902538196-c7d914e3ecce', '1601066551508-6d9cb1b9de65'] },
    { name: 'Luxury Oud Perfume', category: 'Fragrances', subCategory: 'EidGift', price: 15500, sizes: ['50 ml'], recipients: ['him', 'her', 'elders'], customization: plain,
      description: 'A rich, warm oud fragrance with rose and saffron in a premium bottle — a treasured gift for Eid and special occasions.',
      photos: ['1617661338085-d1ec6a89a6d8', '1598634222670-87c5f558119c'] },
    { name: 'Couple Perfume Set', category: 'Fragrances', subCategory: 'ValentineGift', price: 18500, sizes: ['2 × 50 ml'], recipients: ['couples'], customization: plain,
      description: 'A matching pair of his and hers fragrances in one keepsake box — made for anniversaries and Valentine’s Day.',
      photos: ['1720423738890-37689a6f6b95', '1705899844877-81bb0a0665c1'] },

    // ---- Watches
    { name: 'Classic Chronograph Watch for Him', category: 'Watches', subCategory: 'BirthdayGift', price: 18500, sizes: ['Standard'], recipients: ['him'], bestseller: true, customization: engrave,
      description: 'A stainless steel chronograph with a two-tone bracelet and water resistance. Engrave a message on the case back.',
      photos: ['1618215649872-6e3143a716ec', '1684573573596-38d19a0c0776'] },
    { name: 'Minimalist Black Watch', category: 'Watches', subCategory: 'GraduationGift', price: 12500, sizes: ['Standard'], recipients: ['him', 'teens'], customization: engrave,
      description: 'A clean, matte-black dial with a leather strap — understated style for everyday wear.',
      photos: ['1602752975366-5520991f958d', '1633869699811-cd4f63049b36'] },
    { name: 'Rose Gold Watch for Her', category: 'Watches', subCategory: 'AnniversaryGift', price: 16500, sizes: ['Standard'], recipients: ['her'], bestseller: true, customization: engrave,
      description: 'A delicate rose-gold watch with a mesh bracelet — a timeless anniversary or birthday gift.',
      photos: ['1751437774882-deeea4352018', '1590995505834-e5380bba1865'] },
    { name: 'Fitness Smartwatch', category: 'Watches', subCategory: 'BirthdayGift', price: 14900, sizes: ['Standard'], recipients: ['teens', 'him', 'her'], customization: plain,
      description: 'Tracks steps, heart rate and sleep, shows phone notifications and lasts up to a week on a charge.',
      photos: ['1660844817855-3ecc7ef21f12'] },
    { name: 'His & Hers Watch Set', category: 'Watches', subCategory: 'WeddingGift', price: 32000, sizes: ['Pair'], recipients: ['couples'], customization: engrave,
      description: 'A matching pair of silver watches for the couple, presented in a double gift box. Engrave both case backs with your date.',
      photos: ['1575260279086-4d6bd9efcbeb', '1507680576301-98c2029cf434'] },

    // ---- Wallets
    { name: "Men's Leather Bifold Wallet", category: 'BagsWallets', subCategory: 'BirthdayGift', price: 5900, sizes: ['Brown', 'Black'], recipients: ['him'], bestseller: true, customization: engrave,
      description: 'Genuine leather bifold with card slots and a note compartment. Emboss his initials for a personal touch.',
      photos: ['1624538000860-24716b9050f2', '1614330315526-166f2d71e544'] },
    { name: 'Slim Leather Card Holder', category: 'BagsWallets', subCategory: 'GraduationGift', price: 3500, sizes: ['Brown', 'Black'], recipients: ['him', 'teens', 'her'], customization: engrave,
      description: 'A minimalist card holder that slips into any pocket — embossed initials available.',
      photos: ['1601592996763-f05c9c80a7f1', '1614330316567-11d8e572db16'] },
    { name: "Women's Zip Wallet", category: 'BagsWallets', subCategory: 'BirthdayGift', price: 5500, sizes: ['Standard'], recipients: ['her'], customization: engrave,
      description: 'A roomy zip-around wallet with card slots, a coin pocket and a phone section.',
      photos: ['1743244948210-8d70a7f2b556', '1614330315994-efd5ea8163a1'] },

    // ---- Handbags & bags
    { name: 'Leather Handbag', category: 'BagsWallets', subCategory: 'AnniversaryGift', price: 16500, sizes: ['Standard'], recipients: ['her', 'elders'], bestseller: true, customization: plain,
      description: 'A structured leather handbag with gold buckles and a detachable strap — elegant for work and occasions.',
      photos: ['1605733513597-a8f8341084e6', '1594223274512-ad4803739b7c'] },
    { name: 'Everyday Tote Bag', category: 'BagsWallets', subCategory: 'SurpriseGift', price: 7500, sizes: ['Black', 'Beige'], recipients: ['her', 'teens'], customization: plain,
      description: 'A spacious tote for work, campus and shopping, with an inner zip pocket.',
      photos: ['1578237493287-8d4d2b03591a', '1544816155-12df9643f363'] },
    { name: 'Evening Clutch Purse', category: 'BagsWallets', subCategory: 'WeddingGift', price: 6800, sizes: ['Standard'], recipients: ['her'], customization: plain,
      description: 'A slim clutch for weddings, parties and dinners, with a hidden chain strap.',
      photos: ['1789110854823-381c81e48b4b', '1789110854510-ff3f689101e1'] },
    { name: 'Crossbody Sling Bag', category: 'BagsWallets', subCategory: 'BirthdayGift', price: 8200, sizes: ['Standard'], recipients: ['him', 'her', 'teens'], customization: plain,
      description: 'A compact sling bag for phone, wallet and keys — hands-free for travel and days out.',
      photos: ['1620786514684-ff35b5aae55e', '1718622795525-2295971921ba'] },
    { name: 'Leather Backpack', category: 'BagsWallets', subCategory: 'GraduationGift', price: 14500, sizes: ['Brown', 'Black'], recipients: ['him', 'teens'], customization: engrave,
      description: 'A classic leather backpack with a padded laptop sleeve — a lasting gift for graduates and professionals.',
      photos: ['1622560480605-d83c853bc5c3', '1622560257067-108402fcedc0'] },
]
