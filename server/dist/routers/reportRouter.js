"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authorize_1 = require("../common/authorize");
const reportController_1 = __importDefault(require("../controllers/reportController"));
const reportController = new reportController_1.default();
const reportRouter = (0, express_1.Router)();
reportRouter.get('/statistical-revenue', authorize_1.authorizeAdmin, reportController.getStatisticalRevenue);
reportRouter.get('/total', authorize_1.authorizeAdmin, reportController.getTotal);
reportRouter.get('/statistical-revenue-products', authorize_1.authorizeAdmin, reportController.getStaticalRevenueOfProducts);
exports.default = reportRouter;
