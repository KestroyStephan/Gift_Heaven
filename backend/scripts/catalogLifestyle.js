// Toys, baby, jewellery, plants, home décor, stationery, art, games and gift packages.
// Photos are Unsplash images (free for commercial use) and are illustrative.

const plain = { name: true, message: true, ribbon: true, wrap: true, addOns: true, photo: false, print: false, cake: false, engrave: false }
const engrave = { ...plain, addOns: false, engrave: true }

export const lifestyleProducts = [
    // ---- Kids & toys
    { name: 'Wooden Building Blocks Set', category: 'Toys', subCategory: 'BirthdayGift', price: 6600, sizes: ['50 pcs', '100 pcs'], sizePrices: { '50 pcs': 6600, '100 pcs': 10500 }, recipients: ['kids'], bestseller: true, customization: plain,
      description: 'Colourful, smooth-sanded wooden blocks that grow with your child — stacking, counting and building towers. Non-toxic paint.',
      photos: ['1575364289437-fb1479d52732', '1535572290543-960a8046f5af'] },
    { name: 'Unicorn Plush Toy', category: 'Toys', subCategory: 'BirthdayGift', price: 5400, sizes: ['Small', 'Large'], sizePrices: { Small: 5400, Large: 8400 }, recipients: ['kids', 'her'], customization: plain,
      description: 'A super-soft pastel unicorn with a golden horn, made for cuddles and sweet dreams.',
      photos: ['1648070201547-9d6ef53d3a51', '1564470939458-1289338e2d85'] },
    { name: 'Remote Control Racing Car', category: 'Toys', subCategory: 'BirthdayGift', price: 10500, sizes: ['Standard'], recipients: ['kids', 'teens'], customization: plain,
      description: 'A fast, rechargeable remote control car with drift tyres — hours of racing fun indoors and out. Ages 6+.',
      photos: ['1758964087156-0eac97044f84', '1591438252948-fa5dd3701c2a'] },
    { name: 'Wooden Animal Puzzle', category: 'Toys', subCategory: 'BabyGift', price: 4500, sizes: ['Standard'], recipients: ['kids', 'baby'], customization: plain,
      description: 'Chunky wooden animal pieces for little hands — builds shape recognition and fine motor skills. Ages 2+.',
      photos: ['1703581698778-2224c729135b', '1589495374906-b7f5ca5de879'] },
    { name: "Children's Storybook Set", category: 'Toys', subCategory: 'BirthdayGift', price: 6000, sizes: ['Ages 3–5', 'Ages 6–9'], recipients: ['kids'], customization: plain,
      description: 'A bundle of beautifully illustrated storybooks to spark imagination and a love of reading. Tell us the language you prefer in your note.',
      photos: ['1455884981818-54cb785db6fc', '1497633762265-9d179a990aa6'] },

    // ---- Baby
    { name: 'Baby Clothing Gift Set', category: 'Baby', subCategory: 'BabyGift', price: 7800, sizes: ['0–3 m', '3–6 m', '6–12 m'], recipients: ['baby'], customization: plain,
      description: 'Soft cotton outfits, a cap and socks in a gift box — gentle on newborn skin and ready to wear.',
      photos: ['1774874017217-c441aa77c73b', '1647761270253-4aa0374cc227'] },
    { name: 'Soft Baby Blanket & Teddy', category: 'Baby', subCategory: 'BabyGift', price: 9000, sizes: ['Standard'], recipients: ['baby'], bestseller: true, customization: { ...plain, engrave: true },
      description: 'A cosy, breathable blanket with a matching teddy. Add the baby’s name to be embroidered on the blanket.',
      photos: ['1566004100631-35d015d6a491', '1559454403-b8fb88521f11'] },

    // ---- Jewellery
    { name: 'Silver Heart Pendant Necklace', category: 'Jewellery', subCategory: 'ValentineGift', price: 11400, sizes: ['Standard'], recipients: ['her', 'couples'], bestseller: true, customization: engrave,
      description: 'A polished silver heart pendant on a fine chain, presented in a gift box. Add initials or a date to be engraved on the back.',
      photos: ['1588444837495-c6cfeb53f32d', '1623321673989-830eff0fd59f'] },
    { name: 'Personalised Charm Bracelet', category: 'Jewellery', subCategory: 'BirthdayGift', price: 9600, sizes: ['Small', 'Medium', 'Large'], recipients: ['her', 'teens'], customization: engrave,
      description: 'A delicate silver bracelet with heart charms. Engrave a name or a short word on the tag.',
      photos: ['1676291055501-286c48bb186f'] },
    { name: 'Pearl Stud Earrings', category: 'Jewellery', subCategory: 'AnniversaryGift', price: 8400, sizes: ['Standard'], recipients: ['her', 'elders'], customization: plain,
      description: 'Classic freshwater pearl studs — timeless for mothers, grandmothers and anyone who loves understated elegance.',
      photos: ['1590166223826-12dee1677420', '1704957205327-9fbd44d683b7'] },
    { name: "Men's Silver Link Bracelet", category: 'Jewellery', subCategory: 'BirthdayGift', price: 10200, sizes: ['M', 'L'], recipients: ['him'], customization: engrave,
      description: 'A bold stainless-silver link bracelet with an engravable clasp — a gift he will wear every day.',
      photos: ['1612450362046-91773458b103'] },
    { name: 'Couple Promise Rings', category: 'Jewellery', subCategory: 'ValentineGift', price: 16500, sizes: ['Pair'], recipients: ['couples'], customization: engrave,
      description: 'A matching pair of silver bands for him and her, engraved with your initials or a date. Send your ring sizes in the gift note or chat.',
      photos: ['1565206077212-4eb48d41f54b', '1550368566-f9cc32d7392d'] },

    // ---- Plants & pots
    { name: 'Succulent Trio in Pots', category: 'Plants', subCategory: 'HousewarmingGift', price: 7200, sizes: ['Standard'], recipients: ['her', 'elders', 'teens'], bestseller: true, customization: plain,
      description: 'Three easy-care succulents in terracotta pots — a little green joy for desks, windowsills and new homes.',
      photos: ['1768278929490-693db7c11169', '1789381665451-67176c81a402'] },
    { name: 'Lucky Bamboo', category: 'Plants', subCategory: 'HousewarmingGift', price: 4800, sizes: ['2 stems', '5 stems'], sizePrices: { '2 stems': 4800, '5 stems': 7200 }, recipients: ['elders', 'him', 'her'], customization: plain,
      description: 'Lucky bamboo in a glass vase, believed to bring good fortune — loved for housewarmings, new offices and festivals.',
      photos: ['1643754547206-97f97802b916', '1643659075097-6380a0981580'] },
    { name: 'Hand-painted Clay Pot Set', category: 'Plants', subCategory: 'HousewarmingGift', price: 6000, sizes: ['Set of 3'], recipients: ['elders', 'her'], customization: plain,
      description: 'Colourful hand-painted clay pots made by local artisans — ready for herbs, flowers or succulents.',
      photos: ['1768321481665-b40705ab11ce', '1642240139777-ddb34783e627'] },

    // ---- Home décor
    { name: 'Wooden Wall Clock', category: 'HomeDecor', subCategory: 'HousewarmingGift', price: 9000, sizes: ['Standard'], recipients: ['elders', 'couples'], customization: engrave,
      description: 'A warm wooden wall clock with a silent movement. Engrave the family name for a lasting housewarming gift.',
      photos: ['1609980775647-1fb1ef376268', '1558603655-491ecfa8324f'] },
    { name: 'Wooden Table Clock', category: 'HomeDecor', subCategory: 'GraduationGift', price: 6600, sizes: ['Standard'], recipients: ['him', 'elders', 'teens'], customization: engrave,
      description: 'A minimalist wooden desk clock — a stylish addition to a study table or office desk.',
      photos: ['1764933173636-f8b2019a9a52', '1787168295494-56b1d2ed01b7'] },
    { name: 'Crystal Glass Set', category: 'HomeDecor', subCategory: 'WeddingGift', price: 10800, sizes: ['Set of 6'], recipients: ['couples', 'elders'], customization: plain,
      description: 'Six cut-crystal drinking glasses in a presentation box — elegant for weddings, housewarmings and anniversaries.',
      photos: ['1595788238417-b909a98cf393', '1610821165783-f58cafc76571'] },
    { name: 'Abstract Canvas Wall Painting', category: 'HomeDecor', subCategory: 'HousewarmingGift', price: 14400, sizes: ['16x20 in', '24x36 in'], sizePrices: { '16x20 in': 14400, '24x36 in': 25500 }, recipients: ['couples', 'her', 'him'], customization: plain,
      description: 'A vibrant abstract painting on stretched canvas, ready to hang — brings colour and life to any wall. Ask in chat for a custom painting.',
      photos: ['1541961017774-22349e4a1262', '1552312097-8ef75595e2a2'] },

    // ---- Stationery & key tags
    { name: 'Engraved Pen Gift Box', category: 'Stationery', subCategory: 'GraduationGift', price: 7200, sizes: ['Standard'], recipients: ['him', 'elders', 'teens'], bestseller: true, customization: engrave,
      description: 'A smooth-writing metal pen in a gift box, engraved with a name — perfect for graduates, teachers and professionals.',
      photos: ['1636997112337-4f0a138fd377', '1725758262816-82bd52caef56'] },
    { name: 'Personalised Leather Key Tag', category: 'Stationery', subCategory: 'SurpriseGift', price: 3000, sizes: ['Standard'], recipients: ['him', 'couples', 'teens'], customization: engrave,
      description: 'Genuine leather key tag embossed with initials, a name or a date — small, personal and used every day.',
      photos: ['1676276550349-580c49631496'] },
    { name: 'Leather Journal & Pen Set', category: 'Stationery', subCategory: 'GraduationGift', price: 7800, sizes: ['A5'], recipients: ['teens', 'her', 'him'], customization: engrave,
      description: 'A refillable leather journal with a matching pen for dreams, plans and memories. Emboss a name on the cover.',
      photos: ['1654542645651-5196f4931cd6', '1677064061401-f77f966ff8a1'] },

    // ---- Art & drawing
    { name: '48 Colour Pencil Set', category: 'ArtSupplies', subCategory: 'BirthdayGift', price: 4200, sizes: ['24 colours', '48 colours'], sizePrices: { '24 colours': 2700, '48 colours': 4200 }, recipients: ['kids', 'teens'], customization: plain,
      description: 'Rich, blendable colour pencils in a tin — for colouring books, sketching and school art projects.',
      photos: ['1513542789411-b6a5d4f31634', '1607081758973-b85919737e26'] },
    { name: 'Kids Painting & Drawing Kit', category: 'ArtSupplies', subCategory: 'BirthdayGift', price: 7500, sizes: ['Standard'], recipients: ['kids'], bestseller: true, customization: plain,
      description: 'Washable paints, crayons, brushes and a sketch pad in one box — everything a little artist needs.',
      photos: ['1536221993589-9edbbca2c7fc', '1632494057327-c492dccde461'] },
    { name: 'Watercolour Paint Set with Brushes', category: 'ArtSupplies', subCategory: 'SurpriseGift', price: 9000, sizes: ['Standard'], recipients: ['teens', 'her', 'elders'], customization: plain,
      description: 'Artist-quality watercolour pans with a set of brushes — a calming hobby gift for beginners and enthusiasts.',
      photos: ['1499892477393-f675706cbe6e', '1688846413539-ad1e4a67f392'] },
    { name: 'Artist Sketchbook Set', category: 'ArtSupplies', subCategory: 'GraduationGift', price: 5400, sizes: ['A5', 'A4'], sizePrices: { A5: 5400, A4: 7200 }, recipients: ['teens'], customization: engrave,
      description: 'Thick drawing paper sketchbook with graphite pencils and an eraser. Add a name to the cover.',
      photos: ['1635183783375-98e857771351', '1671489692177-f1362c463ac3'] },

    // ---- Games
    { name: 'Wooden Chess Board Set', category: 'Games', subCategory: 'BirthdayGift', price: 12000, sizes: ['Standard'], recipients: ['him', 'elders', 'teens'], bestseller: true, customization: engrave,
      description: 'A handcrafted wooden chess board with weighted pieces and storage. Engrave a name on the board for a family heirloom.',
      photos: ['1695480542225-bc22cac128d0', '1602968407815-5963b28c66af'] },
    { name: '1000-Piece Jigsaw Puzzle', category: 'Games', subCategory: 'ThankYouGift', price: 5400, sizes: ['Standard'], recipients: ['elders', 'couples', 'teens'], customization: plain,
      description: 'A relaxing 1000-piece puzzle — great for family evenings and grandparents who love a challenge. Ask us to make one from your own photo.',
      photos: ['1612611741189-a9b9eb01d515'] },

    // ---- Gift packages (lovers, him, her, elders, teens)
    { name: 'Romantic Date Night Package', category: 'GiftPackage', subCategory: 'ValentineGift', price: 18000, sizes: ['Standard', 'Deluxe'], sizePrices: { Standard: 18000, Deluxe: 28500 }, recipients: ['couples'], bestseller: true, customization: plain,
      description: 'Roses, scented candles, premium chocolates and a love note — everything for an unforgettable evening for two.',
      photos: ['1707248592051-4be0ecc8c204', '1772986239695-a22c21b9eb23'] },
    { name: 'His & Hers Gift Box', category: 'GiftPackage', subCategory: 'AnniversaryGift', price: 16500, sizes: ['Standard'], recipients: ['couples'], customization: plain,
      description: 'A matching pair of gifts for the couple — personalised mugs, treats and keepsakes in one beautiful box.',
      photos: ['1625552187571-7ee60ac43d2b', '1545844568-98bb15133ec0'] },
    { name: "Gentleman's Watch & Wallet Set", category: 'GiftPackage', subCategory: 'BirthdayGift', price: 19500, sizes: ['Standard'], recipients: ['him'], customization: engrave,
      description: 'A classic analogue watch with a leather wallet in a gift box — for boyfriends, husbands, fathers and brothers. Engrave initials on the wallet.',
      photos: ['1709639288121-efe2eb002517', '1637169797848-12431f1d355c'] },
    { name: 'Pamper Me Spa Gift Set', category: 'GiftPackage', subCategory: 'BirthdayGift', price: 12600, sizes: ['Standard'], recipients: ['her'], customization: plain,
      description: 'Scented candles, bath salts, body butter and a soft towel — a spa day at home for girlfriends, wives, mothers and sisters.',
      photos: ['1643122966676-29e8597257f7', '1669093234697-b28cee17fbfb'] },
    { name: "Elders' Wellness Hamper", category: 'GiftPackage', subCategory: 'ThankYouGift', price: 11400, sizes: ['Standard'], recipients: ['elders'], customization: plain,
      description: 'Herbal teas, healthy snacks, a soft shawl and a handwritten card — thoughtful care for grandparents and elders.',
      photos: ['1730584934611-03b7eb49e3a8'] },
    { name: 'Teen Music Gift Set', category: 'GiftPackage', subCategory: 'BirthdayGift', price: 13500, sizes: ['Standard'], recipients: ['teens'], customization: plain,
      description: 'Wireless headphones with a fun accessory pack — the birthday gift every teenager actually wants.',
      photos: ['1505740420928-5e560c06d30e', '1613040809024-b4ef7ba99bc3'] },
]

