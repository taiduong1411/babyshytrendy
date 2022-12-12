const mongoose = require('mongoose');
async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/BabyShyTrendy', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('connect db success')
    } catch (error) {
        console.log('connect db error')
    }
};
module.exports = { connect };


// connect mongo Atlat: mongodb+srv://admin:taiduong1411@babyshytrendy.vtake6m.mongodb.net/babyshytrendy