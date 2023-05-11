"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeResetPassword = exports.authorizeAdmin = exports.authorize = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const authorize = async (req, res, next) => {
    try {
        const formattedDecodedData = await authorizeFunc(req);
        if (!formattedDecodedData.userId)
            return res.sendStatus(401);
        req.body.userIdFromToken = formattedDecodedData.userId;
        req.body.userIsAdmin = formattedDecodedData.isAdmin;
        return next();
    }
    catch (error) {
        return res.sendStatus(401);
    }
};
exports.authorize = authorize;
const authorizeAdmin = async (req, res, next) => {
    try {
        const formattedDecodedData = await authorizeFunc(req);
        if (!formattedDecodedData.isAdmin || !formattedDecodedData.userId) {
            return res.sendStatus(401);
        }
        req.body.userIdFromToken = formattedDecodedData.userId;
        req.body.userIsAdmin = formattedDecodedData.isAdmin;
        return next();
    }
    catch (error) {
        return res.sendStatus(401);
    }
};
exports.authorizeAdmin = authorizeAdmin;
const authorizeResetPassword = async (req, res, next) => {
    try {
        const formattedDecodedData = await authorizeFunc(req);
        if (!formattedDecodedData.email) {
            return res.sendStatus(401);
        }
        req.body.email = formattedDecodedData.email;
        return next();
    }
    catch (error) {
        return res.sendStatus(401);
    }
};
exports.authorizeResetPassword = authorizeResetPassword;
const authorizeFunc = async (req) => {
    if (!req.headers.authorization?.startsWith('Bearer ')) {
        throw Error('Unauthorized');
    }
    const authorizationArr = req.headers.authorization.split(' ');
    if (authorizationArr.length !== 2) {
        throw Error('Unauthorized');
    }
    const token = authorizationArr[1];
    const secretKey = process.env.JWT_SECRET_KEY || '';
    const decodedData = (0, jsonwebtoken_1.verify)(token, secretKey);
    const formattedDecodedData = decodedData;
    return formattedDecodedData;
};
