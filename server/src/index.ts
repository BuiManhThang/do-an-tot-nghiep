import express from 'express'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cors from 'cors'
import userRouter from './routers/userRouter'
import productRouter from './routers/productRouter'
import categoryRouter from './routers/categoryRouter'
import orderRouter from './routers/orderRouter'
import reviewRouter from './routers/reviewRouter'
import viewHistoryRouter from './routers/viewHistoryRouter'
import associationRuleRouter from './routers/associationRuleRouter'
import reportRouter from './routers/reportRouter'

dotenv.config()
const PORT = process.env.PORT || 3001
const CLIENT_URL = process.env.CLIENT_URL
const app = express()

// Middlewares
app.use(morgan('dev'))
app.use(
  cors({
    origin: CLIENT_URL,
  })
)
app.use(express.urlencoded())
app.use(express.json())

// Routers
app.use('/api/v1/users', userRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/categories', categoryRouter)
app.use('/api/v1/orders', orderRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/viewHistory', viewHistoryRouter)
app.use('/api/v1/associationRules', associationRuleRouter)
app.use('/api/v1/report', reportRouter)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
