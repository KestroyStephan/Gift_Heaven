import crypto from 'crypto'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import { sendEmail } from '../utils/notify.js'
import { storeName, frontendUrl } from '../config/store.js'

//create token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
}


// route for user login
const loginUser = async (req, res) => {
    try {
        const { password } = req.body;
        const email = String(req.body.email || '').trim()

        const user = await userModel.findOne({ email: { $in: [email, email.toLowerCase()] } });

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createToken(user._id)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }

}

// Route for user registration
const registerUser = async (req, res) => {
    try {
        const { name, password } = req.body;
        const email = String(req.body.email || '').toLowerCase().trim()

        // validation email and password
        if (!name || !String(name).trim()) {
            return res.json({ success: false, message: "Please enter your name" })
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        if (!password || password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters" })
        }

        //check user existing
        const exist = await userModel.findOne({ email })
        if (exist) {
            return res.json({ success: false, message: "User already exists" })
        }

        const newUser = new userModel({
            name: String(name).trim(),
            email,
            password: await hashPassword(password)
        })

        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// Route for admin Login
const adminLogin = async (req, res) => {
    try {
        const {email, password} = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' })
            res.json({success:true,token})


        }else{
            res.json({success:false, message:"Invalid credentials"})
        }


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }
}

// Logged-in user's profile
const getProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId).select('name email')
        if (!user) return res.json({ success: false, message: 'User not found' })
        res.json({ success: true, user })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Update name and (optionally) password
const updateProfile = async (req, res) => {
    try {
        const { userId, name, currentPassword, newPassword } = req.body
        const user = await userModel.findById(userId)
        if (!user) return res.json({ success: false, message: 'User not found' })

        if (name && String(name).trim()) user.name = String(name).trim()

        if (newPassword) {
            if (!(await bcrypt.compare(currentPassword || '', user.password))) {
                return res.json({ success: false, message: 'Current password is incorrect' })
            }
            if (newPassword.length < 8) {
                return res.json({ success: false, message: 'Password must be at least 8 characters' })
            }
            user.password = await hashPassword(newPassword)
        }

        await user.save()
        res.json({ success: true, message: 'Profile updated', user: { name: user.name, email: user.email } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Email a one-hour password reset link
const forgotPassword = async (req, res) => {
    try {
        const email = String(req.body.email || '').toLowerCase().trim()
        const user = await userModel.findOne({ email })

        if (user) {
            const token = crypto.randomBytes(32).toString('hex')
            user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex')
            user.resetPasswordExpires = Date.now() + 60 * 60 * 1000
            await user.save()

            const link = `${frontendUrl}/reset-password/${token}`
            if (!process.env.SMTP_HOST) console.log('Password reset link for ' + email + ': ' + link)
            await sendEmail({
                to: email,
                subject: `${storeName}: reset your password`,
                html: `<p>Hi ${user.name},</p><p>Click the link below to choose a new password. It expires in 1 hour.</p><p><a href="${link}">${link}</a></p><p>If you didn't request this, you can ignore this email.</p>`
            })
        }

        // Same answer either way so emails can't be enumerated
        res.json({ success: true, message: 'If that email is registered, a reset link has been sent' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body
        if (!password || password.length < 8) {
            return res.json({ success: false, message: 'Password must be at least 8 characters' })
        }

        const hashed = crypto.createHash('sha256').update(String(token || '')).digest('hex')
        const user = await userModel.findOne({ resetPasswordToken: hashed, resetPasswordExpires: { $gt: Date.now() } })
        if (!user) return res.json({ success: false, message: 'Reset link is invalid or has expired' })

        user.password = await hashPassword(password)
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        res.json({ success: true, message: 'Password updated, please log in', token: createToken(user._id) })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { loginUser, registerUser, adminLogin, getProfile, updateProfile, forgotPassword, resetPassword }
