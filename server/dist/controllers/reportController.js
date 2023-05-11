"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const baseController_1 = require("./baseController");
const enum_1 = require("../models/enum");
class ReportController extends baseController_1.BaseController {
    constructor() {
        super();
        this.getStatisticalRevenue = async (req, res) => {
            const query = req.query;
            const aggregate = [
                { $match: { status: enum_1.OrderStatus.Success } },
                {
                    $group: {
                        _id: '$status',
                        totalRevenue: { $sum: '$totalMoney' },
                    },
                },
            ];
            const date = new Date();
            let start = new Date();
            let end = new Date();
            const currentYear = date.getFullYear();
            if (query.month) {
                start = new Date(currentYear, 0, 1);
                end = new Date(currentYear, 11, 30);
                aggregate[1] = {
                    $group: {
                        _id: { status: '$status', time: { $month: '$createdAt' } },
                        totalRevenue: { $sum: '$totalMoney' },
                    },
                };
            }
            else if (query.year) {
                start = new Date(currentYear - 5, 0, 1);
                end = new Date(currentYear, 11, 30);
                aggregate[1] = {
                    $group: {
                        _id: { status: '$status', time: { $year: '$createdAt' } },
                        totalRevenue: { $sum: '$totalMoney' },
                    },
                };
            }
            aggregate[0] = {
                $match: {
                    $expr: {
                        $and: [
                            {
                                $gte: [
                                    '$createdAt',
                                    {
                                        $dateFromString: {
                                            dateString: start.toISOString(),
                                        },
                                    },
                                ],
                            },
                            {
                                $lte: [
                                    '$createdAt',
                                    {
                                        $dateFromString: {
                                            dateString: end.toISOString(),
                                        },
                                    },
                                ],
                            },
                            {
                                $eq: ['$status', enum_1.OrderStatus.Success],
                            },
                        ],
                    },
                },
            };
            try {
                const totalRevenue = await this.prisma.order.aggregateRaw({
                    pipeline: aggregate,
                });
                const totalRevenueResult = totalRevenue;
                return this.success(res, totalRevenueResult.map((r) => ({
                    totalRevenue: r.totalRevenue,
                    time: r._id.time,
                })));
            }
            catch (error) {
                return this.serverError(res, error);
            }
        };
        this.getTotal = async (_, res) => {
            try {
                const [productsCount, usersCount, ordersCount, pendingOrdersCount, confirmedOrdersCount, categories, totalMoney,] = await Promise.all([
                    this.prisma.product.count(),
                    this.prisma.user.count(),
                    this.prisma.order.count(),
                    this.prisma.order.count({
                        where: {
                            status: enum_1.OrderStatus.Pending,
                        },
                    }),
                    this.prisma.order.count({
                        where: {
                            status: enum_1.OrderStatus.Confirmed,
                        },
                    }),
                    this.prisma.category.findMany({
                        select: {
                            id: true,
                            name: true,
                            products: true,
                        },
                        orderBy: {
                            products: {
                                _count: 'desc',
                            },
                        },
                    }),
                    this.prisma.order.aggregate({
                        _sum: {
                            totalMoney: true,
                        },
                    }),
                ]);
                const formattedCategories = [];
                let isGreaterThanFive = categories.length > 5 ? true : false;
                for (let index = 0; index < categories.length; index++) {
                    const category = categories[index];
                    if (index === 4 && isGreaterThanFive) {
                        formattedCategories.push({
                            ...category,
                            name: 'Khác',
                            productsCount: category.products.length,
                        });
                        continue;
                    }
                    if (index > 4) {
                        formattedCategories[4].productsCount += category.products.length;
                        continue;
                    }
                    formattedCategories.push({
                        ...category,
                        productsCount: category.products.length,
                    });
                }
                return this.success(res, {
                    productsCount,
                    usersCount,
                    ordersCount,
                    pendingOrdersCount,
                    confirmedOrdersCount,
                    categories: formattedCategories,
                    totalMoney: totalMoney._sum.totalMoney,
                });
            }
            catch (error) {
                return this.serverError(res, error);
            }
        };
        this.getStaticalRevenueOfProducts = async (req, res) => {
            try {
                const { direction, endDate, startDate, sort, pageIndex, pageSize } = req.query;
                let skip = undefined;
                let take = undefined;
                // Paging
                if (pageIndex && pageSize) {
                    const pageIndexNumber = parseInt(pageIndex);
                    const pageSizeNumber = parseInt(pageSize);
                    skip = pageSizeNumber * (pageIndexNumber - 1);
                    take = pageSizeNumber;
                }
                const formatStartDate = new Date(startDate);
                formatStartDate.setHours(0, 0, 0);
                const formatEndDate = new Date(endDate);
                formatEndDate.setHours(23, 59, 59);
                const orders = await this.prisma.order.findMany({
                    where: {
                        createdAt: {
                            gte: formatStartDate,
                            lte: formatEndDate,
                        },
                        status: { in: [enum_1.OrderStatus.Confirmed, enum_1.OrderStatus.Success] },
                    },
                    select: {
                        id: true,
                    },
                });
                const orderIds = orders.map((order) => order.id);
                const result = await this.prisma.orderDetail.groupBy({
                    by: ['productId'],
                    where: {
                        orderId: { in: orderIds },
                    },
                    _sum: {
                        amount: true,
                        total: true,
                    },
                    orderBy: {
                        _sum: {
                            [sort]: direction,
                        },
                    },
                    skip,
                    take,
                });
                const productIds = result.map((r) => r.productId);
                const products = await this.prisma.product.findMany({
                    where: {
                        id: { in: productIds },
                    },
                });
                const mapProducts = new Map();
                products.forEach((product) => {
                    mapProducts.set(product.id, product);
                });
                let additionProducts = [];
                // Nếu ko có pageIndex và pageSize tức là đang lấy báo cáo để export
                if (!pageIndex && !pageSize) {
                    additionProducts = await this.prisma.product.findMany({
                        where: {
                            id: { notIn: productIds },
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    });
                }
                additionProducts = additionProducts.map((p) => ({
                    ...p,
                    sellAmount: 0,
                    sellMoney: 0,
                }));
                let finalResult = [];
                if (direction === 'asc') {
                    finalResult = [
                        ...additionProducts,
                        ...result.map((r) => {
                            const product = mapProducts.get(r.productId);
                            return {
                                ...product,
                                sellAmount: r._sum.amount,
                                sellMoney: r._sum.total,
                            };
                        }),
                    ];
                }
                else {
                    finalResult = [
                        ...result.map((r) => {
                            const product = mapProducts.get(r.productId);
                            return {
                                ...product,
                                sellAmount: r._sum.amount,
                                sellMoney: r._sum.total,
                            };
                        }),
                        ...additionProducts,
                    ];
                }
                return this.success(res, finalResult);
            }
            catch (error) {
                return this.serverError(res, error);
            }
        };
        this.prisma = new client_1.PrismaClient();
    }
}
exports.default = ReportController;
