import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { BaseController } from './baseController'
import { AssociationRule, Category, Product } from '../models/entity'
import { CreateCategoryDto, PagingParam, PagingResult, UpdateCategoryDto } from '../models/dto'

export default class AssociationRuleController extends BaseController {
  private readonly prisma: PrismaClient
  private readonly model
  constructor() {
    super()
    this.prisma = new PrismaClient()
    this.model = this.prisma.associationRule
  }

  getPaging = async (req: Request, res: Response) => {
    try {
      const { pageIndex, pageSize, sort, direction } = req.query as PagingParam
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
      // if (searchText) {
      //   where = {
      //     OR: [{ code: { contains: searchText } }, { name: { contains: searchText } }],
      //   }
      // }

      const [entities, entitiesCount] = await Promise.all([
        this.model.findMany({
          include: {
            productAntecedents: {
              select: {
                id: true,
                code: true,
                name: true,
                image: true,
                price: true,
                unit: true,
              },
            },
            productConsequents: {
              select: {
                id: true,
                code: true,
                name: true,
                image: true,
                price: true,
                unit: true,
              },
            },
          },
          where,
          skip,
          take,
          orderBy: orderBy,
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

  getSuggestion = async (req: Request, res: Response) => {
    try {
      let antecedentsString = req.query.ids
      if (!antecedentsString) antecedentsString = ''
      else if (typeof antecedentsString !== 'string')
        return this.clientError(res, 'Incorrect Id list')

      const antecedents = antecedentsString.split(';')
      const limit = 12

      let associationRules: any[] = []
      if (antecedentsString) {
        associationRules = await this.model.findMany({
          select: {
            productConsequents: {
              select: {
                id: true,
                code: true,
                name: true,
                image: true,
                price: true,
                unit: true,
                categoryId: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            lift: true,
            confidence: true,
          },
          where: {
            antecedents: {
              hasSome: antecedents,
            },
          },
          orderBy: [
            {
              lift: 'desc',
            },
            {
              confidence: 'desc',
            },
            {
              support: 'desc',
            },
          ],
          take: limit,
        })
      }

      const products: Product[] = []

      let count = 0

      for (let i = 0; i < associationRules.length; i++) {
        const rule: AssociationRule = associationRules[i]
        for (let j = 0; j < rule.productConsequents.length; j++) {
          const p = rule.productConsequents[j]
          if (
            !antecedents.includes(p.id) &&
            products.findIndex((productResult) => productResult.id === p.id) === -1
          ) {
            products.push(p)
            count += 1
          }
          if (count === limit) break
        }
        if (count === limit) break
      }

      const exceptIds = products.map((p) => p.id)
      if (antecedentsString) {
        exceptIds.push(...antecedents)
      }

      const result = await this.addProducts(products, exceptIds, limit)
      return this.success(res, result)
    } catch (error) {
      return this.serverError(res, error)
    }
  }

  private addProducts = async (products: Product[], exceptIds: string[] = [], limit = 12) => {
    const productsCount = products.length
    if (productsCount === limit) return products
    const result = [...products]
    const addProductsCount = limit - productsCount
    const addProducts = await this.prisma.product.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        image: true,
        price: true,
        unit: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      where: {
        id: {
          notIn: exceptIds,
        },
      },
      take: addProductsCount,
      orderBy: {
        transactions: {
          _count: 'desc',
        },
      },
    })
    addProducts.forEach((p) => {
      result.push(p as Product)
    })
    return result
  }
}
