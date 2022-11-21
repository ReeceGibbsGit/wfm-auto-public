"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// flow to complete the entry of a timesheet item in workflow max
const puppeteer = __importStar(require("puppeteer"));
exports.default = async (email, password, date, job, task, time, notes) => {
    // loading the browser and opening a new page
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    // navigating to wfm
    await page.goto("https://my.workflowmax.com");
    console.log("Initial page load successful");
    // get the email element and enter the email address
    await page.type("[name=Code]", email, { delay: 100 });
    await page.click("[name=Login]");
    // wait for the page to load
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.waitForSelector("[name=Password", { visible: true, timeout: 0 });
    // enter the password
    await page.type("[name=Password]", password, { delay: 100 });
    await page.click("[name=button]");
    // wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log("Login successful");
    // navigate to your target date to enter the timesheet
    await page.goto(`https://app.my.workflowmax.com/my/timesheet.aspx?filter=&date=${date}&tab=daily`);
    // wait to make sure the form is ready for input
    const saveButtonSelector = "[name='ctl00$PageContent$btn0']";
    await page.waitForSelector(saveButtonSelector);
    console.log("Timesheet loaded");
    // select the our timesheet entries based on the user's input
    const selectJob = await page.$("select[name='ctl00$PageContent$ctlxlayoutJob']");
    const selectTask = await page.$("select[name='ctl00$PageContent$ctlxlayoutTask']");
    const timeInput = await page.$("[name='ctl00$PageContent$ctlxlayoutTime']");
    const notesInput = await page.$("[name='ctl00$PageContent$ctlxlayoutNotes']");
    await selectJob?.type(job);
    await selectTask?.type(task);
    await timeInput?.click({ clickCount: 3 });
    await timeInput?.type(time, { delay: 100 });
    await notesInput?.type(notes, { delay: 100 });
    console.log("Data entry complete");
    // save our changes
    await page.click(saveButtonSelector);
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log("Timesheet entry saved");
    // checking our entry made it to the table
    const tableData = await page.evaluate(() => {
        const tds = Array.from(document.querySelectorAll("[class=HtmlGrid] tr td"));
        return tds.map(td => td.innerHTML);
    });
    // if our entry is not in the table, we return a failure
    if (!tableData.includes(notes)) {
        return false;
    }
    // closing the browser
    await browser.close();
    return true;
};
