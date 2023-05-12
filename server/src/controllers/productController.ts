import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { Product, ValidateError } from '../models/entity'
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

      this.setPrevValue(entity, model as unknown as Product)

      const updatedEntity = await this.updateEntity(entityId, entity)

      // Cập nhật sản phẩm trong giỏ hàng
      // Nếu vẫn còn đang bán thì cập nhật thuộc tính
      if (updatedEntity.isActive) {
        console.log(1)
        await this.prisma.user.updateMany({
          where: {
            cart: { some: { id: entityId } },
          },
          data: {
            cart: {
              updateMany: {
                where: { id: entityId },
                data: {
                  categoryId: updatedEntity.categoryId,
                  categoryName: updatedEntity.category.name,
                  code: updatedEntity.code,
                  image: updatedEntity.image,
                  name: updatedEntity.name,
                  price: updatedEntity.price,
                  unit: updatedEntity.unit,
                },
              },
            },
          },
        })
      }
      // Nếu ko bán nữa thì xóa luôn
      else {
        await this.prisma.user.updateMany({
          where: {
            cart: { some: { id: entityId } },
          },
          data: {
            cart: {
              deleteMany: {
                where: { id: entityId },
              },
            },
          },
        })
      }

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

      // Kiểm tra sản phẩm có trong đơn hàng đã xác nhận hay ko
      const order = await this.prisma.order.findFirst({
        where: {
          orderDetails: { some: { productId: id } },
          status: { in: [2, 3] },
        },
      })

      if (order) {
        const errors: ValidateError[] = [
          {
            field: 'order',
            msg: 'Không thể xóa sản phẩm đang trong đơn hàng đã xác nhận hoặc đã thanh toán',
            value: order,
          },
        ]
        return this.clientError(res, errors)
      }

      // Xóa sản phẩm trong giỏ hàng
      await Promise.all([
        this.prisma.user.updateMany({
          where: {
            cart: { some: { id: id } },
          },
          data: {
            cart: { deleteMany: { where: { id: id } } },
          },
        }),
        this.prisma.review.deleteMany({
          where: {
            productId: id,
          },
        }),
        this.prisma.viewHistory.deleteMany({
          where: {
            productId: id,
          },
        }),
      ])

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
        where.OR = [
          { code: { contains: searchText, mode: 'insensitive' } },
          { name: { contains: searchText, mode: 'insensitive' } },
        ]
      }
      if (categoryId !== undefined) {
        where.categoryId = {
          in: categoryId.split(';'),
        }
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
          include: {
            category: true,
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

  getProductsByIds = async (req: Request, res: Response) => {
    try {
      const productIdsString: string = req.params.ids
      const productIds = productIdsString.split(';')
      const products = await this.model.findMany({
        where: {
          id: { in: productIds },
        },
      })

      return this.success(res, products)
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
      include: {
        category: true,
      },
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
    if (newEntity.isActive === undefined || newEntity.isActive === null) {
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
