const express = require('express');
const router = express.Router();
const ProductsController = require('../controllers/ProductsController');

router.get('/:slug', ProductsController.getproDetail);


module.exports = router;