import { Product } from './product'
import { User } from './user'

export type Review = {
  id: string
  productId: string
  userId: string
  user: User
  product: Product
  score: number
  comment: string
  createdAt: Date
  updatedAt: Date
}
