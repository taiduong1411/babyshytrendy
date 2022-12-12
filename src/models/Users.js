const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersModel = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    address: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    },
    isLogin: {
        type: Boolean,
        default: false
    },
    cart: {
        type: [{
            pid: String,
            image: String,
            amount: Number,
            pro_name: String,
            total: Number,
            slug: String
        }]
    },
    cart_history: {
        type: [String]
    }
});



module.exports = mongoose.model('Users', UsersModel);