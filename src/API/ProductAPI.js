const Products = require('../models/Products');

const ProductAPI = {
    getOne: async(options) => {
        if (options.pid) {
            return await Products.findOne({ pid: options.pid }).lean()
                .then(product => {
                    return {
                        id: (product._id).toString(),
                        pid: product.pid,
                        pro_name: product.pro_name,
                        price: (product.price).toLocaleString('it-IT', { style: "currency", currency: "VND" }),
                        amount: product.amount,
                        image: product.image[0],
                        slug: product.slug
                    }
                })
        }
        if (options.id) {
            return await Products.findOne({ id: options.id }).lean()
                .then(product => {
                    return product
                })
        }
        if (options.slug) {
            return await Products.findOne({ slug: options.slug }).lean()
                .then(product => {
                    return {
                        id: (product._id).toString(),
                        pid: product.pid,
                        pro_name: product.pro_name,
                        price: (product.price).toLocaleString('it-IT', { style: "currency", currency: "VND" }),
                        amount: product.amount,
                        image: product.image[0],
                        slug: product.slug
                    }
                })
        }
    }
}
module.exports = ProductAPI;