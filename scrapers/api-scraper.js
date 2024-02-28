import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

console.log("--------------->   LOGGED:", Date());

// PULLING A LIST FROM AN API, THEN SCRAPING THE DATA FROM THE LIST VIA LIST DETAIL PAGES

// LIST API URL
const apiURL = "https://hnldoc.ehawaii.gov/hnldoc/browse/bills.json";
const listOfBills = [];

// GET LIST OF BILLS, THEN ADD A CONSTRUCTED URL WITHIN EACH BILL OBJECT TO THE BILL DETAIL PAGE

async function getBillList() {
  try {
    const response = await fetch(apiURL, {
      headers: {
        "content-type": "application/json",
      },
      body: '{"year":2024,"pagination":{"page":-1,"sortDirection":"asc","sort":"number"}}',
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    // console.log('number of bills:', data.results.length);
    data.results.forEach((bill) => {
      listOfBills.push(bill);
    });
    listOfBills.forEach((bill) => {
      const billURL = `https://hnldoc.ehawaii.gov/hnldoc/measure/browse/${bill.id}`;
      bill.billURL = billURL;
      // console.log('billURL:', billURL);
      // console.log(listOfBills);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}
await getBillList();
// console.log('listOfBills:', listOfBills);

// console.log('listOfBills:', listOfBills[0]);

// MOCK DATA
const mockBill = [
  {
    dateIntroduced: 1708596000000,
    id: 2857,
    introducers: "TOMMY  WATERS - By Request",
    number: 10,
    title: "RELATING TO BUILDING PERMITS.",
    type: "BILL",
    year: 2024,
    displayNumber: "BILL010(24)",
    formattedNumber: "010",
    dateIntroducedStr: "Feb 22, 2024",
    billURL: "https://hnldoc.ehawaii.gov/hnldoc/measure/browse/2857",
  },
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  //CHANGE back to listOfBills after testing
  for (let i = 0; i < mockBill.length; i++) {
    await page.goto(mockBill[i].billURL);
    // await page.goto('https://hnldoc.ehawaii.gov/hnldoc/measure/browse/2795');
    const pageData = await page.evaluate(() => {
      return {
        html: document.documentElement.innerHTML,
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      };
    });
    // console.log('html:', pageData.html)
    const $ = cheerio.load(pageData.html);
    const statusChanges = [];
    const $billStatusSelector = "#eventTables_wrapper tbody tr";
    console.log("billStatusSelector:", $($billStatusSelector.html()));
    const $changeDateSelector = $("td:eq(0)");
    const $changeTypeSelector = $("td:eq(1)");
    const $changeDescSelector = $("td:eq(2)");
    $($billStatusSelector).each(function (i, element) {
      const statusChange = {};
      (function addChange() {
        $changeDateSelector.each(function (i, element) {
          statusChange.date = $(this).text().trim();
        });
        $changeTypeSelector.each(function (i, element) {
          statusChange.type = $(this).text().trim();
        });
        $changeDescSelector.each(function (i, element) {
          statusChange.desc = $(this).text().trim();
        });
        statusChanges.push(statusChange);
        console.log("statusChange:", statusChange);
      })();
    });
    console.log("statusChanges:", statusChanges[i]);
    // CHANGE BACK TO listOfBills after testing
    mockBill[i].statusChanges = statusChanges;
  }
  console.log("----- returning -----");
  console.log(mockBill);
  // console.log(listOfBills);

  await browser.close();
})().catch((err) => console.log(err));

// async function getBillData() {
// await getBillList();
// console.log('listOfBills:', listOfBills);
// listOfBills.forEach((bill) => {
//     console.log('billURL:', bill.billURL);
//   })
// }

// NOTES: WHERE I ENDED - I AM STRYING TO CREATE MULTIPLE BILL CHANGE OBJECTS WITHIN BILL CHANGES ARRAY IN THE MAIN BILL OBJECT. RIGHT NOW IT'S NOT RUNNING THROUGH EACH <TR> TAG, MEANING IT IS ONLY CREATING ONE OBJECT. I need it to create one for each change.

// date: $(this).find($statusChangeDate).text().trim(),
// type: $(this).find($statusChangeType).text().trim(),
// desc: $(this).find($statusChangeDesc).text().trim(),

// $(this).find($changeDateSelector).each(function(i, element) {
//     statusChange.date = $(this).text().trim();
// });
// $(this).find($changeTypeSelector).each(function(i, element) {
//     statusChange.type = $(this).text().trim();
// });
// $(this).find($changeDescSelector).each(function(i, element) {
//     statusChange.desc = $(this).text().trim();
// });
