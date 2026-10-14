// Water bottles, mugs, jugs, tea & dinner sets and table décor. Prices in LKR.
// Photos are Unsplash images (free for commercial use) and are illustrative.

const plain = { name: true, message: true, ribbon: true, wrap: true, addOns: true, photo: false, print: false, cake: false, engrave: false }
const engrave = { ...plain, engrave: true }

export const kitchenProducts = [
    // ---- Water bottles & tumblers
    { name: 'Insulated Steel Water Bottle', category: 'KitchenDining', subCategory: 'BirthdayGift', price: 3500, sizes: ['500 ml', '750 ml'], sizePrices: { '500 ml': 3500, '750 ml': 4500 }, recipients: ['teens', 'him', 'her', 'elders'], bestseller: true, customization: engrave,
      description: 'Double-wall stainless steel bottle that keeps drinks cold for 24 hours and hot for 12. Engrave a name to make it theirs.',
      photos: ['1625708458528-802ec79b1ed8', '1602143407151-7111542de6e8'] },
    { name: 'Kids Cartoon Water Bottle', category: 'KitchenDining', subCategory: 'BirthdayGift', price: 1950, sizes: ['400 ml'], recipients: ['kids'], customization: engrave,
      description: 'Leak-proof, BPA-free bottle with a flip straw and fun cartoon prints — perfect for school bags. Add the child’s name.',
      photos: ['1758899056905-3863af86cc49', '1633354509816-ad13f6fd4276'] },
    { name: 'Glass Water Bottle with Sleeve', category: 'KitchenDining', subCategory: 'ThankYouGift', price: 2800, sizes: ['550 ml'], recipients: ['her', 'teens'], customization: plain,
      description: 'A clear borosilicate glass bottle with a protective sleeve — stylish, eco-friendly and easy to clean.',
      photos: ['1591704951890-0862b2e98acb', '1566557087503-b839ce6e5aa0'] },
    { name: 'Travel Coffee Tumbler', category: 'KitchenDining', subCategory: 'GraduationGift', price: 3900, sizes: ['350 ml', '500 ml'], sizePrices: { '350 ml': 3900, '500 ml': 4600 }, recipients: ['him', 'teens', 'her'], customization: engrave,
      description: 'Spill-proof insulated tumbler for the daily commute — tea and coffee stay hot for hours. Engrave initials on the side.',
      photos: ['1544003484-3cd181d17917', '1604713055037-ef1ec567a47b'] },

    // ---- Mugs
    { name: 'Ceramic Coffee Mug Set', category: 'KitchenDining', subCategory: 'HousewarmingGift', price: 3200, sizes: ['Set of 2', 'Set of 4'], sizePrices: { 'Set of 2': 3200, 'Set of 4': 5800 }, recipients: ['couples', 'elders'], customization: plain,
      description: 'Classic glazed ceramic mugs in a gift box — for slow mornings and evening tea.',
      photos: ['1523367118146-091f762cd8ea', '1590422749897-47036da0b0ff'] },
    { name: 'Couple Mug Set', category: 'KitchenDining', subCategory: 'ValentineGift', price: 3500, sizes: ['Pair'], recipients: ['couples'], bestseller: true, customization: engrave,
      description: 'A matching pair of mugs for two — add both names or a special date. For photo mugs see Custom Photo Mug.',
      photos: ['1542556398-95fb5b9f9b48', '1687158179173-b9f3eac1fde9'] },
    { name: 'Heart Handle Mug', category: 'KitchenDining', subCategory: 'ValentineGift', price: 1900, sizes: ['Standard'], recipients: ['her', 'couples'], customization: plain,
      description: 'A white ceramic mug with a heart-shaped handle — a small, sweet way to say “thinking of you”.',
      photos: ['1590422886897-7dd50e58577e'] },

    // ---- Jugs, tea & dinner sets
    { name: 'Glass Jug & Tumbler Set', category: 'KitchenDining', subCategory: 'HousewarmingGift', price: 6500, sizes: ['Jug + 6 glasses'], recipients: ['couples', 'elders'], bestseller: true, customization: plain,
      description: 'A 1.5 litre glass jug with six matching tumblers — a practical, elegant gift for a new home.',
      photos: ['1620877138710-e086a5f24b46', '1656870936057-451a9ec969a0'] },
    { name: 'Diamond-cut Glass Pitcher', category: 'KitchenDining', subCategory: 'WeddingGift', price: 4800, sizes: ['1.2 L'], recipients: ['couples', 'elders'], customization: plain,
      description: 'A sparkling diamond-pattern glass pitcher for water, juice and faluda at family gatherings.',
      photos: ['1743187360373-513ac4a7266f'] },
    { name: 'Ceramic Tea Set', category: 'KitchenDining', subCategory: 'HousewarmingGift', price: 9500, sizes: ['Teapot + 4 cups', 'Teapot + 6 cups'], sizePrices: { 'Teapot + 4 cups': 9500, 'Teapot + 6 cups': 12500 }, recipients: ['elders', 'couples'], customization: plain,
      description: 'A hand-painted ceramic teapot with matching cups — made for Ceylon tea with guests, elders and in-laws.',
      photos: ['1721373489867-b95a7b3fe16c', '1642145239592-a3ad7308726d'] },
    { name: 'Dinner Set', category: 'KitchenDining', subCategory: 'WeddingGift', price: 14500, sizes: ['16 pieces', '24 pieces'], sizePrices: { '16 pieces': 14500, '24 pieces': 21000 }, recipients: ['couples', 'elders'], customization: plain,
      description: 'Plates, side plates and bowls in a durable glazed finish — a lasting wedding or housewarming gift.',
      photos: ['1551807306-4bcd16b92a41', '1571987530791-58e3e7744d99'] },
    { name: 'Gold Cutlery Set', category: 'KitchenDining', subCategory: 'WeddingGift', price: 7500, sizes: ['16 pieces', '24 pieces'], sizePrices: { '16 pieces': 7500, '24 pieces': 10500 }, recipients: ['couples'], customization: plain,
      description: 'Gold-finish stainless steel forks, spoons and knives in a presentation box — for festive tables.',
      photos: ['1552755626-e820b5d95031', '1715690998852-69a19bd02885'] },

    // ---- Table décor
    { name: 'Table Runner & Placemat Set', category: 'KitchenDining', subCategory: 'HousewarmingGift', price: 5500, sizes: ['6 seater', '8 seater'], sizePrices: { '6 seater': 5500, '8 seater': 6900 }, recipients: ['couples', 'elders'], customization: plain,
      description: 'A woven table runner with matching placemats and napkins to dress the dining table for every celebration.',
      photos: ['1688350526777-012623237ae2', '1780337092383-1116491fda49'] },
    { name: 'Floral Candle Table Centerpiece', category: 'KitchenDining', subCategory: 'AnniversaryGift', price: 6800, sizes: ['Standard'], recipients: ['couples', 'her'], customization: plain,
      description: 'Fresh-look flowers arranged with tea-light holders — a ready-made centerpiece for anniversaries and dinner parties.',
      photos: ['1529516222410-a269d812f320', '1658177052528-ff08dde99b92'] },
    { name: 'Wooden Serving Board', category: 'KitchenDining', subCategory: 'HousewarmingGift', price: 3800, sizes: ['Standard'], recipients: ['couples', 'elders', 'him'], customization: engrave,
      description: 'A solid wood serving board for snacks, cakes and short eats. Engrave the family name for a personal touch.',
      photos: ['1587302108992-20648821725d', '1557109965-b9bf442aeb97'] },
]
