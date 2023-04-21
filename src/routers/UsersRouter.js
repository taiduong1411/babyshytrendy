const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/UsersController');
const check_Admin_account = require('../middlewares/validate');
const check_User_account = require('../middlewares/validatorUser');
const autoLogout = require('../middlewares/autoLogout');


router.get('/register', UsersController.getRegister);
router.get('/login', autoLogout, UsersController.getLogin);
router.get('/logout', check_User_account, UsersController.getLogout);
router.get('/change-password', check_User_account, UsersController.getchangePassword);
router.get('/change-information', check_User_account, UsersController.getchangeInformation);
router.get('/search', UsersController.getSearch);
router.get('/cart', check_User_account, UsersController.getCart);
router.get('/cart-history', check_User_account, UsersController.getCartHistory);
router.get('/delete-cart/:pid', check_User_account, UsersController.getdeleteCart);

router.post('/register', UsersController.postRegister);
router.post('/login', UsersController.postLogin);
router.post('/change-password', UsersController.postchangePassword);
router.post('/change-information', UsersController.postchangeInformation);
router.post('/cart', check_User_account, UsersController.postOrder);



module.exports = router;