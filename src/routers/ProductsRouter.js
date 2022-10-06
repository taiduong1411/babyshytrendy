const express = require('express');
const router = express.Router();
const ProductsController = require('../controllers/ProductsController');

router.get('/:slug', ProductsController.getproDetail);
// router.get('/check-discount', ProductsController.getDiscount);





router.post('/:slug', ProductsController.postCart);


module.exports = router;