const express = require('express');
const OrderAPI = require('../API/OrderAPI');
const UserAPI = require('../API/UserAPI');
const Order = require('../models/Order');
const Users = require('../models/Users');

const CartController = {
    // getCart: async(req, res, next) => {
    //     let cart = await CartAPI.getOne({ email: req.session.email });
    //     console.log(cart);

    //     return res.render('users/cart', {
    //         header: true,
    //         login_icon: (req.session.username) ? false : true,
    //         cartList: user,
    //     })
    // },
}
module.exports = CartController;