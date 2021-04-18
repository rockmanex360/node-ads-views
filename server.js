const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const nodeLogin = require('./app/services/login/node.login');

const app = express();

// create scheduler task every min
cron.schedule('0 */6 * * *', function () {
    nodeLogin();
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({"Message" : "Is Running"});
});

require('./app/routes/node.routes')(app);

app.listen(3000, () => {
    console.log("server is listening on port 3000");
})