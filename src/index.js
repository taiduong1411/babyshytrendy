const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const multer = require('multer');
const queryString = require('query-string');
const bodyParser = require('body-parser');
const compression = require('compression')
const excelToJson = require('convert-excel-to-json');
const database = require('./config/database');
const os = require('os')
require('dotenv').config();
const MongoStore = require('connect-mongo')
    // Models
const Users = require('./models/Users');
const Products = require('./models/Products');
const Group = require('./models/Group');
const Order = require('./models/Order');
const Discount = require('./models/Discount');
const Comment = require('./models/Comments');
// Routers
const UsersRouter = require('./routers/UsersRouter');
const ProductsRouter = require('./routers/ProductsRouter');
const AdminRouter = require('./routers/AdminRouter');
const CartRouter = require('./routers/CartRouter');
// APIs
const AdminAPI = require('./API/AdminAPI');
const UserAPI = require('./API/UserAPI');
const ProductAPI = require('./API/ProductAPI');
const OrderAPI = require('./API/OrderAPI');
const port = process.env.PORT;
database.connect();
//  config
app.set('view engine', 'hbs');
app.engine('hbs', handlebars.engine({
    extname: 'hbs'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(compression())
process.env.UV_THREADPOOL_SIZE = os.cpus().length
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cookieParser('ddn'));
// app.use(session({ cookie: { maxAge: (1000 * 60 * 40) } }));
app.use(session({
    cookie: { maxAge: (1000 * 60 * 40) },
    secret: 'foo',
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://taiduong:taiduong1411@taiduong.28espap.mongodb.net/babyshytrendy?retryWrites=true&w=majority'
    })
}));

app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

// config end
Users.find().then(users => {
    users.forEach(user => {
        user.isLogin = false;
        user.save();
    })
})

app.get('/home', async(req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const nProducts = 4;
    const skip = nProducts * (page - 1); // 0 4 8 12 16

    const total = await Products.countDocuments()
        .then(count => {
            return count;
        }); // 6
    let n = Math.ceil(total / nProducts); // 2 trang
    let html = '';
    for (let i = 1; i <= n; i++) {
        if (i == page) {
            html += `<li class="pageNumber active"><a href="/home?page=${i}">${i}</a></li>`
        } else {
            html += `<li class="pageNumber"><a href="/home?page=${i}">${i}</a></li>`
        }

    }


    Products.find({})
        .sort({ createdAt: -1 })
        .limit(nProducts)
        .skip(skip)
        .then((products) => {
            if (!products) {
                return res.render('home', {
                    username: true,
                    username: req.session.username,
                    data: []
                })
            }
            let data = products.map(products => {
                return {
                    pid: products.pid,
                    pro_name: products.pro_name,
                    price: (products.price).toLocaleString('it-IT', { style: 'currency', currency: 'VND' }),
                    image: products.image[0],
                    slug: products.slug
                }
            });
            return res.render('home', {
                header: true,
                newCollection: true,
                login_icon: (req.session.username) ? false : true,
                username: true,
                admin: (req.session.level == 'admin') ? true : false,
                username: req.session.username,
                avatar: req.session.image,
                data: data,
                next: page + 1,
                prev: page - 1,
                pages: html,
                displayPrev: (page == 1) ? 'd-none' : '',
                displayNext: (page == n) ? 'd-none' : '',
                // amountCart: a
            })
        })
        // var user = UserAPI.getOne({ username: req.session.username }).then(user => {
        //     if (!user) {
        //         var amountCart = 0
        //     } else {
        //         var a = user.cart.length.toString()
        //         return res.render('home', {
        //             amountCart: a
        //         })
        //     }
        // })
});
app.post('/check-discount', async(req, res, next) => {
    const code = req.body.code;
    await Discount.findOne({ code: code })
        .then(discount => {
            if (!discount) {
                return res.send({ value: 1 });
            } else {
                if (discount.amount == 0) {
                    // return res.send({ err: 'Mã khuyến mãi đã hết hạn' });
                    return res.send({ value: 1 });
                }

            }
            return res.send({ value: discount.value });
        })
})
app.use('/users', UsersRouter);
app.use('/users', CartRouter);
app.use('/product', ProductsRouter);
app.use('/admin', AdminRouter);
app.use('/account', UsersRouter)
app.get('/', (req, res) => {
    return res.redirect('/home');
})

// localhost
app.listen(port, () => {
    console.log(`Server is running on ${port}`)
        // console.log(os.cpus().length)
})