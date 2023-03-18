import { ProductInCart } from '@prisma/client'
import { ProductInOrder, UserAddress } from './entity'
import { OrderStatus, SortDirection } from './enum'

export type WhereParam = {
  OR?: any[]
  AND?: any[]
}

export type PagingParam = {
  pageIndex?: string
  pageSize?: string
  sort?: string
  direction?: SortDirection
  searchText?: string
}

export type PagingResult = {
  data: any[]
  total: number
}

export type PagingProductParam = PagingParam & {
  categoryId?: string
  priceLte?: string
  priceGte?: string
  isActive?: string
}

export type WhereProductParam = WhereParam & {
  categoryId?: string
  isActive?: boolean
  price?: any
}

export type PagingOrderParam = PagingParam & {
  userId?: string
}

export type WhereOrderParam = WhereParam & {
  userId?: string
}

export type PagingReviewParam = PagingParam & {
  productId?: string
}

export type WhereReviewParam = WhereParam & {
  productId?: string
}

export type SignInDto = {
  email: string
  password: string
}

export type RegisterDto = {
  email: string
  password: string
  confirmPassword: string
}

export type UserDto = {
  id: string
  code: string
  email: string
  name: string
  phoneNumber?: string | null
  avatar: string
  isAdmin: boolean
  address?: UserAddress | null
  cart: ProductInCart[]
  createdAt: Date
  updatedAt: Date
}

export type CreateUserDto = {
  code: string
  email: string
  name: string
  password: string
  phoneNumber?: string | null
  avatar?: string
  isAdmin?: boolean
  address?: UserAddress | null
}

export type UpdateUserDto = {
  code: string
  email: string
  name: string
  password: string
  phoneNumber?: string | null
  avatar: string
  address?: UserAddress | null
  cart: ProductInCart[]
}

export type SignInResult = {
  user: UserDto
  token: string
}

export type CreateProductDto = {
  code: string
  name: string
  image: string
  amount: number
  price: number
  isActive: boolean
  gallery: string[]
  desc?: string
  categoryId: string
}

export type UpdateProductDto = {
  code: string
  name: string
  image: string
  amount: number
  price: number
  isActive: boolean
  gallery: string[]
  desc?: string
  categoryId: string
}

export type CreateCategoryDto = {
  code: string
  name: string
  image: string
  desc?: string
}

export type UpdateCategoryDto = {
  code: string
  name: string
  image: string
  desc?: string
}

export type CreateOrderDto = {
  code: string
  note?: string
  totalMoney: number
  userId: string
  products: ProductInOrder[]
}

export type UpdateOrderDto = {
  code: string
  note?: string
  status: OrderStatus
  totalMoney: number
  userId: string
  products: ProductInOrder[]
}

export type CreateReviewDto = {
  productId: string
  userId: string
  score: number
  comment: string
}

export type UpdateReviewDto = {
  score: number
  comment: string
}
