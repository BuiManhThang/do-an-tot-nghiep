"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const baseController_1 = require("./baseController");
const jsonwebtoken_1 = require("jsonwebtoken");
const bcrypt_1 = require("bcrypt");
const validate_1 = require("../common/validate");
const mailService_1 = require("../common/mailService");
class UserController extends baseController_1.BaseController {
    constructor() {
        super();
        this.create = async (req, res) => {
            try {
                const user = req.body;
                const salt = await (0, bcrypt_1.genSalt)(10);
                const password = 'User12345';
                const encodedPassword = await (0, bcrypt_1.hash)(password, salt);
                user.password = encodedPassword;
                const newUser = await this.createEntity(user);
                return this.created(res, newUser);
            }
            catch (error) {
                return this.serverError(res, error);
            }
        };
        this.register = async (req, res) => {
            try {
                const validateErrors = [];
                const { email, password, confirmPassword } = req.body;
                if (!(0, validate_1.validateRequire)(email)) {
                    validateErrors.push({
                        field: 'email',
                        value: email,
                        msg: 'Email không được để trống',
                    });
                }
                if (!(0, validate_1.validateRequire)(password)) {
                    validateErrors.push({
                        field: 'password',
                        value: password,
                        msg: 'Mật khẩu không được để trống',
                    });
                }
                if (!(0, validate_1.validateRequire)(confirmPassword)) {
                    validateErrors.push({
                        field: 'confirmPassword',
                        value: confirmPassword,
                        msg: 'Xác nhận mật khẩu không được để trống',
                    });
                }
                if (validateErrors.length > 0) {
                    return this.clientError(res, validateErrors);
                }
                if (!(0, validate_1.validateEmail)(email)) {
                    validateErrors.push({
                        field: 'email',
                        value: email,
                        msg: 'Email sai định dạng',
                    });
                }
                if (!(0, validate_1.validatePassword)(password)) {
                    validateErrors.push({
                        field: 'password',
                        value: password,
                        msg: 'Mật khẩu cần từ 8 đến 32 ký tự bao gồm chữ, số, chữ in hoa',
                    });
                }
                if (validateErrors.length > 0) {
                    return this.clientError(res, validateErrors);
                }
                if (password !== confirmPassword) {
                    validateErrors.push({
                        field: 'confirmPassword',
                        value: confirmPassword,
                        msg: 'Xác nhận mật khẩu không trùng với mật khẩu',
                    });
                    return this.clientError(res, validateErrors);
                }
                const foundUser = await this.model.findFirst({
                    where: {
                        email,
                    },
                });
                if (foundUser) {
                    validateErrors.push({
                        field: 'email',
                        value: email,
                        msg: 'Email đã tồn tại',
                    });
                    return this.clientError(res, validateErrors);
                }
                const newCode = await this.genereateNewCode();
                const salt = await (0, bcrypt_1.genSalt)(10);
                const encodedPassword = await (0, bcrypt_1.hash)(password, salt);
                const userName = email.split('@')[0];
                const newUser = await this.createEntity({
                    code: newCode,
                    email: email,
                    password: encodedPassword,
                    name: userName,
                });
                const token = this.setJwtToken(res, newUser.id, newUser.isAdmin);
                const userInfo = {
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
                };
                return this.success(res, {
                    user: userInfo,
                    token,
                });
            }
            catch (error) {
                return this.serverError(res, error);
            }
        };
        this.signIn = async (req, res) => {
            try {
                const { email, password } = req.body;
                const validateErrors = [];
                if (!(0, validate_1.validateRequire)(email)) {
                    validateErrors.push({
                        field: 'email',
                        value: email,
                        msg: 'Email không được để trống',
                    });
                }
                if (!(0, validate_1.validateRequire)(password)) {
                    validateErrors.push({
                        field: 'password',
                        value: password,
                        msg: 'Mật khẩu không được để trống',
                    });
                }
                if (validateErrors.length > 0) {
                    return this.clientError(res, validateErrors);
                }
                const foundUser = await this.model.findFirst({
                    where: {
                        email,
                    },
                });
                if (!foundUser) {
                    validateErrors.push({
                        field: 'email',
                        value: email,
                        msg: 'Sai email hoặc mật khẩu',
                    });
                    validateErrors.push({
                        field: 'password',
                        value: password,
                        msg: 'Sai email hoặc mật khẩu',
                    });
                    return this.clientError(res, validateErrors);
                }
                const isSuccess = await (0, bcrypt_1.compare)(password, foundUser.password);
                if (!isSuccess) {
                    validateErrors.push({
                        field: 'email',
                        value: email,
                        msg: 'Sai email hoặc mật khẩu',
                    });
                    validateErrors.push({
                        field: 'password',
                        value: password,
                        msg: 'Sai email hoặc mật khẩu',
                    });
                    return this.clientError(res, validateErrors);
                }
                const token = this.setJwtToken(res, foundUser.id, foundUser.isAdmin);
                const userInfo = {
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
                };
                return this.success(res, {
                    user: userInfo,
                    token,
                });
            }
            catch (error) {
                return this.serverError(res, error);
            }
        };
        this.signOut = async () => { };
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
                const order = await this.prisma.order.findFirst({
                    where: {
                        userId: id,
                    },
                });
                if (order) {
                    const validateErrors = [
                        {
                            field: 'order',
                            value: '',
                            msg: 'Không thể xóa người dùng đã phát sinh đơn hàng',
                        },
                    ];
                    return this.clientError(res, validateErrors);
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
                if (searchText) {
                    where = {
                        OR: [
                            { code: { contains: searchText, mode: 'insensitive' } },
                            { name: { contains: searchText, mode: 'insensitive' } },
                            { email: { contains: searchText, mode: 'insensitive' } },
                            { phoneNumber: { contains: searchText, mode: 'insensitive' } },
                        ],
                    };
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
        this.getCurrentUser = async (req, res) => {
            try {
                const id = req.body.userIdFromToken;
                const model = await this.model.findFirst({
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        email: true,
                        address: true,
                        avatar: true,
                        cart: true,
                        isAdmin: true,
                        phoneNumber: true,
                        viewHistorys: {
                            select: {
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
                        },
                        createdAt: true,
                        updatedAt: true,
                    },
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
        this.resetPassword = async (req, res) => {
            try {
                const validateErrors = [];
                const { email, password, confirmPassword } = req.body;
                if (!(0, validate_1.validateRequire)(password)) {
                    validateErrors.push({
                        field: 'password',
                        value: password,
                        msg: 'Mật khẩu không được để trống',
                    });
                }
                if (!(0, validate_1.validateRequire)(confirmPassword)) {
                    validateErrors.push({
                        field: 'confirmPassword',
                        value: confirmPassword,
                        msg: 'Xác nhận mật khẩu không được để trống',
                    });
                }
                if (validateErrors.length > 0) {
                    return this.clientError(res, validateErrors);
                }
                if (!(0, validate_1.validatePassword)(password)) {
                    validateErrors.push({
                        field: 'password',
                        value: password,
                        msg: 'Mật khẩu cần từ 8 đến 32 ký tự bao gồm chữ, số, chữ in hoa',
                    });
                }
                if (validateErrors.length > 0) {
                    return this.clientError(res, validateErrors);
                }
                if (password !== confirmPassword) {
                    validateErrors.push({
                        field: 'confirmPassword',
                        value: confirmPassword,
                        msg: 'Xác nhận mật khẩu không trùng với mật khẩu',
                    });
                    return this.clientError(res, validateErrors);
                }
                const user = await this.model.findFirst({
                    where: {
                        email: email,
                    },
                });
                if (!user)
                    return this.notFound(res);
                const salt = await (0, bcrypt_1.genSalt)(10);
                const encodedPassword = await (0, bcrypt_1.hash)(password, salt);
                const updatedUser = await this.model.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        password: encodedPassword,
                    },
                });
                const userInfo = {
                    id: updatedUser.id,
                    code: updatedUser.code,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    phoneNumber: updatedUser.phoneNumber,
                    isAdmin: updatedUser.isAdmin,
                    avatar: updatedUser.avatar,
                    address: updatedUser.address,
                    cart: updatedUser.cart,
                    createdAt: updatedUser.createdAt,
                    updatedAt: updatedUser.updatedAt,
                };
                return this.success(res, userInfo);
            }
            catch (error) {
                return this.serverError(res, error);
            }
        };
        this.sendMailResetPassword = async (req, res) => {
            try {
                const resetPasswordBody = req.body;
                const user = await this.model.findFirst({
                    where: {
                        email: resetPasswordBody.email,
                    },
                });
                if (!user) {
                    return this.notFound(res);
                }
                const token = this.setJwtTokenForResetPassword(resetPasswordBody.email);
                const htmlString = `
        <h1>Đặt lại mật khẩu</h1>
        <p>Bấm vào <a href="${process.env.CLIENT_URL}/reset-password?token=${token}">đây</a> để đặt lại mật khẩu</p>
      `;
                (0, mailService_1.sendMail)(resetPasswordBody.email, 'Đặt lại mật khẩu', htmlString);
                return this.success(res, true);
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
        this.setJwtToken = (_, userId, isAdmin) => {
            const secretKey = process.env.JWT_SECRET_KEY || '';
            const token = (0, jsonwebtoken_1.sign)({ userId, isAdmin }, secretKey, {
                expiresIn: '1d',
            });
            return token;
        };
        this.setJwtTokenForResetPassword = (email) => {
            const secretKey = process.env.JWT_SECRET_KEY || '';
            const token = (0, jsonwebtoken_1.sign)({ email }, secretKey, {
                expiresIn: '10m',
            });
            return token;
        };
        this.createEntity = async (entity) => {
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
                    email: entity.email,
                    name: entity.name,
                    password: entity.password,
                    phoneNumber: entity.phoneNumber,
                    avatar: entity.avatar,
                    address: entity.address,
                    cart: entity.cart,
                },
            });
            return updatedEntity;
        };
        this.setPrevValue = (newEntity, oldEntity) => {
            if (!newEntity.code) {
                newEntity.code = oldEntity.code;
            }
            if (!newEntity.email) {
                newEntity.email = oldEntity.email;
            }
            if (!newEntity.name) {
                newEntity.name = oldEntity.name;
            }
            if (!newEntity.password) {
                newEntity.password = oldEntity.password;
            }
            if (!newEntity.phoneNumber) {
                newEntity.phoneNumber = oldEntity.phoneNumber;
            }
            if (!newEntity.avatar) {
                newEntity.avatar = oldEntity.avatar;
            }
            if (!newEntity.address) {
                newEntity.address = oldEntity.address;
            }
            else {
                if (newEntity.address.city && oldEntity.address?.city) {
                    newEntity.address.city = oldEntity.address.city;
                }
                if (newEntity.address.district && oldEntity.address?.district) {
                    newEntity.address.district = oldEntity.address.district;
                }
                if (newEntity.address.detail && oldEntity.address?.detail) {
                    newEntity.address.detail = oldEntity.address.detail;
                }
            }
            if (!newEntity.cart) {
                newEntity.cart = oldEntity.cart;
            }
        };
        this.prisma = new client_1.PrismaClient();
        this.model = this.prisma.user;
        this.codePrefix = 'U';
    }
}
exports.default = UserController;
