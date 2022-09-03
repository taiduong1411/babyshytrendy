const express = require('express');
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const database = require('./config/database');
const Users = require('./models/Users');
const Products = require('./models/Products');
const Group = require('./models/Group');
const UsersRouter = require('./routers/UsersRouter');
const ProductsRouter = require('./routers/ProductsRouter');
const port = 3000;
database.connect();
//  config
app.set('view engine', 'hbs');
app.engine('hbs', handlebars.engine({
    extname: 'hbs'
}));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cookieParser('ddn'));
app.use(session({ cookie: { maxAge: 300000 } }));

app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

// config end


app.get('/home', (req, res) => {
    const { pid, pro_name, price, image } = req.body;
    Products.find({})
        .sort({ createdAt: -1 })
        .limit(4)
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
                    price: products.price,
                    image: products.image,
                    slug: products.slug
                }
            });
            // console.log(data);
            if (!req.session.username) {
                return res.render('home', {
                    login_icon: true,
                    username: true,
                    username: req.session.username,
                    data: data
                })
            } else {
                return res.render('home', {
                    username: true,
                    username: req.session.username,
                    data: data
                })
            }
        })


});
app.use('/users', UsersRouter);
app.use('/product', ProductsRouter);
app.get('/', (req, res) => {
    return res.render('home')
})

// localhost
app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})