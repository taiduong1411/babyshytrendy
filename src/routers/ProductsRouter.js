const express = require('express');
const { postComment } = require('../controllers/ProductsController');
const router = express.Router();
const ProductsController = require('../controllers/ProductsController');
const check_User_account = require('../middlewares/validatorUser');

router.get('/:slug', ProductsController.getproDetail);

// router.get('/check-discount', ProductsController.getDiscount);





// router.post('/:slug', check_User_account, ProductsController.postCart);
router.post('/updateCart', check_User_account, ProductsController.postUpdateCart);
router.post('/comment', check_User_account, ProductsController.postComment);


module.exports = router;