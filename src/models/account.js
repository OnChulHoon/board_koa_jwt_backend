const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const { generateToken } = require('../lib/token');

const Account = new Schema({
    profile: {
        username: String,
        email: String,
        nickname: String,
        phoneNumber: String,
    },
    userId: String,
    password: String,
    admin: { type: Boolean, default: false },
    registerDate: {
        type: Date,
        default: new Date(),
    }
});

function hash(password) {
    return crypto.createHmac('sha256', process.env.SECRET_KET).update(password).digest('hex');
}

Account.statics.findByUserId = function (userId) {
    return this.findOne({ userId }).exec();
};

Account.statics.findByEmail = function (email) {
    return this.findOne({ 'profile.email': email }).exec();
};

Account.statics.findByEmailOrUserId = function ({ userId, email }) {
    return this.findOne({
        // $or 연산자는 두가지 조건 중 하나를 만족하는 데이터를 찾는다.
        $or: [
            { userId },
            {
                'profile.email': email
            }
        ]
    }).exec();
};

Account.statics.localRegister = function ({ userId, password, username, email, nickname, phoneNumber }) {
    const account = new this({
        profile: {
            username,
            email,
            nickname,
            phoneNumber
        },
        userId,
        password: hash(password)
    });
    return account.save();
};

// 함수로 전달받은 비밀번호의 해시값과 데이터에 담긴 해시값을 비교한다.
Account.methods.validatePassword = function (password) {
    const hashed = hash(password);
    return this.password === hashed;
};

Account.methods.generateToken = function () {
    const payload = {
        _id: this._id,
        profile: this.profile
    };
    return generateToken(payload, 'account');
};

module.exports = mongoose.model('Account', Account);