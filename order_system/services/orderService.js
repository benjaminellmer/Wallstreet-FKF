// services/orderService.js

const databaseAccess = require('../DatabaseAccess/databaseAccess');
const cycleService = require('./cycleService');


const getOrders = () => {
    const sql = 'SELECT \n' +
        '    o.id AS order_id, \n' +
        '    o.createCycle, \n' +
        '    o.created_at, \n' +
        '    d.name AS drink_name, \n' +
        '    oi.quantity\n' +
        'FROM \n' +
        '    orders o\n' +
        'INNER JOIN \n' +
        '    order_items oi ON o.id = oi.order_id\n' +
        'INNER JOIN \n' +
        '    drinks d ON oi.drink_id = d.id\n' +
        'ORDER BY \n' +
        '    o.id, d.name;\n';
    return databaseAccess.read(sql)
        .then(orders => {
            console.log('read orders from database');
            return orders
        })
        .catch(err => {
            throw err;
        });
};

async function placeOrder(orderDetails) {

    if(!orderDetails.drinks){
        throw new Error('No drinks in order');
    }
    var orderItems = orderDetails.drinks;
    const db = databaseAccess.connect(); // Establish the connection once for the transaction

    try {
        // Start the transaction
        await databaseAccess.write('BEGIN TRANSACTION;', [], db);

        // Insert the new order and retrieve the order id
        const orderInsertSql = "INSERT INTO orders (createCycle) VALUES (?);";
        const orderResult = await databaseAccess.write(orderInsertSql, [cycleService.getCycle()], db);
        const orderId = orderResult.lastID;


        console.log('orderItems: ', orderItems);
        console.log('in cycle: ', cycleService.getCycle());

        // Insert order items using the orderId
        const orderItemInsertSql = "INSERT INTO order_items (order_id, drink_id, quantity) VALUES (?, ?, ?);";
        for (const item of orderItems) {
            await databaseAccess.write(orderItemInsertSql, [orderId, item.id, item.quantity], db);
        }

        // Commit the transaction if all goes well
        await databaseAccess.write('COMMIT;', [], db);
    } catch (error) {
        // Rollback the transaction in case of an error
        console.error('An error occurred during the transaction, rolling back:', error);
        await databaseAccess.write('ROLLBACK;', [], db);
        throw error; // Propagate the error
    } finally {
        console.log('Transaction complete');
        // Ensure the database connection is closed
        if (db) {
            db.close();
        }
    }
}

const getDrinkOrdersByCycle = (createCycle) => {
    const sql = `
        SELECT 
            d.id AS drink_id, 
            d.name AS drink_name, 
            SUM(oi.quantity) AS total_ordered
        FROM 
            drinks d
        JOIN 
            order_items oi ON d.id = oi.drink_id
        JOIN 
            orders o ON oi.order_id = o.id
        WHERE 
            o.createCycle = ?
        GROUP BY 
            d.id, d.name
        ORDER BY 
            total_ordered DESC;
    `;

    return databaseAccess.read(sql, [createCycle]);
};


module.exports = {
    getOrders,
    placeOrder,
    getDrinkOrdersByCycle
};

