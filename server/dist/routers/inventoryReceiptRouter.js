"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventoryReceiptController_1 = __importDefault(require("../controllers/inventoryReceiptController"));
const authorize_1 = require("../common/authorize");
const inventoryReceiptController = new inventoryReceiptController_1.default();
const inventoryReceiptRouter = (0, express_1.Router)();
inventoryReceiptRouter.get('/paging', authorize_1.authorizeAdmin, inventoryReceiptController.getPaging);
inventoryReceiptRouter.get('/new-code', authorize_1.authorizeAdmin, inventoryReceiptController.getNewCode);
inventoryReceiptRouter.get('/:id', authorize_1.authorizeAdmin, inventoryReceiptController.getById);
inventoryReceiptRouter.post('/', authorize_1.authorize, inventoryReceiptController.create);
exports.default = inventoryReceiptRouter;
