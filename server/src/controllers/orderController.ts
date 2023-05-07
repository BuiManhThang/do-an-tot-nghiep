import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { Order, OrderDetail, Product, ProductInOrder, ValidateError } from '../models/entity'
import {
  CreateOrderDto,
  PagingResult,
  UpdateOrderDto,
  PagingOrderParam,
  WhereOrderParam,
  CreateOrderDetailDto,
} from '../models/dto'
import { OrderStatus } from '../models/enum'
import { sendMail } from '../common/mailService'
import { numberWithCommas } from '../common/format'

type OrderSendMail = {
  code: string
  createdAt: Date
  userName: string
  userEmail: string
  products: ProductInOrder[]
  totalMoney: number
}

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

      // Kiểm tra số lượng trong kho
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
      const detailOrders: CreateOrderDetailDto[] = entity.products.map((product) => ({
        amount: product.amount,
        price: product.price,
        productId: product.id,
        total: product.amount * product.price,
      }))
      const newEntity = await this.model.create({
        data: {
          code: entity.code,
          note: entity.note,
          totalMoney: entity.totalMoney,
          userId: entity.userId,
          orderDetails: {
            createMany: {
              data: detailOrders,
            },
          },
        },
      })

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
        include: {
          orderDetails: {
            include: {
              product: true,
            },
          },
        },
      })
      if (!model) {
        return this.notFound(res)
      }

      if (!entity.code) {
        entity.code = model.code
      }
      if (!entity.note) {
        entity.note = model.note || undefined
      }
      if (!entity.status) {
        entity.status = model.status
      }
      if (!entity.totalMoney) {
        entity.totalMoney = model.totalMoney
      }
      if (!entity.userId) {
        entity.userId = model.userId
      }

      const productOfOrders: { id: string; amount: number }[] = model.orderDetails.map(
        (orderDetail) => {
          return {
            id: orderDetail.product.id,
            amount: orderDetail.amount,
          }
        }
      )
      // Kiểm tra số lượng trong kho
      const productIds = productOfOrders.map((p) => p.id)
      const products = await this.prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
      })
      if (
        productOfOrders.some((product) => {
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
        },
      })

      if (updatedEntity.status === OrderStatus.Confirmed) {
        // Trừ số lượng sản phẩm trong kho
        const requestList: any[] = []
        productOfOrders.forEach((product) => {
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

        const formatedUpdateEntity: OrderSendMail = {
          code: updatedEntity.code,
          createdAt: updatedEntity.createdAt,
          totalMoney: updatedEntity.totalMoney,
          userName: updatedEntity.user.name,
          userEmail: updatedEntity.user.email,
          products: entity.products,
        }

        // Gửi email cho người dùng
        this.sendMailToUser(formatedUpdateEntity)
      }

      // Tạo transaction
      if (entity.status === OrderStatus.Success) {
        await this.prisma.transaction.create({
          data: {
            orderId: entityId,
            productIds: productIds,
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

      await this.prisma.orderDetail.deleteMany({
        where: {
          orderId: id,
        },
      })

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
          orderDetails: {
            include: {
              product: true,
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

      if (model.status !== OrderStatus.Pending) {
        return this.success(res, {
          ...model,
          products: model.orderDetails.map((orderDetail) => ({
            ...orderDetail.product,
            amount: orderDetail.amount,
          })),
        })
      }

      const productIds = model.orderDetails.map((orderDetail) => orderDetail.productId)
      const products = await this.prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
      })

      const result = {
        ...model,
        products: model.orderDetails.map((orderDetail) => {
          let amountInSystem = 0
          const foundProduct = products.find((p) => p.id === orderDetail.productId)
          if (foundProduct) {
            amountInSystem = foundProduct.amount
          }
          return {
            ...orderDetail.product,
            amount: orderDetail.amount,
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
            orderDetails: {
              include: {
                product: true,
              },
            },
          },
          where,
          skip,
          take,
          orderBy: sort === 'products' ? { orderDetails: { _count: direction } } : orderBy,
        }),
        this.model.count({
          where,
        }),
      ])
      const pagingResult: PagingResult = {
        data: entities.map((entity) => ({
          ...entity,
          orderDetails: null,
          products: entity.orderDetails.map((orderDetail) => ({
            ...orderDetail.product,
            amount: orderDetail.amount,
          })),
        })),
        total: entitiesCount,
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

  private sendMailToUser = async (order: OrderSendMail) => {
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

      await sendMail(order.userEmail, 'Xác nhận đơn hàng', htmlString)
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
}
