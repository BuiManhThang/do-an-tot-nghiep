import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { ValidateError } from '../models/entity'
import {
  CreateInventoryReceiptDto,
  PagingInventoryReceiptParam,
  PagingResult,
  WhereInventoryReceiptParam,
} from '../models/dto'

export default class InventoryReceiptController extends BaseController {
  private readonly prisma: PrismaClient
  private readonly model
  private readonly codePrefix: string
  constructor() {
    super()
    this.prisma = new PrismaClient()
    this.model = this.prisma.inventoryReceipt
    this.codePrefix = 'I'
  }

  create = async (req: Request, res: Response) => {
    try {
      const entity: CreateInventoryReceiptDto = req.body

      const productIds = entity.inventoryReceiptDetails.map((p) => p.productId)
      const products = await this.prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
      })
      let totalMoney = 0
      if (
        entity.inventoryReceiptDetails.some((product) => {
          const foundProduct = products.find((p) => p.id === product.productId)
          if (!foundProduct) return true
          totalMoney += product.amount * product.importPrice
          return false
        })
      ) {
        const errors: ValidateError[] = [
          {
            field: 'product',
            msg: 'Không tìm thấy sản phẩm',
            value: null,
          },
        ]
        return this.clientError(res, errors)
      }

      const newEntity = await this.model.create({
        data: {
          code: entity.code,
          note: entity.note,
          totalMoney: totalMoney,
          userId: entity.userIdFromToken,
        },
      })

      // Tạo chi tiết phiếu nhập
      const newInventoryReceiptDetails = entity.inventoryReceiptDetails.map((p) => ({
        importPrice: p.importPrice,
        amount: p.amount,
        productId: p.productId,
        inventoryReceiptId: newEntity.id,
      }))
      await this.prisma.inventoryReceiptDetail.createMany({
        data: newInventoryReceiptDetails,
      })

      // Cập nhật số lượng sản phẩm
      const requestList = entity.inventoryReceiptDetails.map((p) =>
        this.prisma.product.update({
          where: { id: p.productId },
          data: { amount: { increment: p.amount } },
        })
      )
      await Promise.all(requestList)

      // Lấy kết quả
      const result = await this.model.findFirst({
        where: {
          id: newEntity.id,
        },
        include: {
          inventoryReceiptDetails: {
            include: {
              product: true,
            },
          },
        },
      })

      return this.created(res, result)
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  getPaging = async (req: Request, res: Response) => {
    try {
      const { pageIndex, pageSize, sort, direction, searchText, userId } =
        req.query as PagingInventoryReceiptParam
      let skip = undefined
      let take = undefined
      let where: WhereInventoryReceiptParam = {}
      let orderBy = undefined

      // Paging
      if (pageIndex && pageSize) {
        const pageIndexNumber = parseInt(pageIndex)
        const pageSizeNumber = parseInt(pageSize)
        skip = pageSizeNumber * (pageIndexNumber - 1)
        take = pageSizeNumber
      }

      // Sort
      if (sort && direction) {
        orderBy = {
          [sort]: direction,
        }
      }

      // Filter
      if (searchText) {
        where.OR = [
          { code: { contains: searchText } },
          {
            user: {
              OR: [
                { code: { contains: searchText, mode: 'insensitive' } },
                { name: { contains: searchText, mode: 'insensitive' } },
                { email: { contains: searchText, mode: 'insensitive' } },
              ],
            },
          },
        ]
      }
      if (userId !== undefined) {
        where.userId = userId
      }

      const [entities, entitiesCount] = await Promise.all([
        this.model.findMany({
          include: {
            user: true,
            inventoryReceiptDetails: true,
          },
          where,
          skip,
          take,
          orderBy:
            sort === 'products' ? { inventoryReceiptDetails: { _count: direction } } : orderBy,
        }),
        this.model.count({
          where,
        }),
      ])
      const pagingResult: PagingResult = {
        data: entities,
        total: entitiesCount,
      }
      return this.success(res, pagingResult)
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  getById = async (req: Request, res: Response) => {
    try {
      const id = req.params.id
      const model = await this.model.findFirst({
        include: {
          user: {
            select: {
              address: true,
              avatar: true,
              code: true,
              email: true,
              id: true,
              name: true,
              phoneNumber: true,
            },
          },
          inventoryReceiptDetails: {
            select: {
              id: true,
              importPrice: true,
              amount: true,
              productId: true,
              product: {
                select: {
                  id: true,
                  code: true,
                  categoryId: true,
                  category: {
                    select: {
                      id: true,
                      code: true,
                      name: true,
                    },
                  },
                  image: true,
                  name: true,
                  price: true,
                  unit: true,
                },
              },
            },
          },
        },
        where: {
          id,
        },
      })
      if (!model) {
        return this.notFound(res)
      }

      return this.success(res, model)
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  getNewCode = async (_: Request, res: Response) => {
    try {
      const newCode = await this.genereateNewCode()
      return this.success(res, newCode)
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  private genereateNewCode = async () => {
    const entities = await this.model.findMany({
      orderBy: {
        code: 'desc',
      },
      take: 1,
    })

    let code = `${this.codePrefix}.0001`
    if (entities.length > 0) {
      const newestEntity = entities[0]
      const newestEntityCode = newestEntity.code
      const codeArr = newestEntityCode.split('.')
      const codeNumber = parseInt(codeArr[1])
      const newCodeNumber = codeNumber + 1
      code = `${this.codePrefix}.${newCodeNumber.toString().padStart(4, '0')}`
    }
    return code
  }
}
