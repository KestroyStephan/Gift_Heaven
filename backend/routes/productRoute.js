import express from 'express'
import { inventory, updateStock, stockHistory, listProduct, addProduct, removeProduct, singleProduct, updateProduct, customizationOptions, uploadCustomerPhoto } from '../controllers/productController.js'
import authUser from '../middleware/auth.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';


const productRouter = express.Router();

productRouter.post('/add',adminAuth,upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]),addProduct);
const imageFields = upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}])
productRouter.post('/update',adminAuth,imageFields,updateProduct);
productRouter.post('/remove',adminAuth,removeProduct);
productRouter.post('/single',singleProduct);
productRouter.get('/list',listProduct);
productRouter.get('/options',customizationOptions);
productRouter.post('/inventory',adminAuth,inventory);
productRouter.post('/stock',adminAuth,updateStock);
productRouter.post('/stock-history',adminAuth,stockHistory);
productRouter.post('/upload-photo',authUser,upload.single('photo'),uploadCustomerPhoto);

export default productRouter;







