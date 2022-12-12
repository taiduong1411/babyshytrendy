const express = require('express');
const Users = require('../models/Users');
const Products = require('../models/Products');
const Order = require('../models/Order');
const OrderAPI = require('../API/OrderAPI');
const UserAPI = require('../API/UserAPI');
const ProductAPI = require('../API/ProductAPI');
const AdminAPI = require('../API/AdminAPI');
const Discount = require('../models/Discount');

const UsersController = {
    getRegister: (req, res, next) => {
        let error = req.flash('error' || '')
        if (error) {
            return res.render('accounts/register', {
                error: error
            })
        }
    },
    postRegister: (req, res, next) => {
        const { username, email, phone, password, address } = req.body;
        Users.findOne({ email: email }).then(user => {
            if (user) {
                req.flash('error', 'Đăng ký thất bại')
                let error = 'Email đã được sử dụng';
                // return res.redirect('/users/register')
                return res.send(`<div class="w-90 mt-5 alert alert-danger text-center">${error}</div>`)
            } else {

                if (password.length < 6) {
                    let error = 'Mật khẩu phải có ít nhất 6 kí tự';
                    return res.send(`<div class="w-90 mt-5 alert alert-danger text-center">${error}</div>`)
                }
                var newCustomer = {
                    username: username,
                    email: email,
                    phone: phone,
                    password: password,
                    image: '/avatar/default/default.jpeg',
                    address: address,
                    level: 'customer',
                }
                req.flash('success', 'Đăng ký thành công')
                new Users(newCustomer).save()
                let success = 'Đăng ký thành công';
                // return res.redirect('/users/login')
                return res.send(`<div class="w-90 mt-5 alert alert-success text-center">${success}</div>`)
            }
        }).catch(next)
    },
    getLogin: (req, res) => {
        let error = req.flash('error' || '')
        let success = req.flash('success' || '')
        if (error) {
            return res.render('accounts/login', {
                error: error,
                success: success
            })
        }
    },
    postLogin: (req, res, next) => {
        const { username, password } = req.body;
        Users.findOne({ username: username }).then(async user => {
            if (!user) {
                return res.redirect('/users/register')
            } else {
                if (password == user.password) {
                    if (user.isLogin == true && user.level == 'admin') {
                        req.flash('error', 'Admin da dang nhap')
                        return res.redirect('/users/login')
                    } else {
                        req.session.username = user.username;
                        req.session.email = user.email;
                        req.session.image = user.image;
                        req.session.level = user.level;
                        user.isLogin = true;
                        await user.save();
                        return res.redirect('/home')
                    }
                } else {
                    return res.redirect('/users/login')
                }
            }
        })
    },
    getLogout: async(req, res) => {
        await Users.findOne({ username: req.session.username }).then(async user => {
            if (!user) {
                return res.redirect('/users/login')
            } else {
                user.isLogin = false;
                await user.save();
                req.session.destroy();
                return res.redirect('/home')
            }
        })
    },
    getchangePassword: async(req, res) => {
        return res.render('accounts/change-password', {
            username: true,
            username: req.session.username
        })
    },
    postchangePassword: (req, res, next) => {
        const { password } = req.body;

        Users.findOne({ username: req.session.username }).then((users) => {
            if (!users) {
                return res.redirect('/users/login')
            } else {
                users.password = password
                users.save()
                req.session.destroy()
                return res.redirect('/users/login')
            }
        })
    },
    getchangeInformation: async(req, res) => {
        let user = await Users.findOne({ username: req.session.username })
        const data = {
            email: user.email,
            phone: user.phone,
            address: user.address
        }
        return res.render('accounts/change-information', {
            username: true,
            username: req.session.username,
            data: data
        })
    },
    postchangeInformation: (req, res, next) => {
        const { email, phone, address } = req.body;
        Users.findOne({ username: req.session.username }).then((users) => {
            if (!users) {
                return res.redirect('/users/login')
            } else {
                users.email = email
                users.phone = phone
                users.address = address
                users.save()
                return res.redirect('/home')
            }
        })
    },
    getSearch: (req, res) => {
        Products.find({})
            .then((products) => {
                if (!products) {
                    return res.render('home', {
                        username: true,
                        username: req.session.username,
                        posts: []
                    })
                }
                var posts = products.map(products => {
                    return {
                        pid: products.pid,
                        pro_name: products.pro_name,
                        description: products.description,
                        price: (products.price).toLocaleString('it-IT', { style: 'currency', currency: 'VND' }),
                        image: products.image[0],
                        slug: products.slug,
                        gid: products.gid
                    }
                });
                // console.log(posts[2])
                var pro_name = req.query.pro_name;
                if (pro_name == '') {
                    return res.redirect('/home')
                }
                var data = posts.filter(function(products) {
                    return (products.pro_name)
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                        .toLowerCase().trim()
                        .indexOf(pro_name.toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/đ/g, 'd').replace(/Đ/g, 'D')) !== -1
                });
                if (data == '') {
                    Products.find({})
                        .limit(8)
                        .sort({ createdAt: -1 })
                        .then((products => {
                            if (!products) {
                                return res.render('products/search', {
                                    username: true,
                                    username: req.session.username,
                                    posts_nodata: []
                                })
                            }
                            let posts_nodata = products.map(products => {
                                return {
                                    pid: products.pid,
                                    pro_name: products.pro_name,
                                    description: products.description,
                                    price: (products.price).toLocaleString('it-IT', { style: 'currency', currency: 'VND' }),
                                    image: products.image[0],
                                    slug: products.slug,
                                    gid: products.gid
                                }
                            });
                            return res.render('products/search', {
                                error_data: true,
                                data: posts_nodata,
                                header: true,
                                username: (req.session.username) ? req.session.username : "Customer"
                            })
                        }))
                } else {
                    res.render('products/search', {
                        dataSearch: data,
                        header: true,
                        username: (req.session.username) ? req.session.username : "Customer"
                    })
                }
                // console.log(data)

            })
    },
    getCart: async(req, res, next) => {
        let user = await UserAPI.getOne({ username: req.session.username });
        let amountCart = user.cart.length
        let a = amountCart.toString()
        var user_cart = user.cart
            // var updateCart = []
        for (var i = 0; i < user.cart.length; i++) {
            var product = await Products.findOne({ pid: user.cart[i].pid })
            if (!product) {
                var result = user_cart.splice(i - 1, 1)
                    // updateCart.push(result)
                await Users.findByIdAndUpdate(user.id, { cart: result })
            } else {
                break;
            }
        }
        return res.render('users/cart', {
            cartList: user.cart,
            discount: true,
            btn_confirm_buy: true,
            header: true,
            amountCart: a
        })
    },
    postOrder: async(req, res, next) => {
        const { code, total_price_d_none } = req.body;
        let user = await Users.findOne({ username: req.session.username })
        let user_cart = user.cart;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        function generateString(length) {
            var result = '';
            const charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }

            return result;
        }
        // ----------------discount -----------------
        let discount = await Discount.findOne({ code: code })
        if (discount && discount.amount > 0) {
            var code_discount = {
                code_discount: discount.code
            }
            await Discount.findByIdAndUpdate((discount._id).toString(), { amount: discount.amount - 1 })
        } else {
            var code_discount = {
                code_discount: ''
            }
        }
        // -------------code Order ----------------
        let code_order_random = generateString(9).toUpperCase();
        let order = await Order.findOne({ code_order: code_order_random })
        if (order) {
            var newCode_oder = generateString(9).toUpperCase()
            var newOrder = {
                code_order: newCode_oder,
                c_name: user.username,
                pOrder: user_cart,
                total_price: total_price_d_none,
            }
            var newOrder_update = Object.assign(newOrder, code_discount)
            await Order(newOrder_update).save();
        } else {
            var newOrder = {
                code_order: code_order_random,
                c_name: user.username,
                pOrder: user.cart,
                total_price: total_price_d_none,
            };
            var Order_update = Object.assign(newOrder, code_discount)
            await Order(Order_update).save();
            // --------------------------code Order-------------------
        }
        var cart_update = [];
        let _id = {
            _id: (user._id).toString()
        }
        await Users.findByIdAndUpdate(_id, { cart: cart_update });
        return res.redirect('/users/cart')
    },
    getCartHistory: async(req, res, next) => {
        let orders = await OrderAPI.getAll({ sort: -1 })
        let order_find = orders.filter(orders => orders.c_name == req.session.username)
            // console.log(cart_find)
        return res.render('users/cart-history', {
            header: true,
            login_icon: (req.session.username) ? false : true,
            cartList_show: order_find
        });

    },
    getdeleteCart: async(req, res, next) => {
        const pidUrl = req.params.pid
        let user = await UserAPI.getOne({ username: req.session.username })
        var product = await ProductAPI.getOne({ pid: pidUrl })
        var amount_product = product.amount
        var user_cart = user.cart
        for (var i = 0; i < user_cart.length; i++) {
            if (pidUrl == user_cart[i].pid) {
                var result = user_cart.splice(i, 1)
            }
        }
        var amount_buy = result[0].amount
        var amount_update = amount_product + amount_buy
        await Users.findByIdAndUpdate(user.id, { cart: user_cart })
        await Products.findByIdAndUpdate(product.id, { amount: amount_update })
        return res.redirect('/users/cart')

    }
}

module.exports = UsersController;