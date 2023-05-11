"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = __importDefault(require("../controllers/productController"));
const authorize_1 = require("../common/authorize");
const productController = new productController_1.default();
const productRouter = (0, express_1.Router)();
productRouter.get('/paging', productController.getPaging);
productRouter.get('/new-code', authorize_1.authorizeAdmin, productController.getNewCode);
productRouter.get('/ids/:ids', productController.getProductsByIds);
productRouter.get('/:id', productController.getById);
productRouter.get('/', authorize_1.authorizeAdmin, productController.getAll);
productRouter.post('/', authorize_1.authorizeAdmin, productController.create);
productRouter.put('/:id', authorize_1.authorizeAdmin, productController.update);
productRouter.delete('/:id', authorize_1.authorizeAdmin, productController.delete);
exports.default = productRouter;
