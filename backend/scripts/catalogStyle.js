// Shoes, sunglasses and makeup & beauty. Prices in LKR.
// Photos are Unsplash images (free for commercial use) and are illustrative —
// chosen without visible brand logos so no brand is implied.

const plain = { name: true, message: true, ribbon: true, wrap: true, addOns: true, photo: false, print: false, cake: false, engrave: false }

const adultSizes = ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44']
const womenSizes = ['EU 35', 'EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40']
const menSizes = ['EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44']

export const styleProducts = [
    // ---- Shoes
    { name: 'Classic White Sneakers', category: 'Footwear', subCategory: 'BirthdayGift', price: 8900, sizes: adultSizes, recipients: ['teens', 'him', 'her'], bestseller: true, customization: plain,
      description: 'Clean, comfortable white leather-look sneakers that go with everything. Tell us the size in the size selector — free exchange if it doesn’t fit.',
      photos: ['1625860191460-10a66c7384fb'] },
    { name: 'Women’s Stiletto Heels', category: 'Footwear', subCategory: 'WeddingGift', price: 7500, sizes: womenSizes, recipients: ['her'], customization: plain,
      description: 'Elegant pointed-toe heels with a cushioned insole — made for weddings, parties and special evenings.',
      photos: ['1535043934128-cf0b28d52f95', '1562687848-c1664eff566d'] },
    { name: 'Women’s Black Pumps', category: 'Footwear', subCategory: 'GraduationGift', price: 6900, sizes: womenSizes, recipients: ['her'], customization: plain,
      description: 'Timeless black pumps with a mid heel — comfortable enough for the office, smart enough for evenings out.',
      photos: ['1596702874230-b5706dfb5bc7', '1596703263926-eb0762ee17e4'] },
    { name: 'Women’s Leather Sandals', category: 'Footwear', subCategory: 'SurpriseGift', price: 4500, sizes: ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41'], recipients: ['her', 'elders'], customization: plain,
      description: 'Soft leather strap sandals with a padded footbed — easy everyday comfort for Sri Lankan weather.',
      photos: ['1605445175147-8d2340ea9065', '1619510331283-a46c425e48bb'] },
    { name: 'Men’s Leather Loafers', category: 'Footwear', subCategory: 'BirthdayGift', price: 9500, sizes: menSizes, recipients: ['him'], bestseller: true, customization: plain,
      description: 'Hand-finished leather loafers that slip on easily — smart-casual style for work and weekends.',
      photos: ['1616406432452-07bc5938759d', '1675947258177-aa8120ddefa3'] },
    { name: 'Men’s Formal Leather Shoes', category: 'Footwear', subCategory: 'WeddingGift', price: 11500, sizes: menSizes, recipients: ['him', 'elders'], customization: plain,
      description: 'Polished formal shoes for weddings, interviews and the office, with a comfortable cushioned sole.',
      photos: ['1777987601447-266e128de448', '1787166125913-1a9d9332ec8e'] },
    { name: 'Kids’ Strap Sneakers', category: 'Footwear', subCategory: 'BirthdayGift', price: 3900, sizes: ['EU 24', 'EU 26', 'EU 28', 'EU 30', 'EU 32'], recipients: ['kids'], customization: plain,
      description: 'Easy hook-and-loop sneakers that little ones can put on themselves — light, flexible and fun.',
      photos: ['1678192568478-9488ee55def6', '1678192568444-78b428b7cd1a'] },
    { name: 'Baby Knit Booties', category: 'Footwear', subCategory: 'BabyGift', price: 1800, sizes: ['0–6 m', '6–12 m'], recipients: ['baby'], customization: plain,
      description: 'Hand-knitted soft booties to keep tiny feet warm — a sweet gift for a new arrival.',
      photos: ['1602685365252-c13f549f1f5f', '1513091250092-b06c2b7981bc'] },

    // ---- Sunglasses
    { name: 'Classic Square Sunglasses', category: 'Eyewear', subCategory: 'BirthdayGift', price: 4500, sizes: ['Standard'], recipients: ['him', 'her', 'teens'], bestseller: true, customization: plain,
      description: 'Timeless square frames with UV400 lenses — everyday sun protection with a clean look. Includes a case.',
      photos: ['1584036553516-bf83210aa16c', '1653038282189-803202722a05'] },
    { name: 'Aviator Sunglasses', category: 'Eyewear', subCategory: 'BirthdayGift', price: 5500, sizes: ['Gold frame', 'Silver frame'], recipients: ['him', 'her'], customization: plain,
      description: 'Lightweight metal aviators with gradient UV400 lenses and adjustable nose pads.',
      photos: ['1589642380614-4a8c2147b857', '1661525244755-3dc7926c347a'] },
    { name: 'Women’s Cat-eye Sunglasses', category: 'Eyewear', subCategory: 'SurpriseGift', price: 4900, sizes: ['Standard'], recipients: ['her', 'teens'], customization: plain,
      description: 'Glamorous cat-eye frames with soft-tint lenses — a little Hollywood for everyday outfits.',
      photos: ['1508296695146-257a814070b4'] },
    { name: 'Round Retro Sunglasses', category: 'Eyewear', subCategory: 'SurpriseGift', price: 4200, sizes: ['Standard'], recipients: ['teens', 'her', 'him'], customization: plain,
      description: 'Vintage-inspired round metal frames with UV400 lenses.',
      photos: ['1511499767150-a48a237f0083', '1649119161997-00ffc8c24e11'] },
    { name: 'Kids’ Colourful Sunglasses', category: 'Eyewear', subCategory: 'BirthdayGift', price: 2200, sizes: ['Ages 3–10'], recipients: ['kids'], customization: plain,
      description: 'Bendable, unbreakable frames with UV protection in bright colours — perfect for the beach and school trips.',
      photos: ['1582142366243-0b6a4aca0d99'] },
    { name: 'His & Hers Sunglasses Set', category: 'Eyewear', subCategory: 'ValentineGift', price: 8500, sizes: ['Pair'], recipients: ['couples'], customization: plain,
      description: 'Two matching tortoiseshell sunglasses in a gift box — for honeymoons, holidays and couple photos.',
      photos: ['1559070081-648fb00b2ed1'] },

    // ---- Makeup & beauty
    { name: 'Complete Makeup Kit', category: 'Beauty', subCategory: 'BirthdayGift', price: 9500, sizes: ['Standard'], recipients: ['her', 'teens'], bestseller: true, customization: plain,
      description: 'Eyeshadow palette, blush, lipsticks, mascara and brushes in one gift box — everything for a complete look.',
      photos: ['1596462502278-27bfdc403348', '1679623100266-db82be84f5f3'] },
    { name: 'Pro Makeup Brush Set', category: 'Beauty', subCategory: 'BirthdayGift', price: 3800, sizes: ['10 brushes', '15 brushes'], sizePrices: { '10 brushes': 3800, '15 brushes': 5200 }, recipients: ['her', 'teens'], customization: plain,
      description: 'Ultra-soft synthetic brushes for face and eyes, with a travel pouch.',
      photos: ['1679307658813-da95b901ecd9', '1678695692040-e9a39502c357'] },
    { name: 'Matte Lipstick Collection', category: 'Beauty', subCategory: 'ValentineGift', price: 4200, sizes: ['5 shades'], recipients: ['her', 'teens'], customization: plain,
      description: 'Five long-wearing matte lipsticks from nude to bold red — a shade for every mood.',
      photos: ['1571646034647-52e6ea84b28c', '1631214499500-2e34edcaccfe'] },
    { name: 'Eyeshadow Palette', category: 'Beauty', subCategory: 'SurpriseGift', price: 3500, sizes: ['12 shades'], recipients: ['her', 'teens'], customization: plain,
      description: 'Twelve blendable matte and shimmer shades in soft pinks and warm neutrals.',
      photos: ['1487412912498-0447578fcca8'] },
    { name: 'Face Powder & Brush Set', category: 'Beauty', subCategory: 'ThankYouGift', price: 2900, sizes: ['Light', 'Medium', 'Deep'], recipients: ['her', 'elders'], customization: plain,
      description: 'A silky setting powder with a kabuki brush for a fresh, shine-free finish. Choose your shade.',
      photos: ['1515688594390-b649af70d282'] },
    { name: 'Nail Polish Set', category: 'Beauty', subCategory: 'BirthdayGift', price: 2600, sizes: ['6 colours'], recipients: ['her', 'teens'], customization: plain,
      description: 'Six quick-dry, chip-resistant nail colours with a top coat — a mini manicure kit.',
      photos: ['1667769462514-1fd738b38498', '1636019411480-58321fcb11ce'] },
    { name: 'Skincare Gift Set', category: 'Beauty', subCategory: 'AnniversaryGift', price: 7800, sizes: ['Standard'], recipients: ['her', 'elders'], bestseller: true, customization: plain,
      description: 'Gentle cleanser, toner, serum and moisturiser in a keepsake box — a complete self-care routine.',
      photos: ['1608145264900-e9905d0d6de8', '1765963449601-02d96e3dcfcb'] },
    { name: 'Glow Serum & Cream Duo', category: 'Beauty', subCategory: 'BirthdayGift', price: 5900, sizes: ['Standard'], recipients: ['her'], customization: plain,
      description: 'A brightening vitamin C serum with a light day cream for a natural glow.',
      photos: ['1613803745799-ba6c10aace85', '1721403396830-d290f04c08a4'] },
    { name: 'Pink Beauty Essentials Box', category: 'Beauty', subCategory: 'SurpriseGift', price: 6500, sizes: ['Standard'], recipients: ['her', 'teens'], customization: plain,
      description: 'Lip balm, hand cream, face mist, a mini mirror and more in a pretty pink box — a perfect surprise.',
      photos: ['1583209814683-c023dd293cc6'] },
]
