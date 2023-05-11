"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortDirection = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus[OrderStatus["Pending"] = 1] = "Pending";
    OrderStatus[OrderStatus["Confirmed"] = 2] = "Confirmed";
    OrderStatus[OrderStatus["Success"] = 3] = "Success";
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));
var SortDirection;
(function (SortDirection) {
    SortDirection["Desc"] = "desc";
    SortDirection["Asc"] = "asc";
})(SortDirection = exports.SortDirection || (exports.SortDirection = {}));
