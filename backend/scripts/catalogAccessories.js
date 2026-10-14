// Collectible cars, drones and fashion accessories.
// Photos are Unsplash images (free for commercial use) and are illustrative.

const plain = { name: true, message: true, ribbon: true, wrap: true, addOns: true, photo: false, print: false, cake: false, engrave: false }
const small = { ...plain, addOns: false }

export const accessoryProducts = [
    // ---- Cars, drones & collectibles
    { name: 'Hot Wheels Die-cast Car Pack', category: 'Toys', subCategory: 'BirthdayGift', price: 12, sizes: ['5-pack', '10-pack'], sizePrices: { '5-pack': 12, '10-pack': 22 }, recipients: ['kids', 'teens', 'him'], bestseller: true, customization: plain,
      description: 'A pack of 1:64 scale Hot Wheels die-cast cars in assorted designs — the classic collectible that kids and grown-up collectors love. Designs vary by pack.',
      photos: ['1515281239448-2abe329fe5e5', '1511415518647-9e5da4fd803f'] },
    { name: "Collector's Die-cast Model Car", category: 'Toys', subCategory: 'BirthdayGift', price: 18, sizes: ['1:36', '1:24'], sizePrices: { '1:36': 18, '1:24': 32 }, recipients: ['him', 'teens'], customization: plain,
      description: 'A detailed metal sports-car replica with opening doors and rubber tyres — a display piece for car enthusiasts.',
      photos: ['1508896694512-1eade558679c', '1609395464110-7116592351c6'] },
    { name: 'Mini Drone for Beginners', category: 'Toys', subCategory: 'BirthdayGift', price: 45, sizes: ['Standard', 'With HD camera'], sizePrices: { Standard: 45, 'With HD camera': 65 }, recipients: ['teens', 'him', 'kids'], bestseller: true, customization: plain,
      description: 'An easy-to-fly mini quadcopter with altitude hold, one-key take-off and propeller guards. The camera model streams video to your phone. Ages 10+.',
      photos: ['1504890135076-e4fcdd71043c', '1527977966376-1c8408f9f108'] },
    { name: 'Monster Truck Toy', category: 'Toys', subCategory: 'BirthdayGift', price: 20, sizes: ['Standard'], recipients: ['kids'], customization: plain,
      description: 'A chunky off-road monster truck with big bouncy tyres — built for backyard adventures and rough play.',
      photos: ['1630029546304-981fdadbb842', '1684770953325-b6a4310b3c57'] },
    { name: 'Slot Car Race Track Set', category: 'Toys', subCategory: 'BirthdayGift', price: 55, sizes: ['Standard'], recipients: ['kids', 'teens', 'him'], customization: plain,
      description: 'Two racing cars, hand controllers and a figure-of-eight track — family race nights guaranteed.',
      photos: ['1778589581022-49b20aeb144a', '1784873921894-f52c2d2efee3'] },

    // ---- Fashion accessories
    { name: 'Golden Hair Claw Clip Set', category: 'Accessories', subCategory: 'BirthdayGift', price: 9, sizes: ['Set of 3', 'Set of 6'], sizePrices: { 'Set of 3': 9, 'Set of 6': 15 }, recipients: ['her', 'teens'], bestseller: true, customization: small,
      description: 'Elegant gold-tone and pearl claw clips that hold every hairstyle — a sweet little gift for sisters and best friends.',
      photos: ['1744177762258-c98418b7a4eb', '1774301844178-c9ce96b76d92'] },
    { name: 'Floral Hair Band', category: 'Accessories', subCategory: 'BirthdayGift', price: 8, sizes: ['Kids', 'Adult'], recipients: ['her', 'kids', 'teens'], customization: small,
      description: 'A pretty floral hair band for parties, weddings and everyday style. Available in kids and adult sizes.',
      photos: ['1549236177-77e8271c34b6', '1581674210501-c760093514e8'] },
    { name: 'Satin Scrunchie Pack', category: 'Accessories', subCategory: 'SurpriseGift', price: 7, sizes: ['Pack of 6'], recipients: ['her', 'teens'], customization: small,
      description: 'Soft satin scrunchies in pastel shades — gentle on hair and perfect for gifting in a little pouch.',
      photos: ['1606772016409-d4a55e32be6e', '1630081757773-a87bffbdea5e'] },
    { name: 'Combo Earring Set', category: 'Accessories', subCategory: 'BirthdayGift', price: 22, sizes: ['6 pairs', '12 pairs'], sizePrices: { '6 pairs': 22, '12 pairs': 35 }, recipients: ['her', 'teens'], bestseller: true, customization: plain,
      description: 'A mix-and-match set of studs, hoops and drop earrings in a gift box — a different look for every day of the week.',
      photos: ['1641290748359-1d944fc8359a', '1668718003259-650efe62fbca'] },
    { name: 'Gold Twisted Hoop Earrings', category: 'Accessories', subCategory: 'AnniversaryGift', price: 18, sizes: ['Small', 'Medium'], recipients: ['her'], customization: plain,
      description: 'Lightweight twisted gold-tone hoops that catch the light — dress them up or down.',
      photos: ['1617038220319-276d3cfab638', '1671644730555-916aa8d8157f'] },
    { name: 'Crystal Stud Earrings', category: 'Accessories', subCategory: 'BirthdayGift', price: 16, sizes: ['Standard'], recipients: ['her', 'elders', 'teens'], customization: plain,
      description: 'Sparkling crystal studs on hypoallergenic posts — timeless for mothers, grandmothers and graduates.',
      photos: ['1693212793204-bcea856c75fe', '1621939745912-aad97fd3a34d'] },
    { name: 'Stackable Bracelet & Bangle Set', category: 'Accessories', subCategory: 'SurpriseGift', price: 19, sizes: ['Standard'], recipients: ['her', 'teens'], customization: plain,
      description: 'A stack of beaded bracelets and slim bangles to wear together or share with a friend.',
      photos: ['1723144290967-b9a692207d04', '1724720790533-160d6280fd81'] },
    { name: 'Gold Chain Anklet', category: 'Accessories', subCategory: 'ValentineGift', price: 14, sizes: ['Standard'], recipients: ['her'], customization: { ...plain, engrave: true },
      description: 'A delicate gold-tone chain anklet with an adjustable clasp. Add an initial charm by entering it in the engraving box.',
      photos: ['1602173574767-37ac01994b2a'] },
]
