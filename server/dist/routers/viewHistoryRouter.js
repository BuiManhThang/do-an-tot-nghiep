"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const viewHistoryController_1 = __importDefault(require("../controllers/viewHistoryController"));
const authorize_1 = require("../common/authorize");
const viewHistoryController = new viewHistoryController_1.default();
const viewHistoryRouter = (0, express_1.Router)();
viewHistoryRouter.get('/paging', authorize_1.authorize, viewHistoryController.getPaging);
viewHistoryRouter.get('/:id', authorize_1.authorizeAdmin, viewHistoryController.getById);
viewHistoryRouter.get('/', authorize_1.authorizeAdmin, viewHistoryController.getAll);
viewHistoryRouter.post('/user', authorize_1.authorize, viewHistoryController.userCreate);
viewHistoryRouter.post('/', authorize_1.authorizeAdmin, viewHistoryController.create);
viewHistoryRouter.put('/:id', authorize_1.authorizeAdmin, viewHistoryController.update);
viewHistoryRouter.delete('/:id', authorize_1.authorizeAdmin, viewHistoryController.delete);
exports.default = viewHistoryRouter;
