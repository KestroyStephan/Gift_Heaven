// Extra items for surprise boxes. Prices in LKR. Photos are illustrative Unsplash images.

const plain = { name: true, message: true, ribbon: true, wrap: true, addOns: true, photo: false, print: false, cake: false, engrave: false }

export const boxExtraProducts = [
    { name: 'Build-Your-Own Surprise Box', category: 'GiftPackage', subCategory: 'BirthdayGift', price: 1500,
      sizes: ['Classic Kraft Box', 'Luxe Heart Box', 'Wooden Hamper Crate'],
      sizePrices: { 'Classic Kraft Box': 1500, 'Luxe Heart Box': 2900, 'Wooden Hamper Crate': 4500 },
      recipients: ['her', 'him', 'couples', 'kids', 'teens', 'elders'], bestseller: true,
      customization: { name: true, message: true, ribbon: true, wrap: false, addOns: false, photo: false, print: false, cake: false, engrave: false, album: false, box: true },
      description: 'Choose a box, fill it with any gifts from our shop, add a birthday cake and a handmade photo album, and we deliver it all together as one beautiful surprise.',
      photos: ['1592903297149-37fb25202dfa', '1497700003451-e1df943a194b', '1674620213535-9b2a2553ef40'] },
    { name: 'Handmade Memory Photo Album', category: 'Personalised', subCategory: 'AnniversaryGift', price: 4500,
      sizes: ['12 photos', '24 photos', '36 photos'], sizePrices: { '12 photos': 4500, '24 photos': 6500, '36 photos': 8500 },
      recipients: ['her', 'him', 'couples', 'elders'], bestseller: true,
      customization: { name: true, message: true, ribbon: true, wrap: true, addOns: false, photo: false, print: false, cake: false, engrave: false, album: true, box: false },
      description: 'A handmade scrapbook album: we print your photos and decorate every page by hand with paper-cut love quotes, stickers and little notes. Upload your photos and write the quotes you want — allow 3 days.',
      photos: ['1677658288115-28905b06b520', '1595981234058-a9302fb97229', '1662108052701-29c0d7fd0456'] },
    { name: 'Chocolate Assortment — Choose Your Budget', category: 'ChocolateBucket', subCategory: 'BirthdayGift', price: 5000,
      sizes: ['Rs. 2,000', 'Rs. 3,000', 'Rs. 5,000', 'Rs. 7,500', 'Rs. 10,000'],
      sizePrices: { 'Rs. 2,000': 2000, 'Rs. 3,000': 3000, 'Rs. 5,000': 5000, 'Rs. 7,500': 7500, 'Rs. 10,000': 10000 },
      recipients: ['her', 'him', 'couples', 'kids', 'teens', 'elders'], bestseller: true, customization: plain,
      description: 'Pick your budget and we hand-select a mix of premium chocolates, pralines and truffles to match — perfect inside a surprise box.',
      photos: ['1687795097254-f019f9d7fd17', '1548741487-18d363dc4469', '1656821991459-ae723d90d648'] },
    { name: 'Floral Folding Umbrella', category: 'Accessories', subCategory: 'SurpriseGift', price: 2900, sizes: ['Floral', 'Rainbow'],
      recipients: ['her', 'teens', 'elders'], customization: plain,
      description: 'A compact folding umbrella with a pretty print and windproof frame — a thoughtful gift for the monsoon.',
      photos: ['1595205159255-a70227422168', '1632973541997-971a2eb8331d'] },
    { name: 'Drawing & Painting Book Set', category: 'ArtSupplies', subCategory: 'BirthdayGift', price: 2400, sizes: ['A4'],
      recipients: ['kids', 'teens', 'her'], customization: plain,
      description: 'A thick drawing and painting book with paints, brushes and pencils — for relaxing creative evenings.',
      photos: ['1632494057327-c492dccde461', '1536221993589-9edbbca2c7fc'] },
]
