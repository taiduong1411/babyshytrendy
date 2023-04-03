const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiscountModel = new Schema({
    code: {
        type: String,
        unique: true
    },
    amount: {
        type: Number
    },
    value: {
        type: Number
    },
    customer: {
        type: String
    },
    email_status: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Discount', DiscountModel);