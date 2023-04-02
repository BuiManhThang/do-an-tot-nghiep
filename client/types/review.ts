import { User } from './user'

export type Review = {
  id: string
  productId: string
  userId: string
  user: User
  score: number
  comment: string
  createdAt: Date
  updatedAt: Date
}
