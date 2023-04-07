import { Product } from './product'

export type ViewHistory = {
  id: string
  userId: string
  productId: string
  product: Product
}
