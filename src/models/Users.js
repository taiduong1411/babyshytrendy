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
    }
});



module.exports = mongoose.model('Users', UsersModel);