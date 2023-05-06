import { Category } from './category'

export type TotalResult = {
  productsCount: number
  usersCount: number
  ordersCount: number
  pendingOrdersCount: number
  confirmedOrdersCount: number
  categories: (Category & { productsCount: number })[]
  totalMoney: number
}

export type StatisticalRevenueResult = {
  totalRevenue: number
  time: number
}

export type StatisticalRevenueProductResult = {
  id: string
  code: string
  name: string
  amount: number
  unit: string
  price: number
  sellAmount: number
  sellMoney: number
}
