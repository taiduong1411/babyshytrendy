const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const ProductsModel = new Schema({
    pid: {
        type: String,
        require: true
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
        type: Number
    },
    image: {
        type: [String]
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