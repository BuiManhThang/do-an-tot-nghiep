import { OrderStatus } from '@/enum/orderStatus'
import { ProductInOrder, User } from './user'

export type Order = {
  id: string
  code: string
  status: OrderStatus
  note?: string
  totalMoney: number
  userId: string
  user: User
  products: ProductInOrder[]
  createdAt: Date
  updatedAt: Date
}

export type CreateOrder = {
  code: string
  note?: string
  totalMoney: number
  userId: string
  products: ProductInOrder[]
}
