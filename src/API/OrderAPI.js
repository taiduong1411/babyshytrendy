const Order = require('../models/Order');

const OrderAPI = {
    getOne: async(options) => {
        if (options.email) {
            return await Order.findOne({ email: options.email }).lean()
                .then(order => {
                    return order
                })
        }
        if (options.id) {
            return await Order.findOne({ id: options.id }).lean()
                .then(order => {
                    return order
                })
        }
    },
    getAll: async(options) => {
        let sort = options.sort || 1;
        let skip = options.skip || 0;
        let limit = options.limit || 0;
        return await Order.find({})
            .sort({ createdAt: sort })
            .limit(limit)
            .skip(skip)
            .lean()
            .then(orders => {
                return orders.map(orders => {
                    return {
                        id: (orders._id).toString(),
                        code_order: orders.code_order,
                        pOrder: orders.pOrder,
                        c_name: orders.c_name,
                        total_price: (orders.total_price).toLocaleString('it-IT', { style: "currency", currency: "VND" }),
                        code_discount: orders.code_discount,
                        status: (orders.status) ? `<span class="btn btn-secondary btn-status confirmed" style="width: 130px; opacity: 0.2;">Đã Xác Nhận</span>` : `<span class="btn btn-secondary btn-status notConfirm" style="width: fit-content;">Chờ Xác Nhận</span>`
                            // status: orders.status
                    }
                })
            })
    },
}
module.exports = OrderAPI;