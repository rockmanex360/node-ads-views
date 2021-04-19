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
        const timestamp = new Date().toISOString();

        this.logs.push(`${timestamp} - ${message}`);
        fs.appendFile(path, `${timestamp} - ${message} \n`, (err) => {
            if (err)
                console.error("Failed to write file");
        });

        console.log(`${timestamp} - ${message}`);
    }
}

module.exports = new Logger();