const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const ProductsModel = new Schema({
    pid: {
        type: String,
        required: true
    },
    pro_name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    image: {
        type: [String],
        required: true
    },
    slug: {
        type: String,
        slug: 'pro_name'
    },
    gid: {
        type: String,
    }
}, {
    timestamps: true
});



module.exports = mongoose.model('Products', ProductsModel);