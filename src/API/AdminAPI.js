const Products = require('../models/Products');

const AdminAPI = {
    getOne: async(options) => {
        if (options.pid) {
            return await Products.findOne({ pid: pid }).lean()
                .then(product => {
                    return product
                })
        }
        if (options.id) {
            return await Products.findOne({ _id: _id }).lean()
                .then(product => {
                    return product
                })
        }
    },
    getAll: async(options) => {
        let sort = options.sort || 1;
        let skip = options.skip || 0;
        let limit = options.limit || 0;
        return await Products.find({})
            .sort({ createdAt: sort })
            .limit(limit)
            .skip(skip)
            .lean()
            .then(products => {
                return products
            })
    },
    // create,
    delete: async(idUrl) => {
        return await Products.findByIdAndDelete(idUrl);
    },
    // update,
}
module.exports = AdminAPI;