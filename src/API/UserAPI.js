const Products = require('../models/Products');
const Users = require('../models/Users');


const UserAPI = {
    getOne: async(options) => {
        if (options.username) {
            return await Users.findOne({ username: options.username }).lean()
                .then(user => {
                    return {
                        email: user.email,
                        phone: user.phone,
                        address: user.address
                    }
                })
        }
        if (options.email) {
            return await Users.findOne({ email: options.email }).lean()
                .then(user => {
                    return user
                })
        }
        if (options.phone) {
            return await Users.findOne({ phone: options.phone }).lean()
                .then(user => {
                    return user
                })
        }
    },
}
module.exports = UserAPI;