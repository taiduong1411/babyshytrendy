const Cart = require('../models/Cart');

const CartAPI = {
    getOne: async(options) => {
        if (options.phone) {
            return await Cart.findOne({ phone: options.phone }).lean()
                .then(cart => {
                    return cart
                })
        }
        if (options.email) {
            return await Cart.findOne({ email: options.email }).lean()
                .then(cart => {
                    return cart
                })
        }
        if (options.pro_name) {
            return await Cart.findOne({ pro_name: options.pro_name }).lean()
                .then(cart => {
                    return cart
                })
        }
    },
    getAll: async(options) => {
        let sort = options.sort || 1;
        let skip = options.skip || 0;
        let limit = options.limit || 0;
        return await Cart.find({})
            .sort({ createdAt: sort })
            .limit(limit)
            .skip(skip)
            .lean()
            .then(carts => {
                return carts.map(carts => {
                    return {
                        pid: carts.pid,
                        pro_name: carts.pro_name,
                        image: carts.image,
                        price: (carts.price).toLocaleString('it-IT', { style: "currency", currency: "VND" }),
                        amount: carts.amount,
                        email: carts.email,
                        slug: carts.slug,
                        status: (carts.status) ? `<span class="btn btn-success" style="width: 150px">Đã Xác Nhận</span>` : `<span class="btn btn-danger" style="width: 150px">Chờ Xác Nhận</span>`
                    }
                })
            })
    },
}
module.exports = CartAPI;