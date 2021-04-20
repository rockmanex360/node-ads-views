const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const nodeMain = require('./app/services/automate/node.main');

const app = express();

// create scheduler task every min
cron.schedule('0 0/4 * * *', async function () {
    var dt = new Date();
    dt.setHours(dt.getHours() + 4);
    await nodeMain();
    console.info(`next running is ${ new Date(dt).toLocaleString('id') }`);
});

cron.schedule('*/20 * * * *', async function () {
    console.info("Refresh 20 min");
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({"Message" : "Is Running"});
});

require('./app/routes/node.routes')(app);

app.listen(process.env.PORT || 5000, () => {
    console.log("server is listening on port 5000");
})