const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentModel = new Schema({
    username: {
        type: String,
        required: true,
    },
    comment: {
        type: [Object]
    },
    reply: {
        type: [Object]
    },
    pid: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
})
module.exports = mongoose.model('Comment', CommentModel);