const express = require('express');
const Users = require('../models/Users');
const Products = require('../models/Products');
const Group = require('../models/Group');
const AdminAPI = require('../API/AdminAPI');
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
                username: req.session.username
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

        if (!pid || !pro_name || !description || !price) {
            req.flash('error', "Vui Long Nhap Day Du Thong Tin")
            return res.redirect('/admin/add-product')
        }
        const file = req.file;
        let imagePath = '/uploads/' + file.filename;
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
        await AdminAPI.getOne(pid)
            .then((product) => {
                let numPrice = "000"
                if (!product) {
                    var newPro = {
                        pid: pid,
                        gid: (gid) ? gid : newGid,
                        pro_name: pro_name,
                        description: description,
                        amount: amount,
                        price: (price + numPrice),
                        image: imagePath,
                    }
                    req.flash('success', 'Nhập sản phẩm thành công')
                    new Products(newPro).save()
                    return res.redirect('/admin/add-product')
                } else {
                    req.flash('error', 'Sản phẩm đã tồn tại')
                    let error = 'Sản phẩm đã tồn tại';
                    return res.redirect('/admin/add-product')
                }
            })
    },
    getDashboard: (req, res) => {
        return res.render('admin/admin_home')
    },
    getUserList: async(req, res) => {
        let error = req.flash('error') || ""
        let success = req.flash('success') || ""
        const { _id } = req.body;
        let users = await AdminAPI.getUser({ sort: -1 })
            // console.log(users)
        return res.render('admin/list-users', {
            listUsers: users,
            username: req.session.username,
            error: error,
            success: success
        })
    }
}

module.exports = AdminController;