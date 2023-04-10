import { OrderStatus } from './enum'

export type ValidateError = {
  field: string
  value: any
  msg: string
}

export type DecodedData = {
  userId: string
  isAdmin: boolean
}

export type User = {
  id: string
  code: string
  email: string
  password: string
  name: string
  phoneNumber?: string | null
  avatar: string
  isAdmin: boolean
  address?: UserAddress | null
  cart: ProductInCart[]
  orders: ProductInOrder[]
  createdAt: Date
  updatedAt: Date
}

export type Product = {
  id: string
  code: string
  name: string
  image: string
  amount: number
  price: number
  unit: string
  isActive: boolean
  gallery: string[]
  desc?: string
  categoryId: string
  category: Category
  reviews: Review[]
  createdAt: Date
  updatedAt: Date
}

export type Category = {
  id: string
  code: string
  name: string
  image: string
  desc?: string
  products: Product[]
  createdAt: Date
  updatedAt: Date
}

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

export type Review = {
  id: string
  productId: string
  product: Product
  userId: string
  user: User
  score: number
  comment: string
  createdAt: Date
  updatedAt: Date
}

export type ViewHistory = {
  id: string
  userId: string
  productId: string
  product: Product
  createdAt: Date
  updatedAt: Date
}

export type AssociationRule = {
  id: string
  antecedents: string[]
  consequents: string[]
  antecedentSupport: number
  consequentSupport: number
  support: number
  confidence: number
  lift: number
  productAntecedents: Product[]
  productConsequents: Product[]
}

export type Transition = {
  id: string
  orderId?: string
  order?: Order
  productIds: string[]
  products: Product[]
}

export type UserAddress = {
  district?: string | null
  city?: string | null
  detail?: string | null
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
}
