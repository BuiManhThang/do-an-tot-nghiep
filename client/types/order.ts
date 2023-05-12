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
  userName: string
  userPhoneNumber: string
  userEmail: string
  userCity: string
  userDistrict: string
  userAddressDetail: string
  products: ProductInOrder[]
  createdAt: Date
  updatedAt: Date
}

export type CreateOrder = {
  code: string
  note?: string
  totalMoney: number
  userId: string
  userName: string | ''
  userPhoneNumber: string | ''
  userEmail: string | ''
  userCity: string | ''
  userDistrict: string | ''
  userAddressDetail: string | ''
  products: ProductInOrder[]
}
