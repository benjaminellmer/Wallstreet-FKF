// controlllers/orderController.js
// Controller for handling requests related to orders

const orderService = require("../services/orderService");

const getAllOrders = (req, res) => {
    orderService.getOrders()
        .then((orders) => {
            res.status(200).json(orders);
        })
        .catch((err) => {
            res.status(500).send('Internal Server Error');
        });
};

const createOrder = async (req, res) => {
    console.log("createOrder received request:", req.body);

    try {
        // Assuming placeOrder is an async function
        const order = await orderService.placeOrder(req.body);
        console.log("Order created successfully:", order);
        res.status(201).json(order);
    } catch (err) {
        console.error("Error in createOrder:", err);
        // Send back a more informative error message in the response
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
};


module.exports = {
    getAllOrders,
    createOrder
};