import express from 'express'
import { listBrands, addBrand, updateBrand, removeBrand } from '../controllers/brandController.js'
import adminAuth from '../middleware/adminAuth.js'
import upload from '../middleware/multer.js'

const brandRouter = express.Router()

brandRouter.get('/list', listBrands)
brandRouter.post('/add', adminAuth, upload.single('logo'), addBrand)
brandRouter.post('/update', adminAuth, upload.single('logo'), updateBrand)
brandRouter.post('/remove', adminAuth, removeBrand)

export default brandRouter
