"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const options = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    },
};
exports.transporter = nodemailer_1.default.createTransport(options);
const sendMail = async (to, subject, html) => {
    const mailOption = {
        from: 'Tạp hóa Hòa Phát',
        to,
        subject,
        html,
    };
    return exports.transporter.sendMail(mailOption);
};
exports.sendMail = sendMail;
