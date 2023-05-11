"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = __importDefault(require("../controllers/categoryController"));
const authorize_1 = require("../common/authorize");
const categoryController = new categoryController_1.default();
const categoryRouter = (0, express_1.Router)();
categoryRouter.get('/paging', categoryController.getPaging);
categoryRouter.get('/new-code', authorize_1.authorizeAdmin, categoryController.getNewCode);
categoryRouter.get('/:id', categoryController.getById);
categoryRouter.get('/', authorize_1.authorizeAdmin, categoryController.getAll);
categoryRouter.post('/', authorize_1.authorizeAdmin, categoryController.create);
categoryRouter.put('/:id', authorize_1.authorizeAdmin, categoryController.update);
categoryRouter.delete('/:id', authorize_1.authorizeAdmin, categoryController.delete);
exports.default = categoryRouter;
