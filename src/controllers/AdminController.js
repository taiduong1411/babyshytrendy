const express = require('express');
const Users = require('../models/Users');
const Products = require('../models/Products');
const Group = require('../models/Group');
const Discount = require('../models/Discount');
const UserAPI = require('../API/UserAPI');
const AdminAPI = require('../API/AdminAPI');
const CartAPI = require('../API/CartAPI');
const fs = require('fs-extra');
const AdminController = {
    getAdmin: (req, res) => {
        return res.render('admin/admin_home', {
            username: req.session.username,
        });
    },
    getlistProduct: async(req, res) => {
        let error = req.flash('error') || ""
        let success = req.flash('success') || ""
        const { _id } = req.body;
        let products = await AdminAPI.getAll({ sort: -1 })
        if (!products) {
            return res.render('admin/list-product', {
                username: req.session.username,
                data: [],
            })
        }
        let result_1 = await AdminAPI.getTotal();
        var total = result_1.reduce(function(r, a, i) { return r + a.price * a.amount }, 0);
        return res.render('admin/list-product', {
            listProduct: products,
            username: req.session.username,
            totalPrice: total.toLocaleString('it-IT', { style: "currency", currency: "VND" }),
            error: error,
            success: success
        })
    },
    getdeleteProduct: async(req, res) => {
        const idUrl = req.params.id;
        await AdminAPI.delete(idUrl)
            .then(products => {
                if (!products) {
                    req.flash('error', 'Không thể xoá sản phẩm')
                    return res.redirect('/admin/list-product')
                } else {
                    req.flash('success', 'Xoá sản phẩm thành công')
                    return res.redirect('/admin/list-product')
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
            return res.render('admin/add-product', {
                error: error,
                success: success,
                options: options,
            })
        }))
    },
    getAdminSearch: async(req, res, next) => {
        let products = await AdminAPI.getAll({ sort: 1 })
        if (!products) {
            return res.render('admin/list-product', {
                username: true,
                username: req.session.username,
                posts: []
            })
        }
        var pro_name = req.query.pro_name;
        var user = req.query.user;
        let query = { '$or': [{ pid: { $regex: `${pro_name}`, "$options": "i" } }, { pro_name: { $regex: `${pro_name}`, "$options": "i" } }] }

        if (pro_name == '') {
            return res.redirect('/admin/list-product')
        }
        var data_name = await AdminAPI.getSearchByName(query);

        var result_1 = await AdminAPI.getTotal();
        var total = result_1.reduce(function(r, a, i) { return r + a.price * a.amount }, 0);
        if (data_name == '') {
            req.flash('error', 'Khong tim thay san pham')
            return res.redirect('/admin/list-product')
        } else {
            res.render('admin/list-product', {
                listProduct: data_name,
                totalPrice: total.toLocaleString('it-IT', { style: "currency", currency: "VND" })
            })
        }
    },
    postaddProduct: async(req, res, next) => {
        const { pid, pro_name, description, gid, newGroup, price, image, amount } = req.body;
        const files = req.files;
        if (files.length == 0) {
            req.flash('error', 'Vui lòng nhập hình');
            return res.redirect('/users/add-product');
        }
        if (!pid || !pro_name || !description || !price) {
            req.flash('error', "Vui Long Nhap Day Du Thong Tin")
            return res.redirect('/admin/add-product')
        }
        let imgList = [];
        files.forEach(file => {
            let path = `/uploads/${pid}/${file.filename}`;
            imgList.push(path);
            // ['/uploads/AD0001/product-image_328329432.png', ...]
        })
        var newGid = ''
        if (newGroup && !gid) {
            await Group.findOne({ name: newGroup }).then(group => {
                if (group) {
                    req.flash('error', "Ton Tai")
                    let error = 'Danh mục đã tồn tại';
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
        let product = await AdminAPI.getOne(pid);
        let numPrice = "000";
        if (!product) {
            var newPro = {
                pid: pid,
                gid: (gid) ? gid : newGid,
                pro_name: pro_name,
                description: description,
                amount: amount,
                price: (price + numPrice),
                image: imgList,
            }
            req.flash('success', 'Nhập sản phẩm thành công')
            await AdminAPI.Create(newPro)
            return res.redirect('/admin/add-product')
        } else {
            req.flash('error', 'Sản phẩm đã tồn tại')
            let error = 'Sản phẩm đã tồn tại';
            return res.redirect('/admin/add-product')
        }

    },
    getDashboard: (req, res) => {
        return res.render('admin/admin_home')
    },
    getUserList: async(req, res) => {
        let error = req.flash('error') || ""
        let success = req.flash('success') || ""
        const { _id } = req.body;
        let users = await (await AdminAPI.getUser({ sort: -1 }));
        //lay phan tu tu 1->length
        let users_shift = users.shift();
        return res.render('admin/list-users', {
            listUsers: users,
            username: req.session.username,
            error: error,
            success: success
        })
    },
    getAdminHome: (req, res) => {
        return res.redirect('/admin/admin_home');
    },
    getDiscount: (req, res) => {
        return res.render('admin/add-discount', {
            username: req.session.username
        });
    },
    postDiscount: async(req, res, next) => {
        const { code, amount, value } = req.body;
        await Discount.findOne({ code: code }).then(discount => {
            if (!discount) {
                var newDiscount = {
                    code: code,
                    amount: amount,
                    value: value
                }
                Discount(newDiscount).save();
                return res.redirect('/admin/admin_home')
            } else {
                return res.redirect('/admin/add-discount')
            }
        })
    },
    getlistCart: async(req, res, next) => {
        let carts = await CartAPI.getAll({ sort: -1 });
        // let carts_data = await carts.filter(carts_data => carts_data.email == req.session.email);
        return res.render('admin/list-cart', {
            username: req.session.username,
            cartList: carts
        });

    }
}

module.exports = AdminController;