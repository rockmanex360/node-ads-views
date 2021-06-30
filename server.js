const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const main = require('./app/services/automate/node.main');

const app = express();

// create scheduler task every min
cron.schedule('0 */2 * * *', async function () {
    var dt = new Date();
    dt.setHours(dt.getHours() + 2);
    console.info(`next running is ${ new Date(dt).toLocaleString('id') }`);
    
    await main.main();
});

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({Message : "Is Running"});
});

app.get('/force', (req, res) => {
    main.main();
    res.json({Message: "Is Forced"});
})

require('./app/routes/node.routes')(app);

app.listen(process.env.PORT || 5000, () => {
    console.log("server is listening on port 5000");
})