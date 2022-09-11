const express = require('express');
const Users = require('../models/Users');
const Products = require('../models/Products');
const Group = require('../models/Group');
const AdminAPI = require('../API/AdminAPI');
const AdminController = {
    getAdmin: (req, res) => {
        // if (req.session.level != 'admin') {
        //     return res.redirect('/home')
        // }
        return res.render('admin/admin_home', {
            username: req.session.username,
            // totalProduct: total
        });
    },
    getlistProduct: async(req, res) => {
        const { _id } = req.body;
        if (req.session.level != 'admin') {
            return res.redirect('/users/login')
        }
        let products = await AdminAPI.getAll({ sort: -1 })
        if (!products) {
            return res.render('admin/list-product', {
                username: req.session.username,
                data: [],

            })
        }
        let error = req.flash('error') || ""
        let success = req.flash('success') || ""
        let data = products.map(products => {
            return {
                pid: products.pid,
                pro_name: products.pro_name,
                price: (products.price).toLocaleString('it-IT', { style: 'currency', currency: 'VND' }),
                image: products.image,
                slug: products.slug,
                amount: products.amount,
                id: products._id.toString()
            }
        });
        var price = products.map(function(products) {
            return products.price;
        });

        var amount = products.map(function(products) {
            return products.amount
        });

        var total = price.reduce(function(r, a, i) { return r + a * amount[i] }, 0);
        return res.render('admin/list-product', {
            listProduct: data,
            username: req.session.username,
            totalPrice: total.toLocaleString('it-IT', { style: "currency", currency: "VND" }),
            error: error,
            success: success
        })

    },
    getdeleteProduct: async(req, res) => {
        const idUrl = req.params.id;
        // console.log(idUrl);
        await AdminAPI.delete(idUrl)
            .then(products => {
                if (!products) {
                    req.flash('error', 'That Bai')
                    return res.redirect('/admin/list-product')
                } else {
                    req.flash('success', 'Thanh Cong')
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
        return res.render('admin/dashboard')
    }
}

module.exports = AdminController;