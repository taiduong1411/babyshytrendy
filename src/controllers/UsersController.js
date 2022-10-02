const express = require('express');
const Users = require('../models/Users');
const Products = require('../models/Products');
const Group = require('../models/Group');

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
                    image: 'https://www.w3schools.com/howto/img_avatar2.png',
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
                    req.session.username = user.username;
                    req.session.image = user.image;
                    req.session.level = user.level;
                    user.isLogin = true;
                    await user.save();
                    return res.redirect('/home')
                } else {
                    return res.render('login')
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
    getchangePassword: (req, res) => {
        return res.render('account/change-password', {
            username: true,
            username: req.session.username
        })
    },
    postchangePassword: (req, res, next) => {
        const { username, password } = req.body;
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
    getchangeInformation: (req, res) => {
        const data = {
            email: req.session.email,
            phone: req.session.phone,
            address: req.session.address
        }
        return res.render('accounts/change-information', {
            username: true,
            username: req.session.username,
            data: data
        })
    },
    postchangeInformation: (req, res, next) => {
        const { username, email, phone, address } = req.body;
        Users.findOne({ username: req.session.username }).then((users) => {
            if (!users) {
                return res.redirect('/users/login')
            } else {
                users.email = email
                users.phone = phone
                users.address = address
                users.save()
                req.session.email = email
                req.session.phone = phone
                req.session.address = address
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
                        image: products.image,
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
                                    image: products.image,
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
    }
}

module.exports = UsersController;