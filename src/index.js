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
const database = require('./config/database');
// Models
const Users = require('./models/Users');
const Products = require('./models/Products');
const Group = require('./models/Group');
const Cart = require('./models/Cart');
const Discount = require('./models/Discount');
// Routers
const UsersRouter = require('./routers/UsersRouter');
const ProductsRouter = require('./routers/ProductsRouter');
const AdminRouter = require('./routers/AdminRouter');
const CartRouter = require('./routers/CartRouter');
// APIs
const AdminAPI = require('./API/AdminAPI');
const UserAPI = require('./API/UserAPI');
const ProductAPI = require('./API/ProductAPI');
const CartAPI = require('./API/CartAPI');
const port = process.env.PORT || 3000;
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
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cookieParser('ddn'));
app.use(session({ cookie: { maxAge: (1000 * 60 * 40) } }));

app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

// config end

app.get('/home', async(req, res) => {
    const page = parseInt(req.query.page) || 1;
    const nProducts = 4;
    const skip = nProducts * (page - 1); // 0 4 8 12 16

    const total = await Products.countDocuments()
        .then(count => {
            return count;
        }) // 6

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
                displayNext: (page == n) ? 'd-none' : ''
            })
        })
});
app.use('/users', UsersRouter);
app.use('/users', CartRouter);
app.use('/product', ProductsRouter);
app.use('/admin', AdminRouter);
app.get('/', (req, res) => {
    return res.redirect('/home');
})

// localhost
app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})