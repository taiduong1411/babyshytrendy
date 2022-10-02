const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/UsersController');
const check_Admin_account = require('../middlewares/validate');
const check_User_account = require('../middlewares/validatorUser');


router.get('/register', UsersController.getRegister);
router.get('/login', UsersController.getLogin);
router.get('/logout', check_User_account, UsersController.getLogout);
router.get('/change-password', check_User_account, UsersController.getchangePassword);
router.get('/change-information', check_User_account, UsersController.getchangeInformation);
router.get('/search', UsersController.getSearch);

router.post('/register', UsersController.postRegister);
router.post('/login', UsersController.postLogin);
router.post('/change-password', UsersController.postchangePassword);
router.post('/change-information', UsersController.postchangeInformation);

module.exports = router;