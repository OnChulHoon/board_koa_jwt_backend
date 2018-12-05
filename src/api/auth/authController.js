const Joi = require('joi');
const Account = require('../../models/account');


// Sign Up
exports.localRegister = async (ctx) => {

    // // 데이터 검증
    // const schema = Joi.object().keys({
    //     userId: Joi.string().alphanum().min(4).max(15).required(),
    //     email: Joi.string().email().required(),
    //     password: Joi.string().required().min(6)
    // });
    //
    // const result = Joi.validate(ctx.request.body, schema);
    //
    //
    // // 스키마 검증 실패
    // if(result.error){
    //     ctx.status = 400;
    //     return;
    // }

    // 아이디/이메일 존재 유무 검증
    let existing = null;
    try{
        existing = await Account.findByEmailOrUserId(ctx.request.body);
    } catch(e) {
        ctx.throw(500, e);
    }

    if(existing) {
        ctx.status = 409;
        ctx.body = {
            key: existing.email === ctx.request.body.email ? 'email' : 'userId'
        };
        return;
    }

    // 계정 생성
    let account = null;
    try {
        account = await Account.localRegister(ctx.request.body);
    } catch(e) {
        ctx.throw(500, e);
    }

    let token = null;
    try{
        token = await account.generateToken();
    } catch(e) {
        ctx.throw(500, e);
    }

    ctx.cookies.set('access_token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
    ctx.body = account.profile;

};

// Sign In
exports.localLogin = async (ctx) => {

    // // 데이터 검증
    // const schema = Joi.object().key({
    //     userId: Joi.string().alphanum().required(),
    //     password: Joi.string().required(),
    //     email: Joi.string().email().required()
    // });
    //
    // const result = Joi.validate(ctx.request.body, schema);
    //
    // // 스키마 검증 실패
    // if(result.error){
    //     ctx.status = 400;
    //     return;
    // }

    const { userId, password } = ctx.request.body;

    let account = null;
    try{
        // 아이디로 계정 찾기
        account = await Account.findByUserId(userId);
    } catch (e) {
        ctx.throw(500, e);
    }

    // let account = null;
    // try{
    //     // 이메일로 계정 찾기
    //     account = await Account.findByEmail(email);
    // } catch (e) {
    //     ctx.throw(500, e);
    // }

    if(!account) {
        ctx.status = 500;
        return;
    }

    if(!account.validatePassword(password)) {
        ctx.status = 403;
        return;
    }

    let token = null;
    try {
        token = await account.generateToken();
    } catch (e) {
      ctx.throw(500, e);
    }

    ctx.cookies.set('access_token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 });
    ctx.body = account;
    //ctx.data = token;

};

// userId/email exists confirm
exports.exists = async (ctx) => {
    ctx.body = 'exists';
    const { key, value } = ctx.params;
    let account = null;

    try {
        account = await (key === 'email' ? Account.findByEmail(value) : Account.findByUserId(value));
    } catch (e) {
        ctx.throw(500, e);
    }

    ctx.body = {
        exists: account !== null
    };
};

// logout
exports.logout = async (ctx) => {
    ctx.body = 'logout';
    ctx.cookies.set('access_token', null, {
        maxAge: 0,
        httpOnly: true
    });
    ctx.status = 204;
};

exports.check = (ctx) => {
    const { user } = ctx.request;

    if(!user) {
        ctx.status = 403;
        return;
    }
    ctx.body = user.profile;
};