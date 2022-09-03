const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/UsersController');

router.get('/register', UsersController.getRegister);
router.get('/login', UsersController.getLogin);
router.get('/logout', UsersController.getLogout);
router.get('/change-password', UsersController.getchangePassword);
router.get('/change-information', UsersController.getchangeInformation);
router.get('/add-product', UsersController.getaddProduct);


router.post('/register', UsersController.postRegister);
router.post('/login', UsersController.postLogin);
router.post('/change-password', UsersController.postchangePassword);
router.post('/change-information', UsersController.postchangeInformation);
router.post('/add-product', UsersController.postaddProduct);

// router.post('/add-product/count', (req, res) => {
//     console.log('pass')
//     Products.findOne()
//         .sort({ createdAt: -1 })
//         .then(product => {
//             if (product) {
//                 return res.send(product.pid)
//             }
//         })

// })


module.exports = router;