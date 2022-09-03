const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupModel = new Schema({
    name: {
        type: String,
        required: true
    },
    gid: {
        type: String
    }
})

module.exports = mongoose.model('Group', GroupModel);