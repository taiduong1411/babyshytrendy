const express = require('express');
// model
const Users = require('../models/Users');
const Products = require('../models/Products');
const Cart = require('../models/Cart');
const Discount = require('../models/Discount');
// API
const ProductAPI = require('../API/ProductAPI');
const UserAPI = require('../API/UserAPI');
const CartAPI = require('../API/CartAPI');


const ProductsController = {
    getproDetail: async(req, res, next) => {
        const slugUrl = req.params.slug;
        await Products.findOne({ slug: slugUrl }).then(product => {
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
                price: (product.price).toLocaleString('it-IT', { style: 'currency', currency: 'VND' }),
                slug: product.slug,
                amount: product.amount,
                gid: product.gid
            }
            return res.render('products/product-detail', {
                data: data,
                sold_out: (product.amount == '0') ? true : false,
                sold_out_2: (product.amount == '0') ? true : false,
                header: true,
                username: (req.session.username) ? req.session.username : 'Customer'
            })
        })
    },
    // getDiscount: async(req, res, next) => {
    //     const { code } = req.body;
    //     await Discount.findOne({ code: code }).then(discount => {
    //         if (!discount) {
    //             req.flash('error', 'Ma Khuyen Mai khong trung khop')
    //         } else {
    //             const value = {
    //                     amount: discount.amount,
    //                     value: discount.value
    //                 }
    //                 // return res.redirect('/product/:slug')
    //             console.log(value);
    //         }
    //     })
    // },
    postCart: async(req, res, next) => {
        const slugUrl = req.params.slug;
        const { amount_buy } = req.body;
        let user = await UserAPI.getOne({ username: req.session.username });
        let product = await ProductAPI.getOne({ slug: slugUrl });
        let amountUser = {
            amount: parseInt(amount_buy)
        };
        let price = parseInt(product.price) * 1000;
        product.price = (price * parseInt(amount_buy)).toLocaleString('it-IT', { style: "currency", currency: "VND" });

        let data_cart = Object.assign(user, product, amountUser);
        if (parseInt(amount_buy) <= product.amount) {
            var newCart = data_cart;
            await Cart(newCart).save();
            return res.redirect('/users/cart')
        } else {
            return res.json({
                success: false,
                message: 'loi'
            })
        }

    }
}




module.exports = ProductsController;