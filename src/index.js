require('dotenv').config();
const port = process.env.PORT || 4000;

const Koa = require('koa');
const Router = require('koa-router');
const mongoose = require('mongoose');
const bodyParser = require('koa-bodyparser');
const api = require('./api');
const { jwtMiddleware } = require('./lib/token');

const app = new Koa();
const router = new Router();

mongoose.Promise = global.Promise; // Node의 네이티브 Promise를 사용한다.
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
    .then(response => {
       console.log('Success connected to mongoDB');
    })
    .catch(error => {
        console.log(error);
    });

app.use(jwtMiddleware);
app.use(bodyParser()); // bodyParser는 router 코드보다 상단에 있어야 한다.
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, () => {
   console.log('Koa server is listening to port: ' + port);
});

router.get('/', (ctx, next) => {
    ctx.body = '루트 페이지 입니다.';
});

router.get('/sub', (ctx, next) => {
    ctx.body = '서브 페이지 입니다.';
});

router.use('/api', api.routes());