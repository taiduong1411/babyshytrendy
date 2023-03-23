const Products = require('../models/Products');
const Users = require('../models/Users');
const AdminAPI = {
    getOne: async(options) => {
        if (options.pid) {
            return await Products.findOne({ pid: options.pid }).lean()
                .then(product => {
                    return product
                })
        }
        if (options.id) {
            return await Products.findOne({ _id: options._id }).lean()
                .then(product => {
                    return product
                })
        }
        if (options.slug) {
            return await Products.findOne({ slug: options.slug }).lean()
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
                        id: (products._id).toString(),
                        pid: products.pid,
                        pro_name: products.pro_name,
                        description: products.description,
                        price: (products.price).toLocaleString('it-IT', { style: "currency", currency: "VND" }),
                        amount: products.amount,
                        image: products.image[0],
                        gid: products.gid,
                        agency: products.agency,
                        slug: products.slug,
                        createdAt: (products.createdAt).toLocaleString('en-GB'),
                        updatedAt: (products.updatedAt).toLocaleString('en-GB')

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
        // return await Products.find({}).then(products => {
        //         return products.filter(function(products) {
        //             return (products.pro_name)
        //                 .normalize('NFD')
        //                 .replace(/[\u0300-\u036f]/g, '')
        //                 .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        //                 .toLowerCase().trim()
        //                 .indexOf(pro_name.toLowerCase()
        //                     .normalize('NFD')
        //                     .replace(/[\u0300-\u036f]/g, '')
        //                     .replace(/đ/g, 'd').replace(/Đ/g, 'D')) !== -1
        //         })
        //     })
        return await Products.find(query).lean()

    },
    Create: async(data) => {
        return await new Products(data).save();
    },
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
    getFindbyDate: async(date) => {
            let products = await Products.find({
                createdAt: {
                    $gte: new Date(new Date(date).setHours(00, 00, 00)),
                    $lt: new Date(new Date(date).setHours(23, 59, 59))
                }
            })
            return products
        }
        // update,
}
module.exports = AdminAPI;