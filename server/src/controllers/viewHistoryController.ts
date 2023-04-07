import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { ViewHistory } from '../models/entity'
import {
  CreateViewHistoryDto,
  PagingResult,
  PagingViewHistoryParam,
  WhereViewHistoryParam,
} from '../models/dto'

export default class ViewHistoryController extends BaseController {
  private readonly prisma: PrismaClient
  private readonly model
  constructor() {
    super()
    this.prisma = new PrismaClient()
    this.model = this.prisma.viewHistory
  }

  create = async (req: Request, res: Response) => {
    try {
      const entity: CreateViewHistoryDto = req.body
      const newEntity = await this.createEntity(entity)
      return this.created(res, newEntity)
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  userCreate = async (req: Request, res: Response) => {
    try {
      const entity: CreateViewHistoryDto = req.body

      const product = await this.prisma.product.findFirst({
        where: {
          id: entity.productId,
        },
      })
      if (!product) return this.notFound(res)

      const entities = await this.model.findMany({
        where: {
          userId: entity.userId,
        },
        take: 4,
        orderBy: { createdAt: 'asc' },
      })

      if (entities.length >= 4) {
        await this.model.delete({
          where: {
            id: entities[0].id,
          },
        })
      }
      const existedEntity = entities.find((e) => e.productId === entity.productId)
      if (existedEntity) return this.notContent(res)

      const newEntity = await this.createEntity(entity)
      return this.created(res, newEntity)
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  update = async (req: Request, res: Response) => {
    try {
      const entityId: string = req.params.id
      const entity: CreateViewHistoryDto = req.body

      const model = await this.model.findFirst({
        where: {
          id: entityId,
        },
      })
      if (!model) {
        return this.notFound(res)
      }

      this.setPrevValue(entity, model as ViewHistory)

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
      const { pageIndex, pageSize, sort, direction, userId, productId } =
        req.query as PagingViewHistoryParam
      let skip = undefined
      let take = undefined
      let where: WhereViewHistoryParam = {}
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
      if (userId) {
        where.userId = userId
      }
      if (productId) {
        where.productId = productId
      }

      const [entities, entitiesCount] = await Promise.all([
        this.model.findMany({
          include: {
            product: {
              select: {
                image: true,
                name: true,
                id: true,
                price: true,
                unit: true,
                code: true,
              },
            },
          },
          where,
          skip,
          take,
          orderBy,
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

  private createEntity = async (entity: CreateViewHistoryDto) => {
    const newEntity = await this.model.create({
      data: {
        userId: entity.userId,
        productId: entity.productId,
      },
    })
    return newEntity
  }

  private updateEntity = async (entityId: string, entity: CreateViewHistoryDto) => {
    const updatedEntity = await this.model.update({
      where: {
        id: entityId,
      },
      data: {
        userId: entity.userId,
        productId: entity.productId,
      },
    })
    return updatedEntity
  }

  private setPrevValue = (newEntity: CreateViewHistoryDto, oldEntity: ViewHistory) => {
    if (!newEntity.userId) {
      newEntity.userId = oldEntity.userId
    }
    if (!newEntity.productId) {
      newEntity.productId = oldEntity.productId
    }
  }
}
