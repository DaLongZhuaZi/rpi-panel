"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const cors_1 = __importDefault(require("@koa/cors"));
const koa_body_1 = require("koa-body");
const koa_logger_1 = __importDefault(require("koa-logger"));
const app = new koa_1.default();
const port = process.env.PORT || 3001;
app.use((0, koa_logger_1.default)());
app.use((0, cors_1.default)());
app.use((0, koa_body_1.koaBody)());
// 基础健康检查路由
app.use(async (ctx) => {
    ctx.body = { status: 'ok', message: 'RPI Panel API Server' };
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
