import { createContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'
import axios from 'axios'



export const ShopContext = createContext();

// A cart line is keyed by size, or "size~lineId" when the gift is personalised
export const splitKey = (key) => {
    const [size, customId] = String(key).split('~')
    return { size, customId }
}

// Running sales from the server (set by the provider; the server applies the same rules at checkout)
let liveOffers = []

// Price for a size before any offer (cakes, canvases… can cost more in bigger sizes)
export const listPriceOf = (product, size) => {
    const sized = product?.sizePrices?.[size]
    return typeof sized === 'number' ? sized : product?.price || 0
}

// The best running offer for a product at a price: { offer, saving }
export const offerOf = (product, price) => {
    let best = null
    for (const offer of liveOffers) {
        const covers = offer.scope === 'all' || (offer.scope === 'category' && offer.targets.includes(product?.category)) ||
            (offer.scope === 'brand' && offer.targets.includes(product?.brand)) || (offer.scope === 'products' && offer.targets.includes(product?._id))
        if (!covers) continue
        const saving = Math.min(price, Math.round(offer.type === 'percent' ? price * offer.value / 100 : offer.value))
        if (!best || saving > best.saving) best = { offer, saving }
    }
    return best
}

// Price for a size after offers
export const priceOf = (product, size) => {
    const list = listPriceOf(product, size)
    return list - (offerOf(product, list)?.saving || 0)
}

const sizesOf = (product) => {
    const sized = Object.keys(product?.sizePrices || {}).filter(s => typeof product.sizePrices[s] === 'number')
    return sized.length ? sized : [null]
}
// Lowest price across sizes, for "From Rs. X" labels (after offers)
export const fromPrice = (product) => Math.min(...sizesOf(product).map(s => priceOf(product, s)))
export const fromListPrice = (product) => Math.min(...sizesOf(product).map(s => listPriceOf(product, s)))

// How many a customer can buy (Infinity for made-to-order gifts)
export const available = (product) => product?.trackStock ? Math.max(0, product.stock || 0) : Infinity
export const stockLabel = (product) => {
    if (!product?.trackStock) return null
    if (product.stock <= 0) return { text: 'Sold out', tone: 'out' }
    if (product.stock <= (product.lowStock ?? 5)) return { text: `Only ${product.stock} left`, tone: 'low' }
    return { text: 'In stock', tone: 'in' }
}

const readStorage = (key) => {
    try { return JSON.parse(localStorage.getItem(key)) || {} } catch { return {} }
}

const newLineId = () => Math.random().toString(36).slice(2, 10)

const ShopContextProvider = (props) => {

    // Must match STORE_CURRENCY / DELIVERY_FEE in the backend .env
    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || 'Rs. ';
    const delivery_fee = Number(import.meta.env.VITE_DELIVERY_FEE || 500);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
    const [search, setSearch] = useState('')
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState(() => readStorage('guestCart'));
    const [cartCustoms, setCartCustoms] = useState(() => readStorage('guestCustoms'));
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [customOptions, setCustomOptions] = useState(null);
    const [brands, setBrands] = useState([]);
    const [offers, setOffers] = useState([]);
    const [publicCoupons, setPublicCoupons] = useState([]);
    // Coupon typed at checkout; the discount always comes from the server
    const [couponCode, setCouponCode] = useState(() => localStorage.getItem('coupon') || '')
    const [couponResult, setCouponResult] = useState(null)
    const [couponError, setCouponError] = useState('')
    const [couponChecking, setCouponChecking] = useState(false)
    // Saved gifts: kept in the browser for guests, in the account once logged in
    const [wishlist, setWishlist] = useState(() => { try { return JSON.parse(localStorage.getItem('guestWishlist')) || [] } catch { return [] } })
    const [wishlistShare, setWishlistShare] = useState({ shared: false, shareId: null })
    const [token, setToken] = useState(localStorage.getItem('token') || '')
    // Live chat panel (any page can open it with a topic)
    const [chat, setChat] = useState({ open: false, topic: '' })
    const openChat = (topic = '') => setChat({ open: true, topic })
    const closeChat = () => setChat(prev => ({ ...prev, open: false }))
    const navigate = useNavigate();

    const clearCart = () => {
        setCartItems({})
        setCartCustoms({})
        removeCoupon()
    }

    const removeCoupon = () => {
        localStorage.removeItem('coupon')
        setCouponCode('')
        setCouponResult(null)
        setCouponError('')
    }

    const logout = (message) => {
        localStorage.removeItem('token')
        setToken('')
        clearCart()
        setWishlist([])
        setWishlistShare({ shared: false, shareId: null })
        if (message) toast.info(message)
        navigate('/login')
    }

    // Log out when the backend says the session is no longer valid
    const handleAuthError = (data) => {
        if (data?.authError) {
            logout('Your session has expired, please log in again')
            return true
        }
        return false
    }

    // Keep a guest cart in the browser until the customer logs in
    useEffect(() => {
        if (!token) {
            localStorage.setItem('guestCart', JSON.stringify(cartItems))
            localStorage.setItem('guestCustoms', JSON.stringify(cartCustoms))
        }
    }, [cartItems, cartCustoms, token])

    // Extra cost of a personalisation (the server recalculates this at checkout)
    const extrasOf = (custom) => {
        if (!custom || !customOptions) return 0
        const wrap = customOptions.wrapOptions.find(w => w.id === custom.wrap)?.price || 0
        const addOns = (custom.addOns || []).reduce((sum, id) => sum + (customOptions.addOns.find(a => a.id === id)?.price || 0), 0)
        const cake = customOptions.cakeOptions
        const flavour = cake.flavours.find(f => f.id === custom.cakeFlavour)?.price || 0
        const eggless = custom.eggless ? cake.eggless.price : 0
        const photoPrint = custom.cakeFlavour && custom.photo ? cake.photoPrint.price : 0
        // A surprise box also costs every gift packed inside it
        const boxContents = (custom.boxItems || []).reduce((sum, item) => {
            const product = products.find(p => p._id === item._id)
            return sum + (product ? (priceOf(product, item.size) + extrasOf(item.custom)) * (item.quantity || 1) : 0)
        }, 0)
        return wrap + addOns + flavour + eggless + photoPrint + boxContents
    }

    const syncLine = async (itemId, key, quantity, custom) => {
        if (!token) return
        try {
            const { customId } = splitKey(key)
            const response = await axios.post(backendUrl + '/api/cart/update', { itemId, size: key, quantity, customId, custom }, {headers:{token}})
            handleAuthError(response.data)
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const addToCart = async (itemId, size, quantity = 1, custom = null) => {

        if (!size) {
            toast.error("Please select a size");
            return;
        }

        let cartData = structuredClone(cartItems);
        cartData[itemId] = cartData[itemId] || {}

        // Each personalised gift is its own cart line
        let key = size
        if (custom) {
            const lineId = newLineId()
            key = `${size}~${lineId}`
            setCartCustoms(prev => ({ ...prev, [lineId]: custom }))
        }

        const newQuantity = (cartData[itemId][key] || 0) + quantity
        cartData[itemId][key] = newQuantity

        setCartItems(cartData)
        toast.success(custom ? 'Personalised gift added to your bag' : 'Added to your bag', { autoClose: 1500 })

        await syncLine(itemId, key, newQuantity, custom)
    }


    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            // Skip products that were removed from the store
            if (products.length > 0 && !products.some(product => product._id === items)) continue;
            for (const item in cartItems[items]) {
                if (cartItems[items][item] > 0) {
                    totalCount += cartItems[items][item];
                }
            }
        }
        return totalCount;
    }



    const updateQuantity = async (itemId, key, quantity) => {
        let cartData = structuredClone(cartItems);

        if (!cartData[itemId]) cartData[itemId] = {}
        cartData[itemId][key] = quantity;
        setCartItems(cartData)

        const { customId } = splitKey(key)
        if (customId && quantity === 0) {
            setCartCustoms(prev => {
                const next = { ...prev }
                delete next[customId]
                return next
            })
        }

        await syncLine(itemId, key, quantity)
    }

    const getCartAmount = () => {

        let totalAmount = 0;

        for (const items in cartItems) {

            let itemInfo = products.find((product) => product._id === items);
            if (!itemInfo) continue;
            for (const item in cartItems[items]) {
                if (cartItems[items][item] > 0) {
                    const { size, customId } = splitKey(item)
                    const unit = priceOf(itemInfo, size) + (customId ? extrasOf(cartCustoms[customId]) : 0)
                    totalAmount += unit * cartItems[items][item];
                }
            }
        }
        return totalAmount;

    }

    const getProductData = async () => {
        try {

            const response = await axios.get(backendUrl + '/api/product/list', { params: { limit: 1000 } })
            if (response.data.success) {
                setProducts(response.data.products)
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setProductsLoading(false)
        }
    }

    const getPromos = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/promo/public')
            if (data.success) {
                liveOffers = data.offers
                setOffers(data.offers)
                setPublicCoupons(data.coupons)
            }
        } catch (error) {
            console.log(error)
        }
    }

    // Bag lines in the shape the server prices
    const cartLines = () => {
        const lines = []
        for (const itemId in cartItems) {
            if (products.length && !products.some(p => p._id === itemId)) continue
            for (const key in cartItems[itemId]) {
                if (cartItems[itemId][key] > 0) {
                    const { size, customId } = splitKey(key)
                    lines.push({ _id: itemId, size, quantity: cartItems[itemId][key], custom: customId ? cartCustoms[customId] || null : null })
                }
            }
        }
        return lines
    }

    const checkCoupon = async (code) => {
        const clean = String(code || '').trim().toUpperCase()
        if (!clean) return
        if (!token) { setCouponResult(null); setCouponError('Log in to use a coupon'); return }
        const items = cartLines()
        if (!items.length) { setCouponResult(null); return }
        setCouponChecking(true)
        try {
            const { data } = await axios.post(backendUrl + '/api/promo/apply', { code: clean, items }, { headers: { token } })
            if (handleAuthError(data)) return
            if (data.success) { setCouponResult(data); setCouponError('') }
            else { setCouponResult(null); setCouponError(data.message) }
        } catch (error) {
            setCouponError(error.message)
        } finally {
            setCouponChecking(false)
        }
    }

    const applyCoupon = async (code) => {
        const clean = String(code || '').trim().toUpperCase()
        if (!clean) return
        localStorage.setItem('coupon', clean)
        setCouponCode(clean)
        await checkCoupon(clean)
    }

    // ---------- wishlist
    useEffect(() => { if (!token) localStorage.setItem('guestWishlist', JSON.stringify(wishlist)) }, [wishlist, token])

    const loadWishlist = async () => {
        try {
            const guest = (() => { try { return JSON.parse(localStorage.getItem('guestWishlist')) || [] } catch { return [] } })()
            const { data } = guest.length
                ? await axios.post(backendUrl + '/api/user/wishlist/merge', { ids: guest }, { headers: { token } })
                : await axios.post(backendUrl + '/api/user/wishlist', {}, { headers: { token } })
            if (handleAuthError(data)) return
            if (data.success) {
                localStorage.removeItem('guestWishlist')
                setWishlist(data.wishlist)
                setWishlistShare({ shared: data.shared, shareId: data.shareId })
            }
        } catch (error) {
            console.log(error)
        }
    }

    const inWishlist = (id) => wishlist.includes(id)
    const toggleWishlist = async (id) => {
        const adding = !wishlist.includes(id)
        setWishlist(prev => adding ? [id, ...prev] : prev.filter(x => x !== id))
        toast.success(adding ? 'Saved to your wishlist' : 'Removed from your wishlist', { autoClose: 1200 })
        if (!token) return
        try {
            const { data } = await axios.post(backendUrl + '/api/user/wishlist/toggle', { productId: id }, { headers: { token } })
            if (handleAuthError(data)) return
            if (data.success) setWishlist(data.wishlist)
            else { toast.error(data.message); setWishlist(prev => adding ? prev.filter(x => x !== id) : [id, ...prev]) }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const setWishlistShared = async (shared) => {
        const { data } = await axios.post(backendUrl + '/api/user/wishlist/share', { shared }, { headers: { token } })
        if (handleAuthError(data)) return
        if (data.success) setWishlistShare({ shared: data.shared, shareId: data.shareId })
        else toast.error(data.message)
    }

    // Re-check the coupon whenever the bag changes
    useEffect(() => {
        if (!couponCode || !products.length) return
        const id = setTimeout(() => checkCoupon(couponCode), 350)
        return () => clearTimeout(id)
    }, [couponCode, cartItems, cartCustoms, token, products.length])

    const getBrands = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/brand/list')
            if (data.success) setBrands(data.brands)
        } catch (error) {
            console.log(error)
        }
    }
    const brandOf = (slug) => brands.find(b => b.slug === slug)

    const getCustomOptions = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/product/options')
            if (data.success) setCustomOptions(data.options)
        } catch (error) {
            console.log(error)
        }
    }

    // Load the saved cart and merge in anything added while logged out
    const getUserCart = async (token) => {
        try {
            const response = await axios.post(backendUrl + '/api/cart/get', {}, {headers:{token}})
            if (handleAuthError(response.data)) return
            if (response.data.success) {
                const merged = structuredClone(response.data.cartData || {})
                const mergedCustoms = { ...(response.data.cartCustoms || {}) }
                const guestCart = readStorage('guestCart')
                const guestCustoms = readStorage('guestCustoms')

                let changed = false
                for (const itemId in guestCart) {
                    for (const key in guestCart[itemId]) {
                        if (guestCart[itemId][key] > 0) {
                            merged[itemId] = merged[itemId] || {}
                            merged[itemId][key] = (merged[itemId][key] || 0) + guestCart[itemId][key]
                            const { customId } = splitKey(key)
                            if (customId && guestCustoms[customId]) mergedCustoms[customId] = guestCustoms[customId]
                            changed = true
                        }
                    }
                }
                localStorage.removeItem('guestCart')
                localStorage.removeItem('guestCustoms')
                setCartItems(merged)
                setCartCustoms(mergedCustoms)
                if (changed) await axios.post(backendUrl + '/api/cart/set', { cartData: merged, cartCustoms: mergedCustoms }, {headers:{token}})
            }

        } catch (error) {
             console.log(error)
             toast.error(error.message)
        }

    }

    useEffect(() => {
        getProductData()
        getCustomOptions()
        getBrands()
        getPromos()
    }, [])

    useEffect(() => {
        if (token) {
            getUserCart(token)
            loadWishlist()
        }
    }, [token])





    const value = {
        products, productsLoading, currency, delivery_fee, search, setSearch,
        showSearch, setShowSearch, setCartItems, clearCart,
        cartItems, cartCustoms, customOptions, extrasOf, addToCart, getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl, token, setToken, logout, handleAuthError,
        chat, openChat, closeChat, brands, brandOf,
        wishlist, inWishlist, toggleWishlist, wishlistShare, setWishlistShared,
        offers, publicCoupons, couponCode, couponResult, couponError, couponChecking, applyCoupon, removeCoupon
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;
