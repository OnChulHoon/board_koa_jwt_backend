const Router = require('koa-router');
const auth = new Router();
const authController = require('./authController');

auth.post('/register/local', authController.localRegister);
auth.post('/login/local', authController.localLogin);
auth.get('/exists/:key(email|userId)/:value', authController.exists);
auth.post('/logout', authController.logout);
auth.get('/check', authController.check);

module.exports = auth;