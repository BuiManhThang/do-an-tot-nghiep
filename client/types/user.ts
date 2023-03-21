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
  phoneNumber?: string | null
  avatar: string
  isAdmin: boolean
  address?: UserAddress | null
  cart: ProductInCart[]
  orders: ProductInOrder[]
  createdAt: Date
  updatedAt: Date
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
  categoryId: string
  categoryName: string
}
