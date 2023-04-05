import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { Order } from '../models/entity'
import {
  CreateOrderDto,
  PagingResult,
  UpdateOrderDto,
  PagingOrderParam,
  WhereOrderParam,
} from '../models/dto'
import { OrderStatus } from '../models/enum'

export default class OrderController extends BaseController {
  private readonly prisma: PrismaClient
  private readonly model
  private readonly codePrefix: string
  constructor() {
    super()
    this.prisma = new PrismaClient()
    this.model = this.prisma.order
    this.codePrefix = 'O'
  }

  create = async (req: Request, res: Response) => {
    try {
      const entity: CreateOrderDto = req.body
      entity.code = await this.genereateNewCode()
      const newEntity = await this.createEntity(entity)

      // Xóa giỏ hàng
      const result = await this.prisma.user.update({
        where: {
          id: req.body.userId,
        },
        data: {
          cart: [],
        },
      })

      return this.created(res, newEntity)
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  update = async (req: Request, res: Response) => {
    try {
      const entityId: string = req.params.id
      const entity: UpdateOrderDto = req.body

      const model = await this.model.findFirst({
        where: {
          id: entityId,
        },
      })
      if (!model) {
        return this.notFound(res)
      }

      this.setPrevValue(entity, model as Order)

      const updatedEntity = await this.updateEntity(entityId, entity)
      return this.updated(res, updatedEntity)
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  delete = async (req: Request, res: Response) => {
    try {
      const id = req.params.id
      const model = await this.model.findFirst({
        where: {
          id,
        },
      })
      if (!model) {
        return this.notFound(res)
      }

      const deletedModel = await this.model.delete({
        where: {
          id,
        },
      })
      return this.deleted(res, deletedModel)
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

  getAll = async (_: Request, res: Response) => {
    try {
      const models = await this.model.findMany()
      return this.success(res, models)
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  getPaging = async (req: Request, res: Response) => {
    try {
      const { pageIndex, pageSize, sort, direction, searchText, userId, status } =
        req.query as PagingOrderParam
      let skip = undefined
      let take = undefined
      let where: WhereOrderParam = {}
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
                { code: { contains: searchText } },
                { name: { contains: searchText } },
                { email: { contains: searchText } },
              ],
            },
          },
        ]
      }
      if (userId !== undefined) {
        where.userId = userId
      }
      if (status !== undefined) {
        where.status = parseInt(status.toString())
      }

      const [entities, entitiesCount] = await Promise.all([
        this.model.findMany({
          include: {
            user: true,
          },
          where,
          skip,
          take,
          orderBy: sort === 'products' ? { products: { _count: direction } } : orderBy,
        }),
        this.model.aggregate({
          where,
          _count: true,
        }),
      ])
      const pagingResult: PagingResult = {
        data: entities,
        total: entitiesCount._count,
      }
      return this.success(res, pagingResult)
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

  private createEntity = async (entity: CreateOrderDto) => {
    const newEntity = await this.model.create({
      data: {
        code: entity.code,
        note: entity.note,
        totalMoney: entity.totalMoney,
        userId: entity.userId,
        products: entity.products,
      },
    })
    return newEntity
  }

  private updateEntity = async (entityId: string, entity: UpdateOrderDto) => {
    const updatedEntity = await this.model.update({
      where: {
        id: entityId,
      },
      data: {
        code: entity.code,
        note: entity.note,
        status: entity.status,
        totalMoney: entity.totalMoney,
        userId: entity.userId,
        products: entity.products,
      },
    })
    return updatedEntity
  }

  private setPrevValue = (newEntity: UpdateOrderDto, oldEntity: Order) => {
    if (!newEntity.code) {
      newEntity.code = oldEntity.code
    }
    if (!newEntity.note) {
      newEntity.note = oldEntity.note
    }
    if (!newEntity.status) {
      newEntity.status = oldEntity.status
    }
    if (!newEntity.totalMoney) {
      newEntity.totalMoney = oldEntity.totalMoney
    }
    if (!newEntity.userId) {
      newEntity.userId = oldEntity.userId
    }
    if (!newEntity.products) {
      newEntity.products = oldEntity.products
    }
  }
}
