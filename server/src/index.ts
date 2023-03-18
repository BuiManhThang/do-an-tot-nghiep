import express from 'express'
import morgan from 'morgan'
import dotenv from 'dotenv'
import userRouter from './routers/userRouter'
import productRouter from './routers/productRouter'
import categoryRouter from './routers/categoryRouter'
import orderRouter from './routers/orderRouter'

dotenv.config()
const PORT = process.env.PORT || 3001
const app = express()

// Middlewares
app.use(morgan('dev'))
app.use(express.urlencoded())
app.use(express.json())

// Routers
app.use('/api/v1/users', userRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/categories', categoryRouter)
app.use('/api/v1/orders', orderRouter)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
