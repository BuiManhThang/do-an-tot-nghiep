"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewController_1 = __importDefault(require("../controllers/reviewController"));
const authorize_1 = require("../common/authorize");
const reviewController = new reviewController_1.default();
const reviewRouter = (0, express_1.Router)();
reviewRouter.get('/paging', reviewController.getPaging);
reviewRouter.get('/:id', reviewController.getById);
reviewRouter.get('/', authorize_1.authorizeAdmin, reviewController.getAll);
reviewRouter.post('/', authorize_1.authorize, reviewController.create);
reviewRouter.put('/:id', authorize_1.authorize, reviewController.update);
reviewRouter.delete('/:id', authorize_1.authorize, reviewController.delete);
exports.default = reviewRouter;
