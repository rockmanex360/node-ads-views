const puppeteer = require('puppeteer');

const login = require('../login/node.login.js');
const logger = require('../../common/Logger');

const desc_url = [
    "https://rajaview.id/myaccount/lihat-iklan.php?page=10",
    "https://rajaview.id/myaccount/lihat-iklan.php?page=9",
    "https://rajaview.id/myaccount/lihat-iklan.php?page=8",
    "https://rajaview.id/myaccount/lihat-iklan.php?page=7",
    "https://rajaview.id/myaccount/lihat-iklan.php?page=6",
    "https://rajaview.id/myaccount/lihat-iklan.php?page=5",
    "https://rajaview.id/myaccount/lihat-iklan.php?page=4",
    "https://rajaview.id/myaccount/lihat-iklan.php?page=3",
    "https://rajaview.id/myaccount/lihat-iklan.php?page=2",
    "https://rajaview.id/myaccount/lihat-iklan.php"
];

const asc_url = [
    "https://rajaview.id/myaccount/lihat-iklan.php",
    "https://rajaview.id/myaccount/lihat-iklan.php?page=2",
    "https://rajaview.id/myaccount/lihat-iklan.php?page=3",
    "https://rajaview.id/myaccount/lihat-iklan.php?page=4",
    "https://rajaview.id/myaccount/lihat-iklan.php?page=5",
    "https://rajaview.id/myaccount/lihat-iklan.php?page=6",
    "https://rajaview.id/myaccount/lihat-iklan.php?page=7",
    "https://rajaview.id/myaccount/lihat-iklan.php?page=8",
    "https://rajaview.id/myaccount/lihat-iklan.php?page=9",
    "https://rajaview.id/myaccount/lihat-iklan.php?page=10"
];

const excludeUrl = [];

async function main() {
    console.log("Bot is running");

    let currentTime = parseInt(new Date().toLocaleDateString('id', {hour: 'numeric'}));
    let arr = currentTime >= 6 ? asc_url : desc_url;

    loginBrowser = await login.login();
    var browser = await puppeteer.connect({
        browserWSEndpoint : loginBrowser
    });

    console.log("Login Success");

    try
    {
        var page = (await browser.pages())[0];
        await page.setDefaultNavigationTimeout(0);
        
        for (let urlIndex = 0; urlIndex < arr.length; urlIndex++) {
            console.log(`accessing page ${ arr[urlIndex] }`);

            await page.goto(arr[urlIndex], {
                waitUntil: 'networkidle2'
            });
            
            var counter = 0;
            var errorCount = 0;

            while (true) {
                var ads = await page.$$('.col-lg-3');
                if (ads.length == 0)
                    break;
                
                var error_page = [];
                for (const [i, element] of ads.entries()) {
                    var disable = await element.$(`#idloadvideorefresh > div > div:nth-child(${ i + 1 }) > div > img:nth-child(1)`);

                    if (i == ads.length - 1)
                        counter += 1;

                    if (disable != null)
                    {
                        console.log("Ads is not available");
                        continue;
                    }
                    
                    var exclude = await element.$eval(`#idloadvideorefresh > div > div:nth-child(${ i + 1 }) > div > p.card-text.pt-3.pl-3.pr-3 > a`, 
                        item => item.innerHTML);

                    var condition = 0;
                    for (const excludeItem of excludeUrl) {
                        if (excludeItem.includes(exclude))
                            condition += 1;
                    }
                    
                    if (condition > 0)
                        continue;
                    
                    if (errorCount > 2)
                    {
                        excludeUrl.push(exclude);
                        errorCount = 0;
                        break;
                    }
                    
                    var popupPagePromise = new Promise(resolve => browser.once('targetcreated', target => resolve(target.page())));
                    await element.click();

                    // var popupPage = (await browser.pages())[1];
                    var popupPage = await popupPagePromise;

                    console.info("ads has been clicked");
                    
                    let multiAds = await popupPage.$('body > div.container-fluid.px-0 > div > div:nth-child(2) > div > div.col-md-4.col-sm-12.text-center.border.p-4 > form > p:nth-child(2) > button');
                    if (multiAds != null){
                        await multiAds.click();
                        logger.log("Multiple ads has been clicked");
                    }
                    // if ads present change counter into 0
                    counter = 0;

                    try {
                        await popupPage.waitForSelector('#idbtn_play_video');
                    }catch(e){
                        console.error(e);
                        errorCount++;
                        await popupPage.close();
                        break;
                    }
                    
                    var timeout = await popupPage.$eval('#idspan_countdown', element => { 
                        return element.innerHTML.replace(" detik", "");
                    });
                    
                    console.info(`please wait ${ timeout }`);
                    // await popupPage.waitFor(3000);
                    setTimeout(async () => {
                        await popupPage.click('#idbtn_play_video');
                    }, 3000);

                    // await popupPage.waitFor(parseInt(timeout) + 5000);
                    await popupPage.waitForNavigation({ 
                        waitUntil: 'networkidle2', 
                        timeout: (parseInt(timeout) + 60) * 1000
                    }).catch(async err => {
                        console.error(err);
                        errorCount++;
                    });

                    if (popupPage.url().includes('youtube')){
                        console.info("youtube redirect has opened");
                        await popupPage.close();
                        break;
                    }else {
                        console.info("page is being freeze");
                        await popupPage.close();
                        break;
                    }
                }

                if (counter > 2)
                    break;

                logger.log("main page is refreshed");
                await page.reload(arr); 
            };
        }

        logger.log('the page already reached the end');
        await page.close();
    }catch (err)
    {
        console.log(err);
        await browser.close();
        main();
    }
};

module.exports = { main };