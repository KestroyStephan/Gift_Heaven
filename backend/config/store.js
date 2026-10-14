// Store-wide settings shared by every payment method.
// The frontend displays the same values (see Frontend ShopContext), so keep them in sync.
export const currency = (process.env.STORE_CURRENCY || 'lkr').toLowerCase()
export const deliveryCharge = Number(process.env.DELIVERY_FEE || 500)
export const storeName = process.env.STORE_NAME || 'Surprise Heaven'
export const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

export const orderStatuses = ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled']
