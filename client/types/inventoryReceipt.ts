import { Product } from './product'
import { User } from './user'

export type InventoryReceipt = {
  id: string
  code: string
  note?: string
  totalMoney: number
  userId: string
  user: User
  inventoryReceiptDetails: InventoryReceiptDetail[]
  createdAt: Date
  updatedAt: Date
}

export type InventoryReceiptDetail = {
  id: string
  importPrice: number
  amount: number
  productId: string
  product: Product
  inventoryReceiptId: string
}

export type CreateInventoryReceipt = {
  code: string
  note: string
  inventoryReceiptDetails: CreateInventoryReceiptDetail[]
}

export type CreateInventoryReceiptDetail = {
  importPrice: number | ''
  amount: number | ''
  productId: string | null
  product?: Product | null
}
