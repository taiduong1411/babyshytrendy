const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartModel = new Schema({
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    pid: {
        type: String
    },
    pro_name: {
        type: String
    },
    price: {
        type: String
    },
    amount: {
        type: String
    },
    image: {
        type: String
    },
    slug: {
        type: String
    },
    status: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', CartModel);