import jwt from 'jsonwebtoken'



const authUser = async (req,res,next) => {

    const {token} = req.headers;

    if (!token) {
        return res.json({success:false, message:"Not Authorized! Login Again ", authError: true})

    }

    try {

        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        if (!token_decode?.id) {
            return res.json({success:false, message:"Not Authorized! Login Again ", authError: true})
        }
        req.body = req.body || {}
        req.body.userId = token_decode.id
        next()


    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:"Session expired, Login Again", authError: true})
    }
}

export default authUser
