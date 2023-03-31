import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { Category } from '../models/entity'
import { CreateCategoryDto, PagingParam, PagingResult, UpdateCategoryDto } from '../models/dto'

export default class CategoryController extends BaseController {
  private readonly prisma: PrismaClient
  private readonly model
  private readonly codePrefix: string
  constructor() {
    super()
    this.prisma = new PrismaClient()
    this.model = this.prisma.category
    this.codePrefix = 'C'
  }

  create = async (req: Request, res: Response) => {
    try {
      const entity: CreateCategoryDto = req.body
      const newEntity = await this.createEntity(entity)
      return this.created(res, newEntity)
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  update = async (req: Request, res: Response) => {
    try {
      const entityId: string = req.params.id
      const entity: UpdateCategoryDto = req.body

      const model = await this.model.findFirst({
        where: {
          id: entityId,
        },
      })
      if (!model) {
        return this.notFound(res)
      }

      this.setPrevValue(entity, model as Category)

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
      const { pageIndex, pageSize, sort, direction, searchText } = req.query as PagingParam
      let skip = undefined
      let take = undefined
      let where = undefined
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
        where = {
          OR: [{ code: { contains: searchText } }, { name: { contains: searchText } }],
        }
      }

      const [entities, entitiesCount] = await Promise.all([
        this.model.findMany({
          include: {
            _count: { select: { products: true } },
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

  private createEntity = async (entity: CreateCategoryDto) => {
    const newEntity = await this.model.create({
      data: {
        code: entity.code,
        name: entity.name,
        image: entity.image,
        desc: entity.desc,
      },
    })
    return newEntity
  }

  private updateEntity = async (entityId: string, entity: UpdateCategoryDto) => {
    const updatedEntity = await this.model.update({
      where: {
        id: entityId,
      },
      data: {
        code: entity.code,
        name: entity.name,
        image: entity.image,
        desc: entity.desc,
      },
    })
    return updatedEntity
  }

  private setPrevValue = (newEntity: UpdateCategoryDto, oldEntity: Category) => {
    if (!newEntity.code) {
      newEntity.code = oldEntity.code
    }
    if (!newEntity.name) {
      newEntity.name = oldEntity.name
    }
    if (!newEntity.desc) {
      newEntity.desc = oldEntity.desc
    }
  }
}
