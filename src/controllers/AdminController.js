const express = require('express');
const lodash = require('lodash')
const Users = require('../models/Users');
const Products = require('../models/Products');
const Group = require('../models/Group');
const Discount = require('../models/Discount');
const UserAPI = require('../API/UserAPI');
const AdminAPI = require('../API/AdminAPI');
const OrderAPI = require('../API/OrderAPI');
const fs = require('fs-extra');
const Order = require('../models/Order');
const excelToJson = require('convert-excel-to-json');
const Comments = require('../models/Comments');
const ProductAPI = require('../API/ProductAPI');
const slug = require('slug');
const { differenceBy } = require('lodash');
const nodemailer = require('nodemailer');

const AdminController = {
    getAdmin: (req, res) => {
        return res.render('admin/admin_home', {
            username: req.session.username,
        });
    },
    getlistProduct: async(req, res) => {
        let error = req.flash('error') || ""
        let success = req.flash('success') || ""
        let modal = req.flash('modal') || ""
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
            success: success,
            modal_BE: modal
        })
    },
    getdeleteProduct: async(req, res, next) => {
        const idUrl = req.params.id;
        // let product = await Products.findOne({ _id: idUrl })
        await AdminAPI.delete(idUrl).then(async product => {
            let folderPath = `./src/public/uploads/${product.pid}`
            fs.removeSync(folderPath, { recursive: true })
            let cmt = await Comments.findOne({ pid: product.pid })
            if (!cmt) {
                req.flash('success', 'Xoá sản phẩm thành công !')
                return res.redirect('/admin/list-product')
            } else {
                await Comments.findByIdAndDelete(cmt._id).then(() => {
                    req.flash('success', 'Xoá sản phẩm thành công !')
                    return res.redirect('/admin/list-product')
                })
            }
        }).catch(error => {
            req.flash('error', 'Không thể xoá sản phẩm')
            return res.redirect('/admin/list-product')
        })

    },
    getaddProduct: (req, res) => {
        let error = req.flash('error' || '');
        let success = req.flash('success' || '');
        let modal = req.flash('modal') || ""
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
                modal_BE: modal,
                options: options,
            })
        }))
    },
    postImportFile: async(req, res, next) => {
        let filename = req.file.filename
        let filePath = `./src/public/uploads/${filename}`
        const excelData = excelToJson({
            sourceFile: filePath,
            sheets: [{
                // Excel Sheet Name
                name: 'Products',
                // Header Row -> be skipped and will not be present at our result object.
                header: {
                    rows: 1
                },
                // Mapping columns to keys
                columnToKey: {
                    A: 'pid',
                    B: 'pro_name',
                    C: 'description',
                    D: 'price',
                    E: 'amount',
                    F: 'image',
                    G: 'gid',
                    H: 'agency'
                }
            }]
        });
        //add Slug
        var data = excelData.Products
        for (var i = 0; i < data.length; i++) {
            let slug_pro = slug(data[i].pro_name)
            data[i].slug = slug_pro
        }
        //check Duplicate Object in Array of FILE
        var data_update = lodash.uniqBy(data, 'pid')
        var products = await AdminAPI.getAll({ sort: 1 });
        // check has exist in DB
        const notExist_DB = lodash.differenceBy(data_update, products, 'pid')
        const exits_DB = lodash.intersectionBy(data_update, products, 'pid')
        const send_exits = exits_DB.map(exits_DB => {
            return {
                pid: exits_DB.pid,
                pro_name: exits_DB.pro_name,
                amount: exits_DB.amount
            }
        })
        Products.insertMany(notExist_DB, async(err, data) => {
            if (err) {
                req.flash('error', 'Vui Lòng Kiểm Tra Lại File!!!')
                return res.redirect('/admin/add-product')
            } else {
                if (send_exits.length > 0) {
                    await req.flash('modal', send_exits);
                    req.flash('success', `Thêm sản phẩm thành công ${notExist_DB.length} sản phẩm !`)
                    return res.redirect('/admin/list-product');
                } else {
                    req.flash('success', `Thêm sản phẩm thành công ${notExist_DB.length} sản phẩm !`)
                    return res.redirect('/admin/list-product');
                }
            }
        })
        fs.unlinkSync(filePath);
    },
    postUpdateAmount: async(req, res, next) => {
        const { pid, amount } = req.body
            // var data_pid = ['AS001', 'AW002', 'AQ003', 'AIS019']
            // var data_amount = ['20', '20', '20', '20']
        for (var i = 0; i < pid.length; i++) {
            for (var j = 0; j < amount.length; j++) {
                var product = await Products.findOne({ pid: pid[i] })
                var product_amount = product.amount
                product_amount = parseInt((product_amount)) + parseInt(amount[j])
            }
            product.save()
        }
        req.flash('success', 'Cập nhật thành công!')
        return res.redirect('/admin/list-product')
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
        var pro_name = (req.query.pro_name).trim();
        // generate input
        // var pro_name = pro_name_notGen.trim()
        if (pro_name == '') {
            return res.redirect('/admin/list-product')
        }
        var query = { '$or': [{ pid: { $regex: `${pro_name}`, "$options": "i" } }, { pro_name: { $regex: `${pro_name}`, "$options": "i" } }] }
        var data_name = await AdminAPI.getSearchByName(query);
        // tim kiem that bai
        if (data_name == '') {
            var data = products.filter(function(products) {
                    return (products.pro_name)
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                        .toLowerCase().trim()
                        .indexOf(pro_name.toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/đ/g, 'd').replace(/Đ/g, 'D')) !== -1
                })
                // console.log(data)
            if (data == '') {
                let split = pro_name.split('')
                var result = []
                for (var k = 0; k < split.length; k++) {
                    for (var e = k + 1; e < split.length; e++) {
                        if (split.length > 3) {
                            for (var f = 0; f < split.length; f++) {
                                var test = split[k] + split[e] + split[f]
                                result.push(test)
                            }
                        } else {
                            if (split.length == 3) {
                                var test = split[k] + split[e]
                                result.push(test)
                            } else {
                                var test = split[k] + split[e]
                                result.push(test)
                            }
                        }
                    }
                }
                // console.log(result)
                var lengthPro = []
                for (var u = 0; u < products.length; u++) {
                    lengthPro.push(products[u].pro_name)
                }
                // console.log(lengthPro)
                var arr = []
                for (var z = 0; z < result.length; z++) {
                    for (var n = 0; n < lengthPro.length; n++) {
                        if (lengthPro[n].includes(result[z]) == true) {
                            var data_2 = lengthPro[n]
                            arr.push(data_2)
                        } else {
                            // console.log('false')
                        }
                    }
                }
                // check duplicate in arr
                const arr_2 = Array.from(new Set(arr));
                // console.log(arr_2)
                // find each element in arr
                var data_name_1 = []
                for (var m = 0; m < arr_2.length; m++) {
                    var query = { '$or': [{ pid: { $regex: `${pro_name}`, "$options": "i" } }, { pro_name: { $regex: `${arr[m]}`, "$options": "i" } }] }
                    var data_name_for = await AdminAPI.getSearchByName(query);
                    data_name_1.push(data_name_for)
                }
                var data_name_2 = Array.from(new Set(data_name_1.flat()))
                    // var data_name_checkDuplicate = []
                for (var a = 0; a < data_name_2.length; a++) {
                    for (var b = a + 1; b < data_name_2.length; b++) {
                        if (data_name_2[a].pid == data_name_2[b].pid) {
                            data_name_2.splice(a, 1)
                        } else {
                            // data_name_checkDuplicate.push(data_name_2[a].pid)
                        }
                    }
                }
                // console.log(data_name_checkDuplicate)
                var data_search = []
                for (var i = 0; i < data_name_2.length; i++) {
                    var data = {
                        id: data_name_2[i]._id,
                        pid: data_name_2[i].pid,
                        amount: data_name_2[i].amount,
                        image: data_name_2[i].image[0],
                        pro_name: data_name_2[i].pro_name,
                        price: data_name_2[i].price,
                        createdAt: data_name_2[i].createdAt.toLocaleString('en-GB')
                    }
                    data_search.push(data)
                }
                var result_1 = await AdminAPI.getTotal();
                var total = result_1.reduce(function(r, a, i) { return r + a.price * a.amount }, 0);
                if (data_name_2 == '') {
                    req.flash('error', 'Không tìm thấy sản phẩm !')
                    return res.redirect('/admin/list-product')
                } else {
                    res.render('admin/list-product', {
                        listProduct: data_search,
                        totalPrice: total.toLocaleString('it-IT', { style: "currency", currency: "VND" })
                    })
                }
            } else {
                var result_1 = await AdminAPI.getTotal();
                var total = result_1.reduce(function(r, a, i) { return r + a.price * a.amount }, 0);
                return res.render('admin/list-product', {
                    listProduct: data,
                    totalPrice: total.toLocaleString('it-IT', { style: "currency", currency: "VND" })
                })
            }
        } else {
            var data_search = []
            for (var i = 0; i < data_name.length; i++) {
                var data = {
                    id: data_name[i]._id,
                    pid: data_name[i].pid,
                    amount: data_name[i].amount,
                    image: data_name[i].image[0],
                    pro_name: data_name[i].pro_name,
                    price: data_name[i].price,
                    createdAt: data_name[i].createdAt.toLocaleString('en-GB')
                }
                data_search.push(data)
            }
            var result_1 = await AdminAPI.getTotal();
            var total = result_1.reduce(function(r, a, i) { return r + a.price * a.amount }, 0);
            return res.render('admin/list-product', {
                listProduct: data_search,
                totalPrice: total.toLocaleString('it-IT', { style: "currency", currency: "VND" })
            })
        }
    },
    postaddProduct: async(req, res, next) => {
        const { pid, pro_name, description, gid, newGroup, price, amount, agency } = req.body;
        const files = req.files;
        if (files.length == 0) {
            req.flash('error', 'Vui lòng nhập hình');
            return res.redirect('/admin/add-product');
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
                    Group(newBrand).save()
                }
            })
        }
        let product = await AdminAPI.getOne({ pid: pid });
        // console.log(product)
        let numPrice = "000";
        if (!product) {
            var newPro = {
                pid: pid,
                gid: (gid) ? gid : newGid,
                pro_name: pro_name,
                description: description,
                amount: amount,
                price: (price + numPrice),
                agency: agency,
                image: imgList,
            }
            req.flash('success', 'Nhập sản phẩm thành công')
            await AdminAPI.Create(newPro)
            return res.redirect('/admin/add-product')
        } else {
            req.flash('error', 'Sản phẩm đã tồn tại')
            return res.redirect('/admin/add-product')
        }
    },
    getDashboard: async(req, res, next) => {
        let products = await AdminAPI.getAll({})
        let data_agency = products.map(a => {
                return {
                    agency: a.agency,
                }
            })
            // const uniqueArr = [...new Map(data_agency.map((obj) => [`${obj.agency}`, obj])).values()];
        const uniqueArr = lodash.uniqBy(data_agency, 'agency');
        return res.render('admin/dashboard', {
            agency: uniqueArr
        })
    },
    getDataWeek: async(req, res, next) => {
        let orders = await Order.find().lean()
        let toDay = new Date().toLocaleDateString('en-GB')
            // console.log(toDay)

        function getDaysInCurrentMonth() {
            const date = new Date();
            return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        }
        var result = getDaysInCurrentMonth();
        var dayCurr = new Date().getDate()

        var monthCurr = new Date().getMonth() + 1
        var yearCurr = new Date().getFullYear()
        var DayOfWeek = []
        for (var j = dayCurr; j < dayCurr + 7; j++) {
            if (j < result + 1) {
                if (j < 10) {
                    DayOfWeek.push('0' + j + '/0' + monthCurr + '/' + yearCurr);
                } else {
                    DayOfWeek.push(j + '/0' + monthCurr + '/' + yearCurr);
                }
            } else {
                DayOfWeek.push((j - result) + '/0' + (monthCurr + 1) + '/' + yearCurr)
            }
        }
        var data_week = []
        for (var k = 0; k < DayOfWeek.length; k++) {
            let orderToday = orders.filter(order => (order.updatedAt).toLocaleDateString('en-GB') == DayOfWeek[k].toString() && order.status == true)
            let count_orderToday = orderToday.length
            let object = {
                day: DayOfWeek[k],
                order_total: count_orderToday
            }
            data_week.push(object)
        }
        // console.log(data_week)
        return res.send(data_week)
    },
    getDataAgency: async(req, res, next) => {
        let products = await AdminAPI.getAll({ sort: 1 })
        return res.send(products)
    },
    getUserList: async(req, res) => {
        let error = req.flash('error') || ""
        let success = req.flash('success') || ""
        const { _id } = req.body;
        let users = await (await AdminAPI.getUser({ sort: -1 }));

        //lay phan tu tu 1->length
        // let users_shift = users.shift();
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
        let error = req.flash('error' || '');
        let success = req.flash('success' || '');
        var carts = await OrderAPI.getAll({ sort: -1 })
        return res.render('admin/list-cart', {
            username: req.session.username,
            cartList: carts,
            // pOrder: result,
            success: success,
            error: error
        });
    },
    getConfirmCart: async(req, res, next) => {
        const codeUrl = req.params.code_order;
        // get 1 order by codeURL
        let order = await Order.findOne({ code_order: codeUrl });
        // get user from order 
        let user = await UserAPI.getOne({ username: order.c_name });
        // get code order
        let code_order = order.code_order;
        // get history cart of user
        let history = user.cart_history;
        history.push(code_order);
        // update db
        let id = (order._id).toString();
        await Order.findByIdAndUpdate(id, { status: true })
        await Users.findByIdAndUpdate(user.id, { cart_history: history });
        // get all order -> filter by username to get total value of cart
        let orders = await Order.find();
        let order_byUser = orders.filter(order => order.c_name == user.username && order.status == true)
        var totalPrice = 0;
        for (var i = 0; i < order_byUser.length; i++) {
            if (order_byUser[i].code_discount != '') {
                let valueDefault = lodash.sumBy(order_byUser[i].pOrder, function(p) {
                    return p.total
                })
                totalPrice = totalPrice + valueDefault
            } else {
                totalPrice = totalPrice + order_byUser[i].total_price
            }
        }
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        function generateString(length) {
            var result = '';
            const charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }

            return result;
        }
        async function mail(email, code, value) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'djtimz1411@gmail.com',
                    pass: 'esfryvpkyuykxyzy'
                }
            })
            var mailOptions = {
                from: 'djtimz1411@gmail.com',
                to: email,
                subject: `Thanks! ${user.username}. Here is code discount ${value} for the next bill`,
                text: code
            };
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
        switch (true) {
            case totalPrice >= 1000000 && totalPrice < 2000000:
                // random code off 10%
                let code_10 = generateString(7);
                await Discount.findOne({ customer: user.username }).then(async discount => {
                    if (!discount) {
                        let data = {
                            code: code_10,
                            amount: 1,
                            value: 0.1,
                            customer: user.username,
                            email_status: true
                        }
                        await Discount(data).save();
                        // send to user's email
                        await mail(user.email, code_10, '10%')
                    } else {
                        if (discount.email_status == true) {
                            // console.log('da gui email')
                            next();
                        } else {
                            discount.email_status = true
                            await discount.save()
                            await mail(user.email, discount.code_10, '10%')
                        }
                    }
                })
                break;
            case totalPrice >= 2000000 && totalPrice < 4000000:
                // random code off 15%
                let code_15 = generateString(7)
                await Discount.findOne({ customer: user.username }).then(async discount => {
                    if (!discount) {
                        let data = {
                            code: code_15,
                            amount: 1,
                            value: 0.15,
                            customer: user.username,
                            email_status: true
                        }
                        await Discount(data).save();
                        await mail(user.email, code_15, '15%')
                    } else {
                        if (discount.value == 0.1) {
                            discount.value = 0.15
                            discount.code = code_15
                            await discount.save()
                            mail(user.email, code_15, '15%')
                        } else {
                            if (discount.email_status == true) {
                                // console.log('da gui email')
                                next();
                            } else {
                                discount.email_status = true
                                await discount.save()
                                await mail(user.email, discount.code_15, '15%')
                            }
                        }
                    }
                })
                break;
            case totalPrice > 4000000 && totalPrice < 10000000:
                let code_20 = generateString(7)
                await Discount.findOne({ customer: user.username }).then(async discount => {
                    if (!discount) {
                        let data = {
                            code: code_20,
                            amount: 1,
                            value: 0.2,
                            customer: user.username,
                            email_status: true
                        }
                        await Discount(data).save();
                        await mail(user.email, code_20, '20%')
                    } else {
                        if (discount.value == 0.15) {
                            discount.value = 0.2
                            discount.code = code_20
                            await discount.save()
                            await mail(user.email, code_20, '20%')
                        } else {
                            if (discount.email_status == true) {
                                // console.log('da gui email')
                                next();
                            } else {
                                discount.email_status = true
                                await discount.save()
                                await mail(user.email, discount.code_20, '20%')
                            }
                        }
                    }
                })
                break;
            case totalPrice > 10000000 && totalPrice < 15000000:
                let code_30 = generateString(7)
                await Discount.findOne({ customer: user.username }).then(async discount => {
                    if (!discount) {
                        let data = {
                            code: code_30,
                            amount: 1,
                            value: 0.15,
                            customer: user.username,
                            email_status: true
                        }
                        await Discount(data).save();
                        await mail(user.email, code_30, '30%')
                    } else {
                        if (discount.value == 0.2) {
                            discount.value = 0.3
                            discount.code = code_30
                            await discount.save()
                            await mail(user.email, code_30, '30%')
                        } else {
                            if (discount.email_status == true) {
                                // console.log('da gui email')
                                next();
                            } else {
                                discount.email_status = true
                                await discount.save()
                                await mail(user.email, discount.code_30, '30%')
                            }
                        }
                    }
                })
                break;
            default:
                next();
        }
        return res.status(200)
    },
    getCancelOrder: async(req, res, next) => {
        // get Url of order
        var codeUrl = req.params.code_order
        await Order.findOne({ code_order: codeUrl }).then(async order => {
            order.status = false
            await order.save()
            return res.status(200)
        })
    },
    getEditProduct: async(req, res, next) => {
        const idUrl = req.params.id
        let product = await Products.findOne({ _id: idUrl })
        let id = (product._id).toString()
        const data = {
            id: id,
            pid: product.pid,
            pro_name: product.pro_name,
            description: product.description,
            price: product.price / 1000,
            amount: product.amount,
            image: product.image
        }
        return res.render('admin/edit-product', {
            data: data,
            username: req.session.username
        })
    },
    postEditProduct: async(req, res, next) => {
        const { pid, pro_name, price, amount, description } = req.body;
        const files = req.files
            // console.log(files)
        let imgList = [];
        files.forEach(file => {
            let path = `/uploads/${pid}/${file.filename}`;
            imgList.push(path);
        })
        const idUrl = req.params.id
        let product = await Products.findOne({ _id: idUrl })
        if (!product) {
            return res.redirect(`/admin/edit-product/${id}`)
        }
        let image = product.image
        let mergeImage = [...imgList, ...image];
        product.pid = pid
        product.description = description
        product.price = price * 1000
        product.pro_name = pro_name
        product.amount = amount
        product.image = mergeImage
        await product.save()
        return res.redirect('/admin/list-product')
    },
    postAddImageProduct: async(req, res, next) => {
        const { update_image } = req.body
        const idUrl = req.params.id
        console.log(idUrl)
        console.log(update_image)
    },
    postDeleteImage: async(req, res, next) => {
        const idUrl = req.params.id
        const { src } = req.body
        let product = await Products.findOne({ _id: idUrl })
        if (!product) {
            return res.send('error')
        }
        var imageProduct = product.image
        for (var i = 0; i < imageProduct.length; i++) {
            if (imageProduct[i] === src) {
                imageProduct.splice(i, 1)
            } else {
                continue
            }
        }
        let filePath = `./src/public/${src}`
        fs.unlinkSync(filePath)
        await Products.findByIdAndUpdate({ _id: idUrl }, { image: imageProduct })
    }
}

module.exports = AdminController;