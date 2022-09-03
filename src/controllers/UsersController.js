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
        const { username, email, phone, password, image, address, level } = req.body;
        Users.findOne({ email: email }).then(users => {
            if (!users) {
                var newCustomer = {
                    username: username,
                    email: email,
                    phone: phone,
                    password: password,
                    image: 'https://www.w3schools.com/howto/img_avatar2.png',
                    address: address,
                    level: 'customer'
                }
                req.flash('success', 'Đăng ký thành công')
                new Users(newCustomer).save()
                return res.redirect('/users/login')
            } else {
                req.flash('error', 'Đăng ký thất bại')
                return res.redirect('/users/register')
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
        const { username, email, phone, password, level } = req.body;
        Users.findOne({ username: username }).then(users => {
            if (!users) {
                return res.redirect('/users/register')
            } else {
                if (password == users.password) {
                    req.session.username = users.username;
                    req.session.email = users.email;
                    req.session.phone = users.phone;
                    req.session.address = users.address;
                    return res.redirect('/home')
                } else {
                    return res.render('login')
                }

            }
        })
    },
    getLogout: (req, res) => {
        req.session.destroy();
        return res.redirect('/home')
    },
    getchangePassword: (req, res) => {
        if (!req.session.username) {
            return res.redirect('/users/login')
        }
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
        if (!req.session.username) {
            return res.redirect('/users/login')
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
    getaddProduct: (req, res) => {
        let error = req.flash('error' || '');
        let success = req.flash('success' || '');
        Group.find({}).then((groups => {
            const options = groups.map(g => {
                return {
                    name: g.name,
                    gid: g.gid
                }
            })
            return res.render('products/add-product', {
                error: error,
                success: success,
                options: options
            })
        }))
    },
    postaddProduct: (req, res, next) => {
        const { pid, pro_name, description, gid, newGroup, price, image } = req.body;
        var newGid = ''
        if (newGroup && !gid) {
            Group.findOne({ name: newGroup }).then(group => {
                if (group) {
                    req.flash('error', "Ton Tai")
                    return res.redirect('/users/add-product')
                } else {
                    let temp = newGroup.split(' ');
                    let num = '001';
                    temp.forEach(t => {
                        newGid += t[0].toUpperCase();
                    })
                    newGid = newGid + num;
                    const newBrand = {
                        name: newGroup,
                        gid: newGid
                    }
                    new Group(newBrand).save()
                }
            })
        }
        Products.findOne({ pid: pid }).then((product) => {
            if (!product) {
                var newPro = {
                    pid: pid,
                    gid: (gid) ? gid : newGid,
                    pro_name: pro_name,
                    description: description,
                    price: price,
                    image: image,
                }
                req.flash('success', 'Nhập sản phẩm thành công')
                new Products(newPro).save()
                return res.redirect('/users/add-product')
            } else {
                req.flash('error', 'Sản phẩm đã tồn tại')
                return res.redirect('/users/add-product')
            }
        })
    }
}

module.exports = UsersController;