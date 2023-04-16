import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { Category, Review } from '../models/entity'
import {
  CreateCategoryDto,
  CreateReviewDto,
  PagingParam,
  PagingResult,
  PagingReviewParam,
  UpdateCategoryDto,
  UpdateReviewDto,
  WhereReviewParam,
} from '../models/dto'

export default class ReviewController extends BaseController {
  private readonly prisma: PrismaClient
  private readonly model
  constructor() {
    super()
    this.prisma = new PrismaClient()
    this.model = this.prisma.review
  }

  create = async (req: Request, res: Response) => {
    try {
      const entity: CreateReviewDto = req.body
      const newEntity = await this.createEntity(entity)
      return this.created(res, newEntity)
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  update = async (req: Request, res: Response) => {
    try {
      const entityId: string = req.params.id
      const entity: UpdateReviewDto = req.body

      const model = await this.model.findFirst({
        where: {
          id: entityId,
        },
      })
      if (!model) {
        return this.notFound(res)
      }

      this.setPrevValue(entity, model as Review)

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
      const { pageIndex, pageSize, sort, direction, searchText, productId, userId } =
        req.query as PagingReviewParam
      let skip = undefined
      let take = undefined
      let where: WhereReviewParam = {}
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
          {
            user: {
              OR: [
                { code: { contains: searchText, mode: 'insensitive' } },
                { name: { contains: searchText, mode: 'insensitive' } },
                { email: { contains: searchText, mode: 'insensitive' } },
              ],
            },
          },
          {
            product: {
              OR: [
                { code: { contains: searchText, mode: 'insensitive' } },
                { name: { contains: searchText, mode: 'insensitive' } },
              ],
            },
          },
        ]
      }
      if (productId !== undefined) {
        where.productId = productId
      }
      if (userId !== undefined) {
        where.userId = userId
      }

      const [entities, entitiesCount] = await Promise.all([
        this.model.findMany({
          include: {
            user: {
              select: {
                id: true,
                avatar: true,
                code: true,
                email: true,
                name: true,
                phoneNumber: true,
              },
            },
            product: {
              select: {
                image: true,
                code: true,
                name: true,
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

  private createEntity = async (entity: CreateReviewDto) => {
    const newEntity = await this.model.create({
      data: {
        productId: entity.productId,
        userId: entity.userId,
        score: entity.score,
        comment: entity.comment,
      },
    })
    return newEntity
  }

  private updateEntity = async (entityId: string, entity: UpdateReviewDto) => {
    const updatedEntity = await this.model.update({
      where: {
        id: entityId,
      },
      data: {
        score: entity.score,
        comment: entity.comment,
      },
    })
    return updatedEntity
  }

  private setPrevValue = (newEntity: UpdateReviewDto, oldEntity: Review) => {
    if (!newEntity.score) {
      newEntity.score = oldEntity.score
    }
    if (!newEntity.comment) {
      newEntity.comment = oldEntity.comment
    }
  }
}
