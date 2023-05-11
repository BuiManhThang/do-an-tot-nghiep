"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
class BaseController {
    constructor() {
        this.serverError = (res, error, msg = 'Server Error') => {
            console.log(error);
            return res.status(500).json({
                msg,
                error,
            });
        };
        this.clientError = (res, error, msg = 'Client Error') => {
            return res.status(400).json({
                msg,
                error,
            });
        };
        this.notFound = (res) => {
            return res.sendStatus(404);
        };
        this.notContent = (res) => {
            return res.sendStatus(204);
        };
        this.success = (res, data) => {
            return res.status(200).json(data);
        };
        this.created = (res, data) => {
            return res.status(201).json(data);
        };
        this.updated = (res, data) => {
            return res.status(200).json(data);
        };
        this.deleted = (res, data) => {
            return res.status(200).json(data);
        };
        this.unauthorized = (res) => {
            return res.sendStatus(401);
        };
    }
}
exports.BaseController = BaseController;
