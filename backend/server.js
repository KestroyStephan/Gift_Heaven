import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import newsletterRouter from './routes/newsletterRoute.js'
import contactRouter from './routes/contactRoute.js'
import chatRouter from './routes/chatRoute.js'
import brandRouter from './routes/brandRoute.js'
import promoRouter from './routes/promoRoute.js'
import reviewRouter from './routes/reviewRoute.js'
import deliveryRouter from './routes/deliveryRoute.js'
import { sweepAbandonedOrders } from './controllers/orderController.js'

// App configuration setup
const app = express()
const port = process.env.PORT || 3000
connectDB()
connectCloudinary()

//middlewares
app.use(express.json())
app.use(cors())

//api end ponts
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/orders', orderRouter)
app.use('/api/newsletter', newsletterRouter)
app.use('/api/contact', contactRouter)
app.use('/api/chat', chatRouter)
app.use('/api/brand', brandRouter)
app.use('/api/promo', promoRouter)
app.use('/api/review', reviewRouter)
app.use('/api/delivery', deliveryRouter)

// Give back the stock of online orders that were never paid
setInterval(sweepAbandonedOrders, 15 * 60 * 1000)


// Upload and other middleware errors come back as JSON like every other API response
app.use((err, req, res, next) => {
    console.log(err.message)
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 5 MB)' : err.message
    res.status(400).json({ success: false, message })
})

app.get('/', (req, res) => {
    res.send("Api Working correctly")
})

app.listen(port, () => console.log("server started on PORT : " + port))




