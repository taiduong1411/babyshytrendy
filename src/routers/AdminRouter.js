const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');

const upload = require('../middlewares/multer');
const upload_file = require('../middlewares/multer_uploadFile')
const check_Admin_account = require('../middlewares/validate');

router.get('/admin_home', check_Admin_account, AdminController.getAdmin);
router.get('/list-product', check_Admin_account, AdminController.getlistProduct);
router.get('/delete-product/:id', check_Admin_account, AdminController.getdeleteProduct);
router.get('/add-product', check_Admin_account, AdminController.getaddProduct);
router.get('/edit-product/:id', check_Admin_account, AdminController.getEditProduct);
router.get('/dashboard', check_Admin_account, AdminController.getDashboard);
router.get('/search', check_Admin_account, AdminController.getAdminSearch);
router.get('/list-users', check_Admin_account, AdminController.getUserList);
router.get('/add-discount', check_Admin_account, AdminController.getDiscount);
router.get('/list-cart', check_Admin_account, AdminController.getlistCart);
router.get('/confirm-cart/:code_order', check_Admin_account, AdminController.getConfirmCart);
router.get('/cancel-order/:code_order', check_Admin_account, AdminController.getCancelOrder);
router.get('/data', check_Admin_account, AdminController.getDataWeek);
router.get('/data-product', check_Admin_account, AdminController.getDataAgency);
router.get('/', check_Admin_account, AdminController.getAdminHome);


router.post('/add-product', upload.array('image', 10), AdminController.postaddProduct);
router.post('/add-discount', AdminController.postDiscount);
router.post('/import-file', upload_file.single('file'), AdminController.postImportFile);
router.post('/edit-product/:id', upload.array('image', 10), AdminController.postEditProduct);
router.post('/delete-image/:id', AdminController.postDeleteImage);
router.post('/add-image/:id', AdminController.postAddImageProduct);
router.post('/update-amount-product', AdminController.postUpdateAmount);

module.exports = router;