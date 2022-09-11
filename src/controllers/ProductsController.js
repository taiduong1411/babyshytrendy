const express = require('express');
const Users = require('../models/Users');
const Products = require('../models/Products');


const ProductsController = {
    getproDetail: (req, res, next) => {
        const slugUrl = req.params.slug;
        Products.findOne({ slug: slugUrl }).then(product => {
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
                gid: product.gid
            }
            return res.render('products/product-detail', {
                data: data,
                header: true,
                username: (req.session.username) ? req.session.username : 'Customer'
            })
        })
    },
}




module.exports = ProductsController;