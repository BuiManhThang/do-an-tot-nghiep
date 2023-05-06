import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { AssociationRule, Category, Product } from '../models/entity'
import { CreateCategoryDto, PagingParam, PagingResult, UpdateCategoryDto } from '../models/dto'
import { OrderStatus } from '../models/enum'

type StaticalRevenueOfProductsParams = {
  startDate: string
  endDate: string
  sort: 'amount' | 'total'
  direction: 'asc' | 'desc'
  pageIndex: string
  pageSize: string
}

export default class ReportController extends BaseController {
  private readonly prisma: PrismaClient
  constructor() {
    super()
    this.prisma = new PrismaClient()
  }

  getStatisticalRevenue = async (req: Request, res: Response) => {
    const query = req.query

    const aggregate: any[] = [
      { $match: { status: OrderStatus.Success } },
      {
        $group: {
          _id: '$status',
          totalRevenue: { $sum: '$totalMoney' },
        },
      },
    ]

    const date = new Date()
    let start = new Date()
    let end = new Date()
    const currentYear = date.getFullYear()

    if (query.month) {
      start = new Date(currentYear, 0, 1)
      end = new Date(currentYear, 11, 30)
      aggregate[1] = {
        $group: {
          _id: { status: '$status', time: { $month: '$createdAt' } },
          totalRevenue: { $sum: '$totalMoney' },
        },
      }
    } else if (query.year) {
      start = new Date(currentYear - 5, 0, 1)
      end = new Date(currentYear, 11, 30)
      aggregate[1] = {
        $group: {
          _id: { status: '$status', time: { $year: '$createdAt' } },
          totalRevenue: { $sum: '$totalMoney' },
        },
      }
    }
    aggregate[0] = {
      $match: {
        $expr: {
          $and: [
            {
              $gte: [
                '$createdAt',
                {
                  $dateFromString: {
                    dateString: start.toISOString(),
                  },
                },
              ],
            },
            {
              $lte: [
                '$createdAt',
                {
                  $dateFromString: {
                    dateString: end.toISOString(),
                  },
                },
              ],
            },
            {
              $eq: ['$status', OrderStatus.Success],
            },
          ],
        },
      },
    }

    try {
      const totalRevenue = await this.prisma.order.aggregateRaw({
        pipeline: aggregate,
      })
      const totalRevenueResult = totalRevenue as unknown as any[]
      return this.success(
        res,
        totalRevenueResult.map((r) => ({
          totalRevenue: r.totalRevenue,
          time: r._id.time,
        }))
      )
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  getTotal = async (_: Request, res: Response) => {
    try {
      const [
        productsCount,
        usersCount,
        ordersCount,
        pendingOrdersCount,
        confirmedOrdersCount,
        categories,
        totalMoney,
      ] = await Promise.all([
        this.prisma.product.count(),
        this.prisma.user.count(),
        this.prisma.order.count(),
        this.prisma.order.count({
          where: {
            status: OrderStatus.Pending,
          },
        }),
        this.prisma.order.count({
          where: {
            status: OrderStatus.Confirmed,
          },
        }),
        this.prisma.category.findMany({
          select: {
            id: true,
            name: true,
            products: true,
          },
          orderBy: {
            products: {
              _count: 'desc',
            },
          },
        }),
        this.prisma.order.aggregate({
          _sum: {
            totalMoney: true,
          },
        }),
      ])

      const formattedCategories: any[] = []
      let isGreaterThanFive = categories.length > 5 ? true : false
      for (let index = 0; index < categories.length; index++) {
        const category = categories[index]
        if (index === 4 && isGreaterThanFive) {
          formattedCategories.push({
            ...category,
            name: 'Khác',
            productsCount: category.products.length,
          })
          continue
        }
        if (index > 4) {
          formattedCategories[4].productsCount += category.products.length
          continue
        }
        formattedCategories.push({
          ...category,
          productsCount: category.products.length,
        })
      }

      return this.success(res, {
        productsCount,
        usersCount,
        ordersCount,
        pendingOrdersCount,
        confirmedOrdersCount,
        categories: formattedCategories,
        totalMoney: totalMoney._sum.totalMoney,
      })
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  getStaticalRevenueOfProducts = async (req: Request, res: Response) => {
    try {
      const { direction, endDate, startDate, sort, pageIndex, pageSize } =
        req.query as unknown as StaticalRevenueOfProductsParams

      let skip = undefined
      let take = undefined

      // Paging
      if (pageIndex && pageSize) {
        const pageIndexNumber = parseInt(pageIndex)
        const pageSizeNumber = parseInt(pageSize)
        skip = pageSizeNumber * (pageIndexNumber - 1)
        take = pageSizeNumber
      }

      const formatStartDate = new Date(startDate)
      formatStartDate.setHours(0, 0, 0)
      const formatEndDate = new Date(endDate)
      formatEndDate.setHours(23, 59, 59)

      const orders = await this.prisma.order.findMany({
        where: {
          createdAt: {
            gte: formatStartDate,
            lte: formatEndDate,
          },
          status: { in: [OrderStatus.Confirmed, OrderStatus.Success] },
        },
        select: {
          id: true,
        },
      })
      const orderIds = orders.map((order) => order.id)

      const result = await this.prisma.orderDetail.groupBy({
        by: ['productId'],
        where: {
          orderId: { in: orderIds },
        },
        _sum: {
          amount: true,
          total: true,
        },
        orderBy: {
          _sum: {
            [sort]: direction,
          },
        },
        skip,
        take,
      })

      const productIds = result.map((r) => r.productId)
      const products = await this.prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
      })
      const mapProducts = new Map()
      products.forEach((product) => {
        mapProducts.set(product.id, product)
      })

      let additionProducts: any[] = []
      // Nếu ko có pageIndex và pageSize tức là đang lấy báo cáo để export
      if (!pageIndex && !pageSize) {
        additionProducts = await this.prisma.product.findMany({
          where: {
            id: { notIn: productIds },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      }

      additionProducts = additionProducts.map((p: Product) => ({
        ...p,
        sellAmount: 0,
        sellMoney: 0,
      }))

      let finalResult: any[] = []
      if (direction === 'asc') {
        finalResult = [
          ...additionProducts,
          ...result.map((r) => {
            const product = mapProducts.get(r.productId)
            return {
              ...product,
              sellAmount: r._sum.amount,
              sellMoney: r._sum.total,
            }
          }),
        ]
      } else {
        finalResult = [
          ...result.map((r) => {
            const product = mapProducts.get(r.productId)
            return {
              ...product,
              sellAmount: r._sum.amount,
              sellMoney: r._sum.total,
            }
          }),
          ...additionProducts,
        ]
      }

      return this.success(res, finalResult)
    } catch (error) {
      return this.serverError(res, error)
    }
  }
}
