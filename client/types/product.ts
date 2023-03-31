import { Category } from './category'

export type CardProduct = {
  id: string
  code: string
  name: string
  image: string
  price: number
  unit: string
  categoryId: string
  category: Category
}

export type CreateProduct = {
  code: string
  name: string
  image: string
  amount: number | ''
  price: number | ''
  unit: string
  isActive: boolean
  gallery: string[]
  desc?: string
  categoryId: string
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
  createdAt: Date
  updatedAt: Date
}