// Who the existing catalogue suits
export const recipientsByName = {
    'Kit Kat Cameo': ['teens', 'kids'], 'Ferrero Gold Bucket': ['her', 'couples', 'elders'], 'Dairy Milk Delight': ['kids', 'teens'],
    'Valentine Hearts Bucket': ['couples', 'her'], 'Blush Rose Bouquet': ['her', 'couples'], 'Red Velvet Roses': ['her', 'couples'],
    'Sunshine Birthday Bouquet': ['her', 'elders'], 'Rose & Chocolate Duo': ['her', 'couples'], 'Celebration Hamper': ['couples', 'elders'],
    'Thank You Treat Hamper': ['elders', 'him', 'her'], 'Wedding Wishes Hamper': ['couples'], 'Cuddle Bear with Heart': ['her', 'couples', 'kids'],
    'Birthday Teddy & Balloon': ['kids', 'her'], 'Anniversary Love Box': ['couples', 'her'], 'Surprise Heart Box': ['her', 'couples'],
    'Forever Yours Photo Frame': ['couples'], 'Mr & Mrs Keepsake Frame': ['couples'], 'Custom Photo Mug': ['him', 'her', 'elders', 'teens'],
    'Custom Printed T-Shirt': ['teens', 'him', 'her'], 'Memory Canvas Print': ['couples', 'elders'], 'Family Photo Collage Frame': ['elders', 'couples'],
    'Photo Print Cushion': ['her', 'couples', 'teens'], 'Chocolate Celebration Cake': ['kids', 'teens', 'him', 'her'], 'Photo Print Birthday Cake': ['kids', 'elders', 'him', 'her'],
    'Red Velvet Heart Cake': ['couples', 'her'], 'Sri Lankan Ribbon Cake': ['kids', 'elders'], 'Unicorn Kids Party Cake': ['kids'],
    'Two-Tier Wedding Cake': ['couples'], 'Housewarming Brass Lamp Set': ['elders', 'couples'], 'New Home Plant Gift': ['couples', 'elders'],
    'New Baby Welcome Hamper': ['baby'], 'Graduation Congratulations Box': ['teens'], 'Avurudu Sweets Hamper': ['elders', 'kids'],
    'Diwali Mithai & Diya Box': ['elders'], 'Thai Pongal Celebration Hamper': ['elders'], 'Eid Dates & Nuts Gift Box': ['elders'],
    'Christmas Love Cake Hamper': ['elders', 'kids'],
}
