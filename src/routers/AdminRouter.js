const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');

const upload = require('../middlewares/multer');


router.get('/admin_home', AdminController.getAdmin);
router.get('/list-product', AdminController.getlistProduct);
router.get('/delete-product/:id', AdminController.getdeleteProduct);
router.get('/add-product', AdminController.getaddProduct);
router.get('/dashboard', AdminController.getDashboard);


router.post('/add-product', upload.single('image'), AdminController.postaddProduct);


module.exports = router;