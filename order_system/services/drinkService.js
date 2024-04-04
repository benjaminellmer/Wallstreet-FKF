// services/drinkService.js

const databaseAccess = require("../DatabaseAccess/databaseAccess");

const getDrinks = () => {
  const sql =
    "SELECT drinks.*, drinkGroup.name AS groupName\n" +
    "FROM drinks\n" +
    "         JOIN drinkGroup ON drinks.drinkGroupId = drinkGroup.id;";
  return databaseAccess
    .read(sql)
    .then((drinks) => {
      console.log("read drinks from database");
      return duplicateDrinks(drinks);
    })
    .catch((err) => {
      throw err;
    });
};

const DrinkGroups = {
  ANTI_ALKOHOL: 1,
  LONG_DRINK: 2,
  SHOTS: 3,
  BIER_UND_WEIN: 4,
};

function duplicateDrinks(drinks) {
  const duplicatedDrinks = drinks.reduce((acc, drink) => {
    if (drink.drinkGroupId === DrinkGroups.SHOTS) {
      acc.push(drink);
      return acc;
    }
    let priceDiff = 0;
    if (drink.drinkGroupId == DrinkGroups.BIER_UND_WEIN) {
      priceDiff = 1;
    }
    if (drink.drinkGroupId == DrinkGroups.LONG_DRINK) {
      priceDiff = 2;
    }
    // Erstelle zwei Versionen des Getränks mit angepasstem Namen
    const drinkSmall = {
      ...drink,
      name: `${drink.name} 0.3L`,
      price: drink.price - priceDiff,
      oldPrice: drink.oldPrice - priceDiff,
      newPrice: drink.newPrice - priceDiff,
    };
    const drinkLarge = { ...drink, name: `${drink.name} 0.5L` };
    // Füge beide Versionen dem Ergebnisarray hinzu
    acc.push(drinkSmall, drinkLarge);
    return acc;
  }, []);
  return duplicatedDrinks;
}

const addDrink = (drink) => {
  // Check if both name and price are provided
  if (!drink.name || drink.price === undefined) {
    // You can throw an error or return a rejected promise
    // I'm returning a rejected promise to keep consistent with the async nature of this function
    return Promise.reject(
      new Error("The name and price of the drink must be provided.")
    );
  }

  const sql = "INSERT INTO drinks (name, price) VALUES (?, ?);";
  const params = [drink.name, drink.price];
  return databaseAccess
    .write(sql, params)
    .then((result) => {
      console.log("Added drink to database", result);
      return result;
    })
    .catch((err) => {
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
  const sql = "UPDATE drinks SET newPrice = ? WHERE id = ?;";
  const params = [newPrice, drinkId];
  return databaseAccess
    .write(sql, params)
    .then((result) => {
      // console.log('Updated drink price in database', result);
      return result;
    })
    .catch((err) => {
      // Handle errors such as duplicate names or database connection issues
      throw err;
    });
}

function setNewDrinkPrice() {
  const sql = "UPDATE drinks SET price = newPrice;";
  return databaseAccess
    .write(sql)
    .then((result) => {
      console.log("Updated drink price in database", result);
      return result;
    })
    .catch((err) => {
      // Handle errors such as duplicate names or database connection issues
      throw err;
    });
}

module.exports = {
  getDrinks,
  addDrink,
  getAllDrinksWithPricing,
  updateNewDrinkPrice,
  setNewDrinkPrice,
};
