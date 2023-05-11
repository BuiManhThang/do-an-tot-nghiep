"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const baseController_1 = require("./baseController");
class CategoryController extends baseController_1.BaseController {
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
                const product = await this.prisma.product.findFirst({
                    where: {
                        categoryId: id,
                    },
                });
                if (product) {
                    const errors = [
                        {
                            field: 'product',
                            msg: 'Không thể xóa doanh mục đã có sản phẩm',
                            value: product,
                        },
                    ];
                    return this.clientError(res, errors);
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
                const { pageIndex, pageSize, sort, direction, searchText } = req.query;
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
                if (searchText !== undefined) {
                    where.OR = [
                        { code: { contains: searchText, mode: 'insensitive' } },
                        { name: { contains: searchText, mode: 'insensitive' } },
                    ];
                }
                const [entities, entitiesCount] = await Promise.all([
                    this.model.findMany({
                        include: {
                            _count: { select: { products: true } },
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
                    desc: entity.desc,
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
                    code: entity.code,
                    name: entity.name,
                    image: entity.image,
                    desc: entity.desc,
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
            if (!newEntity.desc) {
                newEntity.desc = oldEntity.desc;
            }
        };
        this.prisma = new client_1.PrismaClient();
        this.model = this.prisma.category;
        this.codePrefix = 'C';
    }
}
exports.default = CategoryController;
