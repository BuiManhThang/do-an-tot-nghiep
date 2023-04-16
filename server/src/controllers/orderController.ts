import { PrismaClient, ProductInOrder } from '@prisma/client'
import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { Order, ValidateError } from '../models/entity'
import {
  CreateOrderDto,
  PagingResult,
  UpdateOrderDto,
  PagingOrderParam,
  WhereOrderParam,
} from '../models/dto'
import { OrderStatus } from '../models/enum'
import { sendMail } from '../common/mailService'
import { numberWithCommas } from '../common/format'

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

      const productIds = entity.products.map((p) => p.id)
      const products = await this.prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
      })
      if (
        entity.products.some((product) => {
          const foundProduct = products.find((p) => p.id === product.id)
          if (!foundProduct) return false
          if (product.amount > foundProduct.amount) return true
          return false
        })
      ) {
        const errors: ValidateError[] = [
          {
            field: 'product',
            msg: 'Số lượng sản phẩm vượt quá số lượng trong kho. Tải lại trang để xem số lượng mới nhất',
            value: null,
          },
        ]
        return this.clientError(res, errors)
      }

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

      entity.products = entity.products.map((p) => {
        return {
          id: p.id,
          code: p.code,
          name: p.name,
          image: p.image,
          amount: p.amount,
          price: p.price,
          unit: p.unit,
          categoryId: p.categoryId,
          categoryName: p.categoryName,
        }
      })

      const productIds = model.products.map((p) => p.id)
      const products = await this.prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
      })
      if (
        model.products.some((product) => {
          const foundProduct = products.find((p) => p.id === product.id)
          if (!foundProduct) return false
          if (product.amount > foundProduct.amount) return true
          return false
        })
      ) {
        const errors: ValidateError[] = [
          {
            field: 'product',
            msg: 'Số lượng sản phẩm vượt quá số lượng trong kho. Tải lại trang để xem số lượng mới nhất',
            value: null,
          },
        ]
        return this.clientError(res, errors)
      }

      const updatedEntity = await this.updateEntity(entityId, entity)

      if (updatedEntity.status === OrderStatus.Confirmed) {
        // Trừ số lượng sản phẩm trong kho
        const requestList: any[] = []
        updatedEntity.products.forEach((product) => {
          requestList.push(
            this.prisma.product.update({
              where: {
                id: product.id,
              },
              data: {
                amount: {
                  decrement: product.amount,
                },
              },
            })
          )
        })
        await Promise.all(requestList)

        // Gửi email cho người dùng
        this.sendMailToUser(updatedEntity as Order)
      }

      // Tạo transaction
      if (entity.status === OrderStatus.Success) {
        await this.prisma.transaction.create({
          data: {
            orderId: entityId,
            productIds: updatedEntity.products.map((p) => p.id),
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

      if (model.status !== OrderStatus.Pending) return this.success(res, model)

      const productIds = model.products.map((p) => p.id)
      const products = await this.prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
      })

      const result = {
        ...model,
        products: model.products.map((product) => {
          let amountInSystem = 0
          const foundProduct = products.find((p) => p.id === product.id)
          if (foundProduct) {
            amountInSystem = foundProduct.amount
          }
          return {
            ...product,
            amountInSystem,
          }
        }),
      }

      return this.success(res, result)
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

  private sendMailToUser = async (order: Order) => {
    try {
      const htmlString = `
      <h1>Xác nhận đơn hàng của bạn</h1>
      <table>
      <style>
        table {
          border: 1px solid #000;
          width: 600px;
          border-collapse: separate;
          border-spacing: 0;
        }
        table thead tr th {
          border-bottom: 1px solid #000;
          border-right: 1px solid #000;
          padding: 0 10px;
        }
        table tbody tr td {
          border-bottom: 1px solid #000;
          border-right: 1px solid #000;
          padding: 0 10px;
        }
        table thead tr th:last-child {
          border-right: none;
          text-align: right;
        }
        table tbody tr td:last-child {
          border-right: none;
          text-align: right;
        }
        table tbody tr:last-child td {
          border-bottom: none;
        }
        table tbody tr td:first-child {
          text-align: center;
        }
        table tbody tr td:nth-child(2) {
          text-align: left;
        }
        table thead tr th:nth-child(2) {
          text-align: left;
        }
        table tbody tr td:nth-child(3) {
          text-align: left;
        }
        table thead tr th:nth-child(3) {
          text-align: left;
        }
        table tbody tr td:nth-child(4) {
          text-align: right;
        }
        table thead tr th:nth-child(4) {
          text-align: right;
        }
      </style>
        <colgroup>
          <col style="width: 50px;" />
          <col style="width: 250px;" />
          <col style="width: 100px;" />
          <col style="width: 100px;" />
          <col style="width: 100px;" />
        </colgroup>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên sản phẩm</th>
            <th>Đơn vị</th>
            <th>Đơn giá</th>
            <th>Số lượng</th>
          </tr>
        </thead>
        <tbody>
          ${order.products
            .map((product, index) => {
              return `
              <tr>
                <td>${index + 1}</td>
                <td>${product.name}</td>
                <td>${product.unit}</td>
                <td>${numberWithCommas(product.price)}</td>
                <td>${product.amount}</td>
              </tr>
              `
            })
            .join('')}
        </tbody>
      </table>
      
      <div style="margin-top: 20px;">
        <span>Thành tiền: </span>
        <span style="font-weight: 700;">${numberWithCommas(order.totalMoney)}đ</span>
      </div>`

      await sendMail(order.user.email, 'Xác nhận đơn hàng', htmlString)
    } catch (error) {
      console.log(error)
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
      include: {
        user: true,
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
