import axios, {isCancel, AxiosError} from 'axios';
import * as cheerio from 'cheerio';
import Express, { response } from 'express';
import puppeteer from 'puppeteer';

const port = 4000;
const app = Express();

// INSERT URL HERE
const url = 'https://hnldoc.ehawaii.gov/hnldoc/browse/bills';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://hnldoc.ehawaii.gov/hnldoc/browse/bills');
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
$('#results .table tbody tr td').each(() => {
    title = $(this).find('a').text();
    url = $(this).find('a').attr('href');
    shortDesc = $(this).find('.fileDesc').text();
    bills.push({
        title,
        url,
        shortDesc
    })
});

console.log(bills);



await browser.close();
})().catch(err => console.log(err))


app.listen(4000, () => {console.log(`Server is running on port ${port}`)});


// axios(url)
//     .then(response => {
//         const html = response.data;
//         // console.log(html);
//         const bills =[];
//         const $ = cheerio.load(html);
//         console.log($('.results', html));
//         $('.table-responsive', html).each(function() {
//             // const title = $(this).find('a').text();
//             // const url = $(this).find('a').attr('href');
//             // const desc = $(this).find('.fileDesc').text();
//             bills.push({
//                 // title,
//                 // url,
//                 // desc,
//             })
//     })
//     console.log(bills);
    
// }).catch(err => console.log(err))

    // class .odd .even .fileDesc or <a> tag


