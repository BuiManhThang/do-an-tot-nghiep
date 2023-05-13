"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = __importDefault(require("../controllers/orderController"));
const authorize_1 = require("../common/authorize");
const orderController = new orderController_1.default();
const orderRouter = (0, express_1.Router)();
orderRouter.get('/update-custom', authorize_1.authorizeAdmin, orderController.updateCustom);
orderRouter.get('/paging', orderController.getPaging);
orderRouter.get('/new-code', authorize_1.authorizeAdmin, orderController.getNewCode);
orderRouter.get('/:id', authorize_1.authorize, orderController.getById);
orderRouter.get('/', authorize_1.authorizeAdmin, orderController.getAll);
orderRouter.post('/', authorize_1.authorize, orderController.create);
orderRouter.put('/:id', authorize_1.authorizeAdmin, orderController.update);
orderRouter.delete('/:id', authorize_1.authorize, orderController.delete);
exports.default = orderRouter;
