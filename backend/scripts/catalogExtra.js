// Custom printing, cakes and cultural / life-event gifts.
// Photos are Unsplash images (free for commercial use) and are illustrative —
// replace them with photos of your own products from the admin panel.

const printGift = { name: false, message: true, ribbon: false, wrap: true, addOns: false, photo: true, print: true, cake: false }
const cake = { name: true, message: false, ribbon: false, wrap: false, addOns: true, photo: false, print: false, cake: true }
const photoCake = { ...cake, photo: true }
const festive = { name: true, message: true, ribbon: true, wrap: true, addOns: true, photo: false, print: false, cake: false }

export const extraProducts = [
    // ---- Custom printing (memories made into gifts)
    {
        name: 'Custom Photo Mug', category: 'CustomPrint', subCategory: 'BirthdayGift', price: 3600, sizes: ['11 oz', '15 oz'], sizePrices: { '11 oz': 3600, '15 oz': 4500 }, bestseller: true, customization: printGift,
        description: 'Your favourite photo and words printed on a glossy ceramic mug. Dishwasher-safe print that keeps the memory bright every morning.',
        photos: ['1576962101359-dc312a5ee63b', '1640978216529-9ff630d05ba1'],
    },
    {
        name: 'Custom Printed T-Shirt', category: 'CustomPrint', subCategory: 'SurpriseGift', price: 5400, sizes: ['S', 'M', 'L', 'XL'], customization: printGift,
        description: 'Soft cotton tee printed with your photo, artwork or a line that means something — perfect for birthdays, family trips and matching couple outfits.',
        photos: ['1685883518316-355533810d68', '1651761179569-4ba2aa054997'],
    },
    {
        name: 'Memory Canvas Print', category: 'CustomPrint', subCategory: 'AnniversaryGift', price: 8400, sizes: ['8x10 in', '12x16 in', '16x20 in'], sizePrices: { '8x10 in': 8400, '12x16 in': 11400, '16x20 in': 15600 }, bestseller: true, customization: printGift,
        description: 'Turn a wedding, family or travel photo into gallery-quality canvas art on a wooden frame, ready to hang.',
        photos: ['1677658990649-b50fe2cedd68', '1790145901057-2f309d0260ca'],
    },
    {
        name: 'Family Photo Collage Frame', category: 'CustomPrint', subCategory: 'HousewarmingGift', price: 7800, sizes: ['Medium', 'Large'], sizePrices: { 'Medium': 7800, 'Large': 10800 }, customization: printGift,
        description: 'Several favourite moments arranged in one collage frame — a warm gift for a new home or a family celebration.',
        photos: ['1760914939520-fbd46a74dbd9'],
    },
    {
        name: 'Photo Print Cushion', category: 'CustomPrint', subCategory: 'ValentineGift', price: 6000, sizes: ['16 in', '18 in'], sizePrices: { '16 in': 6000, '18 in': 7200 }, customization: printGift,
        description: 'A soft cushion printed with your photo and message on the front — cosy, personal and made to be hugged.',
        photos: ['1575276510486-aa55619a8170', '1550230426-453a4378ea4e'],
    },

    // ---- Cakes (choose a design, then customise)
    {
        name: 'Chocolate Celebration Cake', category: 'Cake', subCategory: 'BirthdayGift', price: 7200, sizes: ['0.5 kg', '1 kg', '2 kg'], sizePrices: { '0.5 kg': 4200, '1 kg': 7200, '2 kg': 13200 }, bestseller: true, customization: cake,
        description: 'Moist chocolate layers with silky ganache and buttercream roses, finished with your message on top.',
        photos: ['1606983340126-99ab4feaa64a', '1625649611137-df49dc542f6a'],
    },
    {
        name: 'Photo Print Birthday Cake', category: 'Cake', subCategory: 'BirthdayGift', price: 9000, sizes: ['1 kg', '2 kg'], sizePrices: { '1 kg': 9000, '2 kg': 15600 }, bestseller: true, customization: photoCake,
        description: 'Upload a photo and we print it on the cake with edible ink — the birthday cake they will remember.',
        photos: ['1551879403-6adb554966fd', '1545696563-af8f6ec2295a'],
    },
    {
        name: 'Red Velvet Heart Cake', category: 'Cake', subCategory: 'AnniversaryGift', price: 8400, sizes: ['0.5 kg', '1 kg', '2 kg'], sizePrices: { '0.5 kg': 4800, '1 kg': 8400, '2 kg': 15600 }, customization: cake,
        description: 'Velvety red sponge with cream-cheese frosting — made for anniversaries, proposals and Valentine’s Day.',
        photos: ['1688153009623-0d9a3ba1b105', '1714949134591-d6f2c581b20d'],
    },
    {
        name: 'Sri Lankan Ribbon Cake', category: 'Cake', subCategory: 'BirthdayGift', price: 6000, sizes: ['0.5 kg', '1 kg', '2 kg'], sizePrices: { '0.5 kg': 3600, '1 kg': 6000, '2 kg': 11400 }, customization: cake,
        description: 'The classic colourful layered ribbon cake loved at every Sri Lankan celebration, with butter icing.',
        photos: ['1600653155864-88227b5b64b0', '1662398514537-365a09131a1f'],
    },
    {
        name: 'Unicorn Kids Party Cake', category: 'Cake', subCategory: 'BirthdayGift', price: 9600, sizes: ['1 kg', '2 kg'], sizePrices: { '1 kg': 9600, '2 kg': 17400 }, customization: cake,
        description: 'A dreamy pastel unicorn design with a golden horn — the star of any kids’ birthday party. Chat with us for other themes.',
        photos: ['1557164158-11e97f2bb220', '1553710120-23dd1551da41'],
    },
    {
        name: 'Two-Tier Wedding Cake', category: 'Cake', subCategory: 'WeddingGift', price: 28500, sizes: ['3 kg', '5 kg'], sizePrices: { '3 kg': 28500, '5 kg': 45000 }, customization: cake,
        description: 'Elegant two-tier cake with fresh-flower styling for weddings, engagements and homecomings. Chat with us to match your colours.',
        photos: ['1542007920-992d2c424d09', '1581745069539-1e60d7f965f4'],
    },

    // ---- Life events
    {
        name: 'Housewarming Brass Lamp Set', category: 'Festive', subCategory: 'HousewarmingGift', price: 13500, sizes: ['Standard'], bestseller: true, customization: festive,
        description: 'A traditional brass oil lamp (pahana / kuthuvilakku) with wicks and oil — an auspicious first light for a new home, welcomed in Sinhala, Tamil and Indian homes alike.',
        photos: ['1771929712047-3e7022669175', '1783255571174-d329a3895407'],
    },
    {
        name: 'New Home Plant Gift', category: 'Festive', subCategory: 'HousewarmingGift', price: 7800, sizes: ['Small', 'Large'], sizePrices: { 'Small': 7800, 'Large': 11400 }, customization: festive,
        description: 'An easy-care indoor plant in a ceramic pot with a gift tag — growth and good luck for the new home.',
        photos: ['1614594975525-e45190c55d0b', '1647631703145-01e8bf7cd149'],
    },
    {
        name: 'New Baby Welcome Hamper', category: 'GiftHamper', subCategory: 'BabyGift', price: 14400, sizes: ['Standard'], customization: festive,
        description: 'Soft baby clothes, a plush toy and gentle care essentials in a keepsake basket for the new arrival and proud parents.',
        photos: ['1635874714425-c342060a4c58', '1768693602418-260d828b878d'],
    },
    {
        name: 'Graduation Congratulations Box', category: 'GiftHamper', subCategory: 'GraduationGift', price: 10200, sizes: ['Standard'], customization: festive,
        description: 'Chocolates, a keepsake card and a little celebration in a box — for the graduate who made everyone proud.',
        photos: ['1636231945376-3d40fdcbc462', '1623945352596-36d5d9f21f70'],
    },

    // ---- Festivals & culture
    {
        name: 'Avurudu Sweets Hamper', category: 'Festive', subCategory: 'AvuruduGift', price: 12000, sizes: ['Standard', 'Family'], sizePrices: { 'Standard': 12000, 'Family': 19500 }, bestseller: true, customization: festive,
        description: 'Kavum, kokis, aluwa, mung kavum and athirasa packed for the Sinhala & Tamil New Year — perfect for visiting relatives and elders.',
        photos: ['1695568181363-af5c78f4d059', '1773450970981-793e2d72d820'],
    },
    {
        name: 'Diwali Mithai & Diya Box', category: 'Festive', subCategory: 'DiwaliGift', price: 10800, sizes: ['Standard', 'Large'], sizePrices: { 'Standard': 10800, 'Large': 16200 }, customization: festive,
        description: 'Assorted Indian sweets with hand-painted clay diyas to light up the Festival of Lights.',
        photos: ['1758910536889-43ce7b3199fd', '1577083753695-e010191bacb5'],
    },
    {
        name: 'Thai Pongal Celebration Hamper', category: 'Festive', subCategory: 'PongalGift', price: 9000, sizes: ['Standard'], customization: festive,
        description: 'A decorated clay pongal pot with rice, jaggery, cashews and raisins — everything for the Tamil harvest festival.',
        photos: ['1732603891196-2b8cc24f39a5', '1695568181558-034b7d3e49eb'],
    },
    {
        name: 'Eid Dates & Nuts Gift Box', category: 'Festive', subCategory: 'EidGift', price: 9600, sizes: ['Standard', 'Large'], sizePrices: { 'Standard': 9600, 'Large': 14400 }, customization: festive,
        description: 'Premium dates and roasted nuts in an elegant box — a thoughtful Eid Mubarak gift for family and friends.',
        photos: ['1648288725055-5ba4063355b9', '1648288725056-8620f860a345'],
    },
    {
        name: 'Christmas Love Cake Hamper', category: 'Festive', subCategory: 'ChristmasGift', price: 15000, sizes: ['Standard'], customization: festive,
        description: 'Sri Lankan love cake, rich Christmas cake, festive cookies and treats in a gift basket for the season.',
        photos: ['1668432321756-5109ad1f5916', '1577653937338-08c5ade88153'],
    },
]
