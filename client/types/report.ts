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
