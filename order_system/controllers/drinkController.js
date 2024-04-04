// controllers/drinkController.js

const drinkService = require("../services/drinkService");

const getAllDrinks = (req, res) => {
  drinkService
    .getDrinks()
    .then((drinks) => {
      res.json(drinks);
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
};

const addDrink = (req, res) => {
  const drink = req.body;
  if (drink) {
    drinkService
      .addDrink(drink)
      .then((drink) => {
        res.json(drink);
      })
      .catch((err) => {
        res.status(500).json({ message: err.message });
      });
  } else {
    res.status(400).json({ message: "Drink is required" });
  }
};

const getDrinkById = (req, res) => {
  const drinkId = req.params.id;
  if (drinkId) {
    // res.send(`GET drink by ID: ${drinkId}`);
    res.json({ message: `GET drink by ID: ${drinkId}` });
  } else {
    res.status(400).json({ message: "Drink ID is required" });
  }
};

module.exports = { getAllDrinks, getDrinkById, addDrink };
