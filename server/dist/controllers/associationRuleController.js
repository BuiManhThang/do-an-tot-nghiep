"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const baseController_1 = require("./baseController");
class AssociationRuleController extends baseController_1.BaseController {
    constructor() {
        super();
        this.getPaging = async (req, res) => {
            try {
                const { pageIndex, pageSize, sort, direction } = req.query;
                let skip = undefined;
                let take = undefined;
                let where = undefined;
                let orderBy = undefined;
                // Paging
                if (pageIndex && pageSize) {
                    const pageIndexNumber = parseInt(pageIndex);
                    const pageSizeNumber = parseInt(pageSize);
                    skip = pageSizeNumber * (pageIndexNumber - 1);
                    take = pageSizeNumber;
                }
                // Sort
                if (sort && direction) {
                    orderBy = {
                        [sort]: direction,
                    };
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
                ]);
                const pagingResult = {
                    data: entities,
                    total: entitiesCount._count,
                };
                return this.success(res, pagingResult);
            }
            catch (error) {
                return this.serverError(res, error);
            }
        };
        this.getSuggestion = async (req, res) => {
            try {
                let antecedentsString = req.query.ids;
                if (!antecedentsString)
                    antecedentsString = '';
                else if (typeof antecedentsString !== 'string')
                    return this.clientError(res, 'Incorrect Id list');
                const antecedents = antecedentsString.split(';');
                const limit = 12;
                let associationRules = [];
                if (antecedentsString) {
                    associationRules = await this.model.findMany({
                        select: {
                            productConsequents: {
                                where: {
                                    isActive: true,
                                },
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
                    });
                }
                const products = [];
                let count = 0;
                for (let i = 0; i < associationRules.length; i++) {
                    const rule = associationRules[i];
                    for (let j = 0; j < rule.productConsequents.length; j++) {
                        const p = rule.productConsequents[j];
                        if (!antecedents.includes(p.id) &&
                            products.findIndex((productResult) => productResult.id === p.id) === -1) {
                            products.push(p);
                            count += 1;
                        }
                        if (count === limit)
                            break;
                    }
                    if (count === limit)
                        break;
                }
                const exceptIds = products.map((p) => p.id);
                if (antecedentsString) {
                    exceptIds.push(...antecedents);
                }
                const result = await this.addProducts(products, exceptIds, limit);
                return this.success(res, result);
            }
            catch (error) {
                return this.serverError(res, error);
            }
        };
        this.addProducts = async (products, exceptIds = [], limit = 12) => {
            const productsCount = products.length;
            if (productsCount === limit)
                return products;
            const result = [...products];
            const addProductsCount = limit - productsCount;
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
                    isActive: true,
                },
                take: addProductsCount,
                orderBy: {
                    transactions: {
                        _count: 'desc',
                    },
                },
            });
            addProducts.forEach((p) => {
                result.push(p);
            });
            return result;
        };
        this.prisma = new client_1.PrismaClient();
        this.model = this.prisma.associationRule;
    }
}
exports.default = AssociationRuleController;
