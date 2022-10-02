const Products = require('../models/Products');
const Users = require('../models/Users');
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
                return products.map(products => {
                    return {
                        id: products._id,
                        pid: products.pid,
                        pro_name: products.pro_name,
                        description: products.description,
                        price: (products.price).toLocaleString('it-IT', { style: "currency", currency: "VND" }),
                        amount: products.amount,
                        image: products.image,
                        gid: products.gid,
                        slug: products.slug
                    }
                })
            })
    },
    getTotal: async() => {
        return await Products.find({})
            .then(products => {
                return products.map(products => {
                    return {
                        price: products.price,
                        amount: products.amount
                    }
                })
            })
    },
    getSearchByName: async(query) => {
        return await Products.find(query).lean()
            // .then(products => {
            //     return products.filter(function(products) {
            //         return (products.pro_name)
            //             .normalize('NFD')
            //             .replace(/[\u0300-\u036f]/g, '')
            //             .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            //             .toLowerCase().trim()
            //             .indexOf(pro_name.toLowerCase()
            //                 .normalize('NFD')
            //                 .replace(/[\u0300-\u036f]/g, '')
            //                 .replace(/đ/g, 'd').replace(/Đ/g, 'D')) !== -1
            //     })
            // })

    },
    // create,
    delete: async(idUrl) => {
        return await Products.findByIdAndDelete(idUrl).lean();
    },
    getUser: async(options) => {
        let sort = options.sort || 1;
        let skip = options.skip || 0;
        let limit = options.limit || 0;
        return await Users.find({})
            .sort({ createdAt: sort })
            .limit(limit)
            .skip(skip)
            .lean()
            .then(users => {
                return users.map(users => {
                    return {
                        username: users.username,
                        email: users.email,
                        phone: users.phone,
                        level: users.level,
                        status: users.isLogin ? `<span class="btn btn-success">Enable</span>` : `<span class="btn btn-danger">Disable</span>`
                    }
                })
            })
    },
    // update,
}
module.exports = AdminAPI;