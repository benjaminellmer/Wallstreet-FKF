// services/drinkService.js

const databaseAccess = require('../DatabaseAccess/databaseAccess');


const getDrinks = () => {
    const sql = 'SELECT drinks.*, drinkGroup.name AS groupName\n' +
        'FROM drinks\n' +
        '         JOIN drinkGroup ON drinks.drinkGroupId = drinkGroup.id;';
    return databaseAccess.read(sql)
        .then(drinks => {
            console.log('read drinks from database');
            return drinks
        })
        .catch(err => {
            throw err;
        });
};

const addDrink = (drink) => {
    // Check if both name and price are provided
    if (!drink.name || drink.price === undefined) {
        // You can throw an error or return a rejected promise
        // I'm returning a rejected promise to keep consistent with the async nature of this function
        return Promise.reject(new Error('The name and price of the drink must be provided.'));
    }

    const sql = 'INSERT INTO drinks (name, price) VALUES (?, ?);';
    const params = [drink.name, drink.price];
    return databaseAccess.write(sql, params)
        .then((result) => {
            console.log('Added drink to database', result);
            return result;
        })
        .catch(err => {
            // Handle errors such as duplicate names or database connection issues
            throw err;
        });
};

const getAllDrinksWithPricing = () => {
    const sql = `
        SELECT 
            d.id, 
            d.name, 
            d.price, 
            dg.minPrice, 
            dg.maxPrice 
        FROM 
            drinks d
        INNER JOIN 
            drinkGroup dg ON d.drinkGroupId = dg.id;
    `;

    return databaseAccess.read(sql);
};

function updateNewDrinkPrice(drinkId, newPrice) {
    const sql = 'UPDATE drinks SET newPrice = ? WHERE id = ?;';
    const params = [newPrice, drinkId];
    return databaseAccess.write(sql, params)
        .then((result) => {
            // console.log('Updated drink price in database', result);
            return result;
        })
        .catch(err => {
            // Handle errors such as duplicate names or database connection issues
            throw err;
        });

}

function setNewDrinkPrice() {
    const sql = 'UPDATE drinks SET price = newPrice;';
    return databaseAccess.write(sql)
        .then((result) => {
            console.log('Updated drink price in database', result);
            return result;
        })
        .catch(err => {
            // Handle errors such as duplicate names or database connection issues
            throw err;
        });
}


module.exports = {
    getDrinks,
    addDrink,
    getAllDrinksWithPricing,
    updateNewDrinkPrice,
    setNewDrinkPrice
};
