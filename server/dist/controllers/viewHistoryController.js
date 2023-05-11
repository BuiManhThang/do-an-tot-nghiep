"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const baseController_1 = require("./baseController");
class ViewHistoryController extends baseController_1.BaseController {
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
        this.userCreate = async (req, res) => {
            try {
                const entity = req.body;
                const product = await this.prisma.product.findFirst({
                    where: {
                        id: entity.productId,
                    },
                });
                if (!product)
                    return this.notFound(res);
                const entities = await this.model.findMany({
                    where: {
                        userId: entity.userIdFromToken,
                    },
                    take: 4,
                    orderBy: { createdAt: 'asc' },
                });
                if (entities.length >= 4) {
                    await this.model.delete({
                        where: {
                            id: entities[0].id,
                        },
                    });
                }
                const existedEntity = entities.find((e) => e.productId === entity.productId);
                if (existedEntity)
                    return this.notContent(res);
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
                const { pageIndex, pageSize, sort, direction, userId, productId } = req.query;
                let skip = undefined;
                let take = undefined;
                let where = {};
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
                if (userId) {
                    where.userId = userId;
                }
                if (productId) {
                    where.productId = productId;
                }
                const [entities, entitiesCount] = await Promise.all([
                    this.model.findMany({
                        include: {
                            product: {
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
        this.createEntity = async (entity) => {
            const newEntity = await this.model.create({
                data: {
                    userId: entity.userIdFromToken,
                    productId: entity.productId,
                },
            });
            return newEntity;
        };
        this.updateEntity = async (entityId, entity) => {
            const updatedEntity = await this.model.update({
                where: {
                    id: entityId,
                },
                data: {
                    userId: entity.userIdFromToken,
                    productId: entity.productId,
                },
            });
            return updatedEntity;
        };
        this.setPrevValue = (newEntity, oldEntity) => {
            if (!newEntity.userIdFromToken) {
                newEntity.userIdFromToken = oldEntity.userId;
            }
            if (!newEntity.productId) {
                newEntity.productId = oldEntity.productId;
            }
        };
        this.prisma = new client_1.PrismaClient();
        this.model = this.prisma.viewHistory;
    }
}
exports.default = ViewHistoryController;
