const puppeteer = require('puppeteer');
const fs = require('fs');

const nodeMain = require('../automate/node.main');

let cookieFilePath = 'cookie.json';

async function login() {
    const browser = await puppeteer.launch({
        headless: false,
        args : [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    try {
        const page = (await browser.pages())[0];
        
        await page.setDefaultNavigationTimeout(0);

        page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36')

        await page.goto('https://rajaview.id/myaccount/', {
            waitUntil: 'networkidle2'
        });
        
        /*const previousSession = fs.existsSync(cookieFilePath)
        const cookiesString = fs.readFileSync(cookieFilePath);

        if (previousSession && cookiesString.byteLength !== 0)
        {
            const parsedCookies = JSON.parse(cookiesString);

            if (parsedCookies.length !== 0) {
                for (let cookie of parsedCookies) {
                    await page.setCookie(cookie)
                }
                console.log('Session has been loaded in the browser');
    
                const browserWS = browser.wsEndpoint();
                browser.disconnect();
                return browserWS;
            }
        }*/
        await page.type('input[name="txtemail"]', '<your email>', { delay : 200 });
        await page.type('input[name="txtpwd"]', '<your password>', { delay: 200 });

        
        const loginButton = page.$('input[name="kirim"]');
        (await loginButton).click();

        await page.waitForNavigation({
            waitUntil: 'networkidle0'
        });

        // const cookieObject = await page.cookies();
        // saveCookie(cookieObject);

        const browserWS = browser.wsEndpoint();
        browser.disconnect();
        return browserWS;
    } catch (e) {
        console.log("There's some error occurs", e);
        await browser.close();
        nodeMain.main();
    }
};

module.exports = { login };
