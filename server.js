const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const nodeMain = require('./app/services/automate/node.main');

const app = express();

// create scheduler task every min
cron.schedule('0 0/5 * * *', function () {
    nodeMain();
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({"Message" : "Is Running"});
});

require('./app/routes/node.routes')(app);

app.listen(process.env.PORT || 5000, () => {
    console.log("server is listening on port 3000");
})