"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const baseController_1 = require("./baseController");
class ReviewController extends baseController_1.BaseController {
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
                const { pageIndex, pageSize, sort, direction, searchText, productId, userId } = req.query;
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
                if (searchText) {
                    where.OR = [
                        {
                            user: {
                                OR: [
                                    { code: { contains: searchText, mode: 'insensitive' } },
                                    { name: { contains: searchText, mode: 'insensitive' } },
                                    { email: { contains: searchText, mode: 'insensitive' } },
                                ],
                            },
                        },
                        {
                            product: {
                                OR: [
                                    { code: { contains: searchText, mode: 'insensitive' } },
                                    { name: { contains: searchText, mode: 'insensitive' } },
                                ],
                            },
                        },
                    ];
                }
                if (productId !== undefined) {
                    where.productId = productId;
                }
                if (userId !== undefined) {
                    where.userId = userId;
                }
                const [entities, entitiesCount] = await Promise.all([
                    this.model.findMany({
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    avatar: true,
                                    code: true,
                                    email: true,
                                    name: true,
                                    phoneNumber: true,
                                },
                            },
                            product: {
                                select: {
                                    image: true,
                                    code: true,
                                    name: true,
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
                    productId: entity.productId,
                    userId: entity.userId,
                    score: entity.score,
                    comment: entity.comment,
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
                    score: entity.score,
                    comment: entity.comment,
                },
            });
            return updatedEntity;
        };
        this.setPrevValue = (newEntity, oldEntity) => {
            if (!newEntity.score) {
                newEntity.score = oldEntity.score;
            }
            if (!newEntity.comment) {
                newEntity.comment = oldEntity.comment;
            }
        };
        this.prisma = new client_1.PrismaClient();
        this.model = this.prisma.review;
    }
}
exports.default = ReviewController;
