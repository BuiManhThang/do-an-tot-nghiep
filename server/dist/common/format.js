"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberWithCommas = void 0;
const numberWithCommas = (number) => {
    if (!number) {
        return '';
    }
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
exports.numberWithCommas = numberWithCommas;
