import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { Product } from '../models/entity'
import {
  UpdateProductDto,
  CreateProductDto,
  PagingProductParam,
  PagingResult,
  WhereProductParam,
} from '../models/dto'

export default class ProductController extends BaseController {
  private readonly prisma: PrismaClient
  private readonly model
  private readonly codePrefix: string
  constructor() {
    super()
    this.prisma = new PrismaClient()
    this.model = this.prisma.product
    this.codePrefix = 'P'
  }

  create = async (req: Request, res: Response) => {
    try {
      const entity: CreateProductDto = req.body
      const newEntity = await this.createEntity(entity)
      return this.created(res, newEntity)
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  update = async (req: Request, res: Response) => {
    try {
      const entityId: string = req.params.id
      const entity: UpdateProductDto = req.body

      const model = await this.model.findFirst({
        where: {
          id: entityId,
        },
      })
      if (!model) {
        return this.notFound(res)
      }

      this.setPrevValue(entity, model as Product)

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
        include: {
          category: true,
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
      const {
        pageIndex,
        pageSize,
        sort,
        direction,
        searchText,
        categoryId,
        isActive,
        priceGte,
        priceLte,
      } = req.query as PagingProductParam
      let skip = undefined
      let take = undefined
      let orderBy = undefined
      let where: WhereProductParam = {}

      // Paging
      if (pageIndex !== undefined && pageSize !== undefined) {
        const pageIndexNumber = parseInt(pageIndex)
        const pageSizeNumber = parseInt(pageSize)
        skip = pageSizeNumber * (pageIndexNumber - 1)
        take = pageSizeNumber
      }

      // Sort
      if (sort !== undefined && direction !== undefined) {
        orderBy = {
          [sort]: direction,
        }
      }

      // Filter
      if (searchText !== undefined) {
        where.OR = [{ code: { contains: searchText } }, { name: { contains: searchText } }]
      }
      if (categoryId !== undefined) {
        where.categoryId = categoryId
      }
      if (isActive !== undefined) {
        where.isActive = JSON.parse(isActive)
      }
      if (priceGte !== undefined || priceLte !== undefined) {
        where.price = {}
        if (priceGte !== undefined) {
          where.price.gte = parseInt(priceGte)
        }
        if (priceLte !== undefined) {
          where.price.lte = parseInt(priceLte)
        }
      }

      const [entities, entitiesCount] = await Promise.all([
        this.model.findMany({
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

  private createEntity = async (entity: CreateProductDto) => {
    const newEntity = await this.model.create({
      data: {
        code: entity.code,
        name: entity.name,
        image: entity.image,
        amount: entity.amount,
        price: entity.price,
        unit: entity.unit,
        isActive: entity.isActive,
        gallery: entity.gallery,
        desc: entity.desc,
        categoryId: entity.categoryId,
      },
    })
    return newEntity
  }

  private updateEntity = async (entityId: string, entity: UpdateProductDto) => {
    const updatedEntity = await this.model.update({
      where: {
        id: entityId,
      },
      data: {
        code: entity.code,
        name: entity.name,
        image: entity.image,
        amount: entity.amount,
        price: entity.price,
        unit: entity.unit,
        isActive: entity.isActive,
        gallery: entity.gallery,
        desc: entity.desc,
        categoryId: entity.categoryId,
      },
    })
    return updatedEntity
  }

  private setPrevValue = (newEntity: UpdateProductDto, oldEntity: Product) => {
    if (!newEntity.code) {
      newEntity.code = oldEntity.code
    }
    if (!newEntity.name) {
      newEntity.name = oldEntity.name
    }
    if (!newEntity.image) {
      newEntity.image = oldEntity.image
    }
    if (!newEntity.amount) {
      newEntity.amount = oldEntity.amount
    }
    if (!newEntity.price) {
      newEntity.price = oldEntity.price
    }
    if (!newEntity.unit) {
      newEntity.unit = oldEntity.unit
    }
    if (!newEntity.isActive) {
      newEntity.isActive = oldEntity.isActive
    }
    if (!newEntity.gallery) {
      newEntity.gallery = oldEntity.gallery
    }
    if (!newEntity.desc) {
      newEntity.desc = oldEntity.desc
    }
    if (!newEntity.categoryId) {
      newEntity.categoryId = oldEntity.categoryId
    }
  }
}
