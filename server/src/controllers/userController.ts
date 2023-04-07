import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { sign, Secret } from 'jsonwebtoken'
import { genSalt, hash, compare } from 'bcrypt'
import { User, ValidateError } from '../models/entity'
import { validateEmail, validatePassword, validateRequire } from '../common/validate'
import {
  RegisterDto,
  SignInDto,
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  PagingParam,
  PagingResult,
} from '../models/dto'

export default class UserController extends BaseController {
  private readonly prisma: PrismaClient
  private readonly model
  private readonly codePrefix: string
  constructor() {
    super()
    this.prisma = new PrismaClient()
    this.model = this.prisma.user
    this.codePrefix = 'U'
  }

  create = async (req: Request, res: Response) => {
    try {
      const user: CreateUserDto = req.body

      const salt = await genSalt(10)
      const password = 'User12345'
      const encodedPassword = await hash(password, salt)
      user.password = encodedPassword

      const newUser = await this.createEntity(user)
      return this.created(res, newUser)
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  register = async (req: Request, res: Response) => {
    try {
      const validateErrors: ValidateError[] = []
      const { email, password, confirmPassword } = req.body as RegisterDto

      if (!validateRequire(email)) {
        validateErrors.push({
          field: 'email',
          value: email,
          msg: 'Email không được để trống',
        })
      }
      if (!validateRequire(password)) {
        validateErrors.push({
          field: 'password',
          value: password,
          msg: 'Mật khẩu không được để trống',
        })
      }
      if (!validateRequire(confirmPassword)) {
        validateErrors.push({
          field: 'confirmPassword',
          value: confirmPassword,
          msg: 'Xác nhận mật khẩu không được để trống',
        })
      }
      if (validateErrors.length > 0) {
        return this.clientError(res, validateErrors)
      }

      if (!validateEmail(email)) {
        validateErrors.push({
          field: 'email',
          value: email,
          msg: 'Email sai định dạng',
        })
      }
      if (!validatePassword(password)) {
        validateErrors.push({
          field: 'password',
          value: password,
          msg: 'Mật khẩu cần từ 8 đến 32 ký tự bao gồm chữ, số, chữ in hoa',
        })
      }
      if (validateErrors.length > 0) {
        return this.clientError(res, validateErrors)
      }

      if (password !== confirmPassword) {
        validateErrors.push({
          field: 'confirmPassword',
          value: confirmPassword,
          msg: 'Xác nhận mật khẩu không trùng với mật khẩu',
        })
        return this.clientError(res, validateErrors)
      }

      const foundUser = await this.model.findFirst({
        where: {
          email,
        },
      })
      if (foundUser) {
        validateErrors.push({
          field: 'email',
          value: email,
          msg: 'Email đã tồn tại',
        })
        return this.clientError(res, validateErrors)
      }

      const newCode = await this.genereateNewCode()

      const salt = await genSalt(10)
      const encodedPassword = await hash(password, salt)
      const userName = email.split('@')[0]

      const newUser = await this.createEntity({
        code: newCode,
        email: email,
        password: encodedPassword,
        name: userName,
      })

      const token = this.setJwtToken(res, newUser.id, newUser.isAdmin)

      const userInfo: UserDto = {
        id: newUser.id,
        code: newUser.code,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        isAdmin: newUser.isAdmin,
        avatar: newUser.avatar,
        address: newUser.address,
        cart: newUser.cart,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      }

      return this.success(res, {
        user: userInfo,
        token,
      })
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  signIn = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as SignInDto
      const validateErrors: ValidateError[] = []
      if (!validateRequire(email)) {
        validateErrors.push({
          field: 'email',
          value: email,
          msg: 'Email không được để trống',
        })
      }
      if (!validateRequire(password)) {
        validateErrors.push({
          field: 'password',
          value: password,
          msg: 'Mật khẩu không được để trống',
        })
      }
      if (validateErrors.length > 0) {
        return this.clientError(res, validateErrors)
      }

      const foundUser = await this.model.findFirst({
        where: {
          email,
        },
      })

      if (!foundUser) {
        validateErrors.push({
          field: 'email',
          value: email,
          msg: 'Sai email hoặc mật khẩu',
        })
        validateErrors.push({
          field: 'password',
          value: password,
          msg: 'Sai email hoặc mật khẩu',
        })
        return this.clientError(res, validateErrors)
      }

      const isSuccess = await compare(password, foundUser.password)
      if (!isSuccess) {
        validateErrors.push({
          field: 'email',
          value: email,
          msg: 'Sai email hoặc mật khẩu',
        })
        validateErrors.push({
          field: 'password',
          value: password,
          msg: 'Sai email hoặc mật khẩu',
        })
        return this.clientError(res, validateErrors)
      }

      const token = this.setJwtToken(res, foundUser.id, foundUser.isAdmin)

      const userInfo: UserDto = {
        id: foundUser.id,
        code: foundUser.code,
        name: foundUser.name,
        email: foundUser.email,
        phoneNumber: foundUser.phoneNumber,
        isAdmin: foundUser.isAdmin,
        avatar: foundUser.avatar,
        address: foundUser.address,
        cart: foundUser.cart,
        createdAt: foundUser.createdAt,
        updatedAt: foundUser.updatedAt,
      }

      return this.success(res, {
        user: userInfo,
        token,
      })
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  signOut = async () => {}

  update = async (req: Request, res: Response) => {
    try {
      const entityId: string = req.params.id
      const entity: UpdateUserDto = req.body

      const model = await this.model.findFirst({
        where: {
          id: entityId,
        },
      })
      if (!model) {
        return this.notFound(res)
      }

      this.setPrevValue(entity, model as User)

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

      const order = await this.prisma.order.findFirst({
        where: {
          userId: id,
        },
      })
      if (order) {
        const validateErrors: ValidateError[] = [
          {
            field: 'order',
            value: '',
            msg: 'Không thể xóa người dùng đã phát sinh đơn hàng',
          },
        ]
        return this.clientError(res, validateErrors)
      }

      await Promise.all([
        this.prisma.review.deleteMany({
          where: {
            userId: id,
          },
        }),
        this.prisma.viewHistory.deleteMany({
          where: {
            userId: id,
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
          OR: [
            { code: { contains: searchText } },
            { name: { contains: searchText } },
            { email: { contains: searchText } },
            { phoneNumber: { contains: searchText } },
          ],
        }
      }

      const [entities, entitiesCount] = await Promise.all([
        this.model.findMany({
          include: {
            _count: { select: { orders: true } },
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

  getCurrentUser = async (req: Request, res: Response) => {
    try {
      const id: string = req.body.userId
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

  private setJwtToken = (_: Response, userId: string, isAdmin: boolean) => {
    const secretKey: Secret = process.env.JWT_SECRET_KEY || ''
    const token = sign({ userId, isAdmin }, secretKey, {
      expiresIn: '1d',
    })

    return token
  }

  private createEntity = async (entity: CreateUserDto) => {
    const newEntity = await this.model.create({
      data: {
        code: entity.code,
        email: entity.email,
        password: entity.password,
        name: entity.name,
        address: entity.address,
        avatar: entity.avatar,
        isAdmin: entity.isAdmin,
        phoneNumber: entity.phoneNumber,
        cart: [],
      },
    })
    return newEntity
  }

  private updateEntity = async (entityId: string, entity: UpdateUserDto) => {
    const updatedEntity = await this.model.update({
      where: {
        id: entityId,
      },
      data: {
        code: entity.code,
        email: entity.email,
        name: entity.name,
        password: entity.password,
        phoneNumber: entity.phoneNumber,
        avatar: entity.avatar,
        address: entity.address,
        cart: entity.cart,
      },
    })
    return updatedEntity
  }

  private setPrevValue = (newEntity: UpdateUserDto, oldEntity: User) => {
    if (!newEntity.code) {
      newEntity.code = oldEntity.code
    }
    if (!newEntity.email) {
      newEntity.email = oldEntity.email
    }
    if (!newEntity.name) {
      newEntity.name = oldEntity.name
    }
    if (!newEntity.password) {
      newEntity.password = oldEntity.password
    }
    if (!newEntity.phoneNumber) {
      newEntity.phoneNumber = oldEntity.phoneNumber
    }
    if (!newEntity.avatar) {
      newEntity.avatar = oldEntity.avatar
    }
    if (!newEntity.address) {
      newEntity.address = oldEntity.address
    } else {
      if (newEntity.address.city && oldEntity.address?.city) {
        newEntity.address.city = oldEntity.address.city
      }
      if (newEntity.address.district && oldEntity.address?.district) {
        newEntity.address.district = oldEntity.address.district
      }
      if (newEntity.address.detail && oldEntity.address?.detail) {
        newEntity.address.detail = oldEntity.address.detail
      }
    }
    if (!newEntity.cart) {
      newEntity.cart = oldEntity.cart
    }
  }
}
