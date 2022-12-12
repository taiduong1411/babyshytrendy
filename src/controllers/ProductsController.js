const express = require('express');
// model
const Users = require('../models/Users');
const Products = require('../models/Products');
const Order = require('../models/Order');
const Discount = require('../models/Discount');
const Comment = require('../models/Comments');
// API
const ProductAPI = require('../API/ProductAPI');
const AdminAPI = require('../API/AdminAPI');
const UserAPI = require('../API/UserAPI');
const OrderAPI = require('../API/OrderAPI');
const { set } = require('mongoose');
const Comments = require('../models/Comments');


const ProductsController = {
    getproDetail: async(req, res, next) => {
        const slugUrl = req.params.slug;
        let product = await Products.findOne({ slug: slugUrl })

        // console.log(product.pid)

        if (!product) {
            return res.json({
                success: false,
                message: 'san pham khong ton tai'
            })
        }
        const data = {
            pid: product.pid,
            pro_name: product.pro_name,
            description: product.description,
            image: product.image,
            img: product.image[0],
            price: (product.price).toLocaleString('it-IT', { style: 'currency', currency: 'VND' }),
            slug: product.slug,
            amount: product.amount,
            gid: product.gid
        }
        let products = await AdminAPI.getAll({ limit: 4 })
        let comments = await Comments.find({}).lean()
        let result = comments.filter(comment => comment.pid == product.pid)
        var get_comment_update = []
        for (var i = 0; i < result.length; i++) {
            for (var j = 0; j < result[i].comment.length; j++) {
                var get_comment = {
                    comment: result[i].comment[j].comment,
                    avatar: result[i].comment[0].avatar,
                    username: result[i].username
                }
                get_comment_update.push(get_comment)
            }
        }
        return res.render('products/product-detail', {
            products_other: products,
            data: data,
            sold_out: (product.amount == '0') ? true : false,
            sold_out_2: (product.amount == '0') ? true : false,
            header: true,
            username: (req.session.username) ? req.session.username : 'Customer',
            avatar: (req.session.image) ? req.session.image : '/avatar/default/images.png',
            comment: get_comment_update,
        })



    },
    postUpdateCart: async(req, res, next) => {
        const { pid, image, amount_buy, pro_name, slug, price } = req.body;
        let username = req.session.username;
        let product = await Products.findOne({ pid: pid })
        let amount_update = product.amount - parseInt(amount_buy)
        await Products.findByIdAndUpdate(product.id, { amount: amount_update })
        let user = await Users.findOne({ username })
        if (user.cart.length < 1) {
            let newItem = {
                pid: pid,
                image: image,
                pro_name: pro_name,
                total: price,
                amount: parseInt(amount_buy),
                slug: slug
            }
            user.cart.push(newItem);
            user.save()
            return res.redirect('/users/cart')
        } else {
            for (var i = 0; i < user.cart.length; i++) {
                if (pid == user.cart[i].pid) {
                    user.cart[i].amount = parseInt(amount_buy) + user.cart[i].amount
                    user.cart[i].total = parseInt(price) + user.cart[i].total
                    Products.findByIdAndUpdate(product.id, { amount: product.amount - amount_buy })
                    user.save()
                    return res.redirect('/users/cart')
                }
            }
            var newItem_check = {
                pid: pid,
                image: image,
                pro_name: pro_name,
                total: price,
                amount: parseInt(amount_buy),
                slug: slug
            }
            user.cart.push(newItem_check);
            user.save()
            return res.redirect('/users/cart')
        }
    },
    postComment: async(req, res, next) => {
        const { comment, pid } = req.body;
        // console.log(comment, pid)
        let username = req.session.username
        let user = await Users.findOne({ username: username })
        let product = await Products.findOne({ pid: pid })
        let slug = product.slug
        let avatar_user = user.image
        let comments = await Comments.find({}).lean()
        var title_update = {
            comment: comment,
            avatar: avatar_user
        }

        if (comments.length == 0) {
            var data = {
                username: username,
                comment: [],
                pid: pid,
            }
            data.comment.push(title_update)
            await Comments(data).save()
                // return res.send({ html })
        } else {
            // var result = comments.filter(comment => comment.username == username && comment.pid == pid)
            var result = await Comments.findOne({ pid: pid, username: username })

            if (result) {
                result.comment.push(title_update)
                let id = (result._id).toString()
                await Comments.findByIdAndUpdate(id, { comment: result.comment })
                    .then(comment => {
                        // return res.send({ html })
                    })
                    // return res.redirect(`/product/${slug}`)

            } else {
                var data = {
                    username: username,
                    comment: [],
                    pid: pid,
                }
                data.comment.push(title_update)
                await Comments(data).save();
                // return res.send({ html })
                // return res.redirect(`/product/${slug}`)
            }
        }



    }
}




module.exports = ProductsController;