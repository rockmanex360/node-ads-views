module.exports = (app) => {
    const myApps = require('../controllers/node.controller.js');

    app.post('/execute', myApps.execute);
};