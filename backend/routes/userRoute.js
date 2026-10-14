import express from 'express'
import { loginUser, registerUser, adminLogin, getProfile, updateProfile, forgotPassword, resetPassword } from '../controllers/userController.js'
import authUser from '../middleware/auth.js'

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.post('/forgot-password', forgotPassword)
userRouter.post('/reset-password', resetPassword)
userRouter.post('/profile', authUser, getProfile)
userRouter.post('/profile/update', authUser, updateProfile)

export default userRouter;
