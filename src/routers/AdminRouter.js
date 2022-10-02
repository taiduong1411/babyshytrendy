const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');

const upload = require('../middlewares/multer');
const check_Admin_account = require('../middlewares/validate');

router.get('/admin_home', check_Admin_account, AdminController.getAdmin);
router.get('/list-product', check_Admin_account, AdminController.getlistProduct);
router.get('/delete-product/:id', check_Admin_account, AdminController.getdeleteProduct);
router.get('/add-product', check_Admin_account, AdminController.getaddProduct);
router.get('/dashboard', check_Admin_account, AdminController.getDashboard);
router.get('/search', check_Admin_account, AdminController.getAdminSearch);
router.get('/list-users', check_Admin_account, AdminController.getUserList);


router.post('/add-product', upload.single('image'), AdminController.postaddProduct);


module.exports = router;