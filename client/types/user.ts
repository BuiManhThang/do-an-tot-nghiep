import { ViewHistory } from './viewHistory'

export type DataSignIn = {
  email: string
  password: string
}

export type DataRegister = {
  email: string
  password: string
  confirmPassword: string
}

export type UserWithToken = {
  user: User
  token: string
}

export type User = {
  id: string
  code: string
  email: string
  password: string
  name: string
  phoneNumber?: string
  avatar: string
  isAdmin: boolean
  address?: UserAddress
  cart: ProductInCart[]
  orders: ProductInOrder[]
  viewHistorys: ViewHistory[]
  createdAt: Date
  updatedAt: Date
}

export type UserAddress = {
  district?: string
  city?: string
  detail?: string
}

export type ProductInCart = {
  id: string
  code: string
  name: string
  image: string
  amount: number
  price: number
  unit: string
  categoryId: string
  categoryName: string
  amountInSystem: number
}

export type ProductInOrder = {
  id: string
  code: string
  name: string
  image: string
  amount: number
  price: number
  unit: string
  categoryId: string
  categoryName: string
  amountInSystem: number
}
