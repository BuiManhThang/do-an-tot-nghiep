"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const associationRuleController_1 = __importDefault(require("../controllers/associationRuleController"));
const authorize_1 = require("../common/authorize");
const associationRuleController = new associationRuleController_1.default();
const associationRuleRouter = (0, express_1.Router)();
associationRuleRouter.get('/paging', authorize_1.authorizeAdmin, associationRuleController.getPaging);
associationRuleRouter.get('/suggestion', associationRuleController.getSuggestion);
exports.default = associationRuleRouter;
