import userModel from "../models/userModel.js"



// add products to user Cart
const addToCart = async (req, res) => {
    try {

        const { userId, itemId, size } = req.body


        const userData = await userModel.findById(userId)
        let cartData = userData.cartData || {};

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1
            } else {
                cartData[itemId][size] = 1
            }
        } else {
            cartData[itemId] = {}
            cartData[itemId][size] = 1
        }

        await userModel.findByIdAndUpdate(userId, { cartData })
        res.json({ success: true, message: "Added To Cart " })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }


}

// update products to user Cart
const updateCart = async (req, res) => {
    try {
        const { userId, itemId, size, quantity, customId, custom } = req.body
        const userData = await userModel.findById(userId)
        let cartData = userData.cartData || {};
        let cartCustoms = userData.cartCustoms || {};

        if (!cartData[itemId]) cartData[itemId] = {}
        cartData[itemId][size] = Math.max(0, Number(quantity) || 0)

        if (customId && custom) cartCustoms[customId] = custom
        if (customId && cartData[itemId][size] === 0) delete cartCustoms[customId]

        await userModel.findByIdAndUpdate(userId, { cartData, cartCustoms })
        res.json({ success: true, message: "Cart Updated " })



    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// replace the whole cart (used to merge a guest cart after login)
const setCart = async (req, res) => {
    try {
        const { userId, cartData, cartCustoms } = req.body
        await userModel.findByIdAndUpdate(userId, { cartData: cartData || {}, cartCustoms: cartCustoms || {} })
        res.json({ success: true })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// getUserCart products to user Cart
const getUserCart = async (req, res) => {
    try {

        const { userId } = req.body;
        const userData = await userModel.findById(userId);
        if (!userData) return res.json({ success: false, message: 'User not found', authError: true })

        res.json({ success: true, cartData: userData.cartData || {}, cartCustoms: userData.cartCustoms || {} });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addToCart, updateCart, setCart, getUserCart }
