import validator from 'validator'
import subscriberModel from '../models/subscriberModel.js'
import { sendEmail } from '../utils/notify.js'
import { storeName } from '../config/store.js'

const subscribe = async (req, res) => {
    try {
        const email = String(req.body?.email || '').toLowerCase().trim()
        if (!validator.isEmail(email)) return res.json({ success: false, message: 'Please enter a valid email' })

        const exists = await subscriberModel.findOne({ email })
        if (exists) return res.json({ success: true, message: "You're already subscribed!" })

        await subscriberModel.create({ email, date: Date.now() })
        sendEmail({
            to: email,
            subject: `Welcome to ${storeName}!`,
            html: `<p>Thanks for subscribing to ${storeName}. Use code <b>WELCOME20</b> for 20% off your first gift.</p>`
        })
        res.json({ success: true, message: 'Subscribed! Check your inbox for 20% off' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { subscribe }
