"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const baseController_1 = require("./baseController");
class ProductController extends baseController_1.BaseController {
    constructor() {
        super();
        this.create = async (req, res) => {
            try {
                const entity = req.body;
                const newEntity = await this.createEntity(entity);
                return this.created(res, newEntity);
            }
            catch (error) {
                return this.serverError(res, error);
            }
        };
        this.update = async (req, res) => {
            try {
                const entityId = req.params.id;
                const entity = req.body;
                const model = await this.model.findFirst({
                    where: {
                        id: entityId,
                    },
                });
                if (!model) {
                    return this.notFound(res);
                }
                this.setPrevValue(entity, model);
                const updatedEntity = await this.updateEntity(entityId, entity);
                // Cập nhật sản phẩm trong giỏ hàng
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
                });
                return this.updated(res, updatedEntity);
            }
            catch (error) {
                return this.serverError(res, error);
            }
        };
        this.delete = async (req, res) => {
            try {
                const id = req.params.id;
                const model = await this.model.findFirst({
                    where: {
                        id,
                    },
                });
                if (!model) {
                    return this.notFound(res);
                }
                // Kiểm tra sản phẩm có trong đơn hàng đã xác nhận hay ko
                const order = await this.prisma.order.findFirst({
                    where: {
                        orderDetails: { some: { productId: id } },
                        status: { in: [2, 3] },
                    },
                });
                if (order) {
                    const errors = [
                        {
                            field: 'order',
                            msg: 'Không thể xóa sản phẩm đang trong đơn hàng đã xác nhận hoặc đã thanh toán',
                            value: order,
                        },
                    ];
                    return this.clientError(res, errors);
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
                ]);
                const deletedModel = await this.model.delete({
                    where: {
                        id,
                    },
                });
                return this.deleted(res, deletedModel);
            }
            catch (error) {
                return this.serverError(res, error);
            }
        };
        this.getById = async (req, res) => {
            try {
                const id = req.params.id;
                const model = await this.model.findFirst({
                    where: {
                        id,
                    },
                    include: {
                        category: true,
                    },
                });
                if (!model) {
                    return this.notFound(res);
                }
                return this.success(res, model);
            }
            catch (error) {
                return this.serverError(res, error);
            }
        };
        this.getAll = async (_, res) => {
            try {
                const models = await this.model.findMany();
                return this.success(res, models);
            }
            catch (error) {
                return this.serverError(res, error);
            }
        };
        this.getPaging = async (req, res) => {
            try {
                const { pageIndex, pageSize, sort, direction, searchText, categoryId, isActive, priceGte, priceLte, } = req.query;
                let skip = undefined;
                let take = undefined;
                let orderBy = undefined;
                let where = {};
                // Paging
                if (pageIndex !== undefined && pageSize !== undefined) {
                    const pageIndexNumber = parseInt(pageIndex);
                    const pageSizeNumber = parseInt(pageSize);
                    skip = pageSizeNumber * (pageIndexNumber - 1);
                    take = pageSizeNumber;
                }
                // Sort
                if (sort !== undefined && direction !== undefined) {
                    orderBy = {
                        [sort]: direction,
                    };
                }
                // Filter
                if (searchText !== undefined) {
                    where.OR = [
                        { code: { contains: searchText, mode: 'insensitive' } },
                        { name: { contains: searchText, mode: 'insensitive' } },
                    ];
                }
                if (categoryId !== undefined) {
                    where.categoryId = {
                        in: categoryId.split(';'),
                    };
                }
                if (isActive !== undefined) {
                    where.isActive = JSON.parse(isActive);
                }
                if (priceGte !== undefined || priceLte !== undefined) {
                    where.price = {};
                    if (priceGte !== undefined) {
                        where.price.gte = parseInt(priceGte);
                    }
                    if (priceLte !== undefined) {
                        where.price.lte = parseInt(priceLte);
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
        this.getProductsByIds = async (req, res) => {
            try {
                const productIdsString = req.params.ids;
                const productIds = productIdsString.split(';');
                const products = await this.model.findMany({
                    where: {
                        id: { in: productIds },
                    },
                });
                return this.success(res, products);
            }
            catch (error) {
                return this.serverError(res, error);
            }
        };
        this.getNewCode = async (_, res) => {
            try {
                const newCode = await this.genereateNewCode();
                return this.success(res, newCode);
            }
            catch (error) {
                return this.serverError(res, error);
            }
        };
        this.genereateNewCode = async () => {
            const entities = await this.model.findMany({
                orderBy: {
                    code: 'desc',
                },
                take: 1,
            });
            let code = `${this.codePrefix}.0001`;
            if (entities.length > 0) {
                const newestEntity = entities[0];
                const newestEntityCode = newestEntity.code;
                const codeArr = newestEntityCode.split('.');
                const codeNumber = parseInt(codeArr[1]);
                const newCodeNumber = codeNumber + 1;
                code = `${this.codePrefix}.${newCodeNumber.toString().padStart(4, '0')}`;
            }
            return code;
        };
        this.createEntity = async (entity) => {
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
            });
            return newEntity;
        };
        this.updateEntity = async (entityId, entity) => {
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
            });
            return updatedEntity;
        };
        this.setPrevValue = (newEntity, oldEntity) => {
            if (!newEntity.code) {
                newEntity.code = oldEntity.code;
            }
            if (!newEntity.name) {
                newEntity.name = oldEntity.name;
            }
            if (!newEntity.image) {
                newEntity.image = oldEntity.image;
            }
            if (!newEntity.amount) {
                newEntity.amount = oldEntity.amount;
            }
            if (!newEntity.price) {
                newEntity.price = oldEntity.price;
            }
            if (!newEntity.unit) {
                newEntity.unit = oldEntity.unit;
            }
            if (!newEntity.isActive) {
                newEntity.isActive = oldEntity.isActive;
            }
            if (!newEntity.gallery) {
                newEntity.gallery = oldEntity.gallery;
            }
            if (!newEntity.desc) {
                newEntity.desc = oldEntity.desc;
            }
            if (!newEntity.categoryId) {
                newEntity.categoryId = oldEntity.categoryId;
            }
        };
        this.prisma = new client_1.PrismaClient();
        this.model = this.prisma.product;
        this.codePrefix = 'P';
    }
}
exports.default = ProductController;
