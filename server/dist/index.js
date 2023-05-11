"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const userRouter_1 = __importDefault(require("./routers/userRouter"));
const productRouter_1 = __importDefault(require("./routers/productRouter"));
const categoryRouter_1 = __importDefault(require("./routers/categoryRouter"));
const orderRouter_1 = __importDefault(require("./routers/orderRouter"));
const reviewRouter_1 = __importDefault(require("./routers/reviewRouter"));
const viewHistoryRouter_1 = __importDefault(require("./routers/viewHistoryRouter"));
const associationRuleRouter_1 = __importDefault(require("./routers/associationRuleRouter"));
const reportRouter_1 = __importDefault(require("./routers/reportRouter"));
const inventoryReceiptRouter_1 = __importDefault(require("./routers/inventoryReceiptRouter"));
dotenv_1.default.config();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL;
const app = (0, express_1.default)();
console.log(CLIENT_URL);
// Middlewares
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)({
    origin: CLIENT_URL,
}));
app.use(express_1.default.urlencoded());
app.use(express_1.default.json());
// Routers
app.use('/api/v1/users', userRouter_1.default);
app.use('/api/v1/products', productRouter_1.default);
app.use('/api/v1/categories', categoryRouter_1.default);
app.use('/api/v1/orders', orderRouter_1.default);
app.use('/api/v1/inventoryReceipts', inventoryReceiptRouter_1.default);
app.use('/api/v1/reviews', reviewRouter_1.default);
app.use('/api/v1/viewHistory', viewHistoryRouter_1.default);
app.use('/api/v1/associationRules', associationRuleRouter_1.default);
app.use('/api/v1/report', reportRouter_1.default);
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
