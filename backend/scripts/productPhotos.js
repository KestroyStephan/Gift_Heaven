// Real product photos from Unsplash (free for commercial use, https://unsplash.com/license).
// Unsplash asks sites to hotlink its images, so these stay as images.unsplash.com URLs.
// Replace them with your own photography any time from the admin panel (Products › Edit).

const unsplash = (id) => `https://images.unsplash.com/photo-${id}?w=1000&h=1000&fit=crop&crop=entropy&q=80&auto=format`

export const productPhotos = {
    'Kit Kat Cameo': ['1552395569-ea6bfadfca2b', '1604815891325-0f9c17688328'],
    'Ferrero Gold Bucket': ['1599939569628-4b16b47c3e8d', '1515472297483-9d89d39c85e8'],
    'Dairy Milk Delight': ['1610450949065-1f2841536c88', '1621939514649-280e2ee25f60'],
    'Valentine Hearts Bucket': ['1644890587854-2ba0a218616d', '1623000850264-08be785877bd'],
    'Blush Rose Bouquet': ['1680563094046-5d846e2c59d1', '1589458456444-f7158a7e8a4f'],
    'Red Velvet Roses': ['1578439231583-9eca0a363860', '1494972308805-463bc619d34e'],
    'Sunshine Birthday Bouquet': ['1673277848241-86e145cd7112', '1724915323838-36e2bf8140c1'],
    'Rose & Chocolate Duo': ['1644745547446-f04a49a3693f', '1681183183805-8100ffb93ec5'],
    'Celebration Hamper': ['1508899203029-1c9eb493c9bd', '1588821323157-9fc67e64659c'],
    'Thank You Treat Hamper': ['1692624015733-dc7de1df64a5', '1554175231-8367073ba4e3'],
    'Wedding Wishes Hamper': ['1674620213535-9b2a2553ef40', '1625552186152-668cd2f0b707'],
    'Cuddle Bear with Heart': ['1613170812802-cb91fe53612b', '1654959245667-ab62c8d00c26'],
    'Birthday Teddy & Balloon': ['1634577004337-1df1fd52f914', '1772080418794-14f925a6fe75'],
    'Anniversary Love Box': ['1764385827123-45525c44373c', '1713496736683-ffb12c754c27'],
    'Surprise Heart Box': ['1641933002427-3354af85963a', '1761040414033-bb0a07473645'],
    'Forever Yours Photo Frame': ['1677658287227-2b48f205b4eb', '1784651858821-6cdf99653f18'],
    'Mr & Mrs Keepsake Frame': ['1595105579635-662c74f88f05', '1784651858796-362ac756617f'],
}

export const photosFor = (name) => (productPhotos[name] || []).map(unsplash)
