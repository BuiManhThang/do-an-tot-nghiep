"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = exports.validatePhoneNumber = exports.validateRequire = exports.validateEmail = void 0;
const validateEmail = (inputValue) => {
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(inputValue)) {
        return false;
    }
    return true;
};
exports.validateEmail = validateEmail;
const validateRequire = (inputValue) => {
    if (!inputValue) {
        return false;
    }
    if (typeof inputValue === 'string') {
        if (inputValue.trim() === '') {
            return false;
        }
    }
    if (Array.isArray(inputValue)) {
        if (inputValue.length === 0) {
            return false;
        }
    }
    return true;
};
exports.validateRequire = validateRequire;
const validatePhoneNumber = (inputValue) => {
    if (!/[0-9]{10}/.test(inputValue)) {
        return false;
    }
    return true;
};
exports.validatePhoneNumber = validatePhoneNumber;
const validatePassword = (inputValue) => {
    if (!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,32}$/.test(inputValue)) {
        return false;
    }
    return true;
};
exports.validatePassword = validatePassword;
