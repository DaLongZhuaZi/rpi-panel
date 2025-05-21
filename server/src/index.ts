import Koa from 'koa';
import cors from '@koa/cors';
import { koaBody } from 'koa-body';
import logger from 'koa-logger';

const app = new Koa();
const port = process.env.PORT || 3001;

app.use(logger());
app.use(cors());
app.use(koaBody());

// 基础健康检查路由
app.use(async (ctx) => {
  ctx.body = { status: 'ok', message: 'RPI Panel API Server' };
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}); 