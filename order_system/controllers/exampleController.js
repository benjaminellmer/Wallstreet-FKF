const service = require('../services/exampleService');

const getExample = (req, res) => {
    const data = service.getExampleData();
    res.json(data);
};

module.exports = {
    getExample
};
