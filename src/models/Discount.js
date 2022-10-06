const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiscountModel = new Schema({
    code: {
        type: String,
        unique: true
    },
    amount: {
        type: String
    },
    value: {
        type: String
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Discount', DiscountModel);