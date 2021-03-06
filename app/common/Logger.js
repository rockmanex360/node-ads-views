const fs = require('fs');
const path = "log.json";

class Logger {
    constructor() {
        this.logs = [];
    }

    get count() {
        return this.logs.length;
    }

    log(message) {
        let date = new Date();
        date.setHours(date.getHours() + 7);
        let timestamp = date.toISOString().toLocaleString("id-ID");

        fs.appendFile(path, `[${timestamp}] ${message} \n`, (err) => {
            if (err)
                console.error("Failed to write file");
        });

        console.log(`[${timestamp}] - ${message}`);
    }
}

module.exports = new Logger();