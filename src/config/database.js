const mongoose = require('mongoose');
const uri_atlas = "mongodb+srv://taiduong:taiduong1411@taiduong.28espap.mongodb.net/babyshytrendy?retryWrites=true&w=majority";
const uri_compass = "mongodb://localhost:27017/Babyshytrendy"
async function connect() {
    try {
        await mongoose.set('strictQuery', true);
        await mongoose.connect(uri_compass, {
            useNewUrlParser: true
        })
        console.log('connect db success')
    } catch (error) {
        console.log('connect db error')
    }
};
module.exports = { connect };





// connect mongo Atlat: mongodb+srv://admin:taiduong1411@babyshytrendy.vtake6m.mongodb.net/babyshytrendy