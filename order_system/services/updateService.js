
const cron = require('node-cron');
const io = require('socket.io')();
const orderService = require('./orderService');
const drinkService = require('./drinkService');
const databaseAccess = require('../DatabaseAccess/databaseAccess');
const cycleService = require('./cycleService');
require('colors');




// Function that calculates new prices
// Function that calculates new prices and returns a promise
function calculateNewPrices() {
    console.log('Calculating new prices...');

    return new Promise((resolve, reject) => {
        drinkService.getAllDrinksWithPricing()
            .then((allDrinks) => {
                const drinkOrderCountMap = new Map();

                allDrinks.forEach(drink => {
                    drinkOrderCountMap.set(drink.id, 0);
                });

                orderService.getDrinkOrdersByCycle(cycleService.getCycle())
                    .then((orderCounts) => {
                        orderCounts.forEach(order => {
                            drinkOrderCountMap.set(order.drink_id, order.total_ordered);
                        });
                        console.log('Drink order count map: ', drinkOrderCountMap)

                        let sum = 0;
                        drinkOrderCountMap.forEach((value, key) => {
                            sum += value;
                        });

                        allDrinks.forEach(drink => {
                            const orders = drinkOrderCountMap.get(drink.id);
                            const newPrice = calculatePrice(orders, drink, sum);

                            drinkService.updateNewDrinkPrice(drink.id, newPrice)
                                .then(() => {
                                    // Log price update
                                })
                                .catch((error) => {
                                    reject(error); // Reject promise if updating price fails
                                });
                        });

                        resolve('New prices calculated and updated.'); // Resolve promise when all prices are updated
                    })
                    .catch((error) => {
                        reject(error); // Reject promise if getting order counts fails
                    });
            })
            .catch((error) => {
                reject(error); // Reject promise if getting drinks fails
            });
    });
}


function calculatePrice(quantityOrdered, drink, totalOrders) {

    let orderPercentage = (quantityOrdered / totalOrders) * 100;
    if (drink.id === 1) {
        console.log('Quantity ordered: ' + quantityOrdered);
        console.log('Total orders: ' + totalOrders);
    }
    let newPrice = drink.price;

    if (totalOrders < 5) {
        return (drink.price -0.5 > drink.minPrice) ? drink.price - 0.5 : drink.minPrice;
    }
    if (orderPercentage > 40) {
        newPrice += 2;
    }else if (orderPercentage > 30) {
        newPrice += 1;
    }else if (orderPercentage < 5) {
        newPrice -= 1;
    }
    else if (orderPercentage < 15) {
        newPrice -= 0.5;
    }
    if (newPrice > drink.maxPrice) {
        newPrice = drink.maxPrice;
    } else if (newPrice < drink.minPrice) {
        newPrice = drink.minPrice;
    }

    return newPrice;
}

// Function to update the prices in the database
function updatePrices(io) {
    console.log(cycleService.getCycle() + '. cycle: Updating prices...');
    console.log('=====================================');
    cycleService.incrementCycle();
    drinkService.setNewDrinkPrice()
        .then(() => {
            console.log('Prices updated for cycle ' + cycleService.getCycle());


        })
        .catch((error) => {
            console.error('Error updating prices:', error);
        })
        .finally(() => {
            console.log('Prices updated.');
            io.emit('start_time', { message: updateCycle*5 });
        });
}

let updateCounter = 0;
let updateCycle = 6;
// Export a function that starts the cron jobs
function startScheduledTasks(io) {
    cron.schedule('*/5 * * * * *', async () => {
        console.log('Performing calculation task'.yellow);
        console.log('====================================='.yellow);
        await calculateNewPrices()
            .then(() => {
                console.log('sending update values')
                io.emit('update_values', {message: 'Update your values'})
                updateCounter++;
                if (updateCounter === updateCycle) {
                    updatePrices(io);
                    updateCounter = 0;
                }
                console.log('Ending calculation task'.yellow);
                console.log('====================================='.yellow);
            })



    });
}

module.exports = {
    startScheduledTasks
};