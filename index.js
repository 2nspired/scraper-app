import Express, { response } from 'express';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

const port = 4000;
const app = Express();

// INSERT URL HERE
const url = 'https://hnldoc.ehawaii.gov/hnldoc/browse/bills';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.screenshot({ path: 'image.png'});
    const pageData = await page.evaluate(() => {
        return { 
        html: document.documentElement.innerHTML,
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
        };
    });
// console.log(pageData);

const bills = []
const $ = cheerio.load(pageData.html);
// console.log($('tbody tr td').find('a').attr('href'));
$('tbody tr').each(function() {
    let title = $(this).find('a').text();
    let url = $(this).find('a').attr('href');
    let shortDesc = $(this).find('.fileDesc').text();
    let introducer = $(this).find('.type').text();
    let dateIntroduced = $(this).find('.date').text();
    bills.push({
        title,
        url,
        shortDesc,
        introducer,
        dateIntroduced,
    })
});

console.log('----- returning -----')
console.log(bills);

await browser.close();
})().catch(err => console.log(err))


app.listen(4000, () => {console.log(`Server is running on port ${port}`)});


