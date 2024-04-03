const express = require('express');
const router = express.Router();
const controller = require('../controllers/exampleController');
const drinkController = require('../controllers/drinkController');
const orderController = require('../controllers/orderController');

// Example routes
router.get('/example', controller.getExample);

// Drink routes
router.get('/drinks', drinkController.getAllDrinks);
router.get('/drinks/:id', drinkController.getDrinkById);
router.post('/drinks', drinkController.addDrink);

// Order routes
router.get('/orders', orderController.getAllOrders);
router.post('/orders', orderController.createOrder);

module.exports = router;
