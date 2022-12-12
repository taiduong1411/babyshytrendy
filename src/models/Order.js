const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderModel = new Schema({
    code_order: {
        type: String,
        required: true,
        unique: true
    },
    c_name: {
        type: String,
        required: true,
    },
    pOrder: {
        type: [Object]
    },
    total_price: {
        type: Number
    },
    code_discount: {
        type: String
    },
    status: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', OrderModel);