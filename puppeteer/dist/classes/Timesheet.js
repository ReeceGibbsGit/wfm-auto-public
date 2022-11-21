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
// our timesheet class
const puppeteer = __importStar(require("puppeteer"));
class Timesheet {
    wfmUrl;
    email;
    password;
    date;
    time;
    job;
    task;
    notes;
    constructor(wfmUrl, email, password, date, time, job, task, notes) {
        this.wfmUrl = wfmUrl;
        this.email = email;
        this.password = password;
        this.date = date;
        this.time = time;
        this.job = job;
        this.task = task;
        this.notes = notes;
    }
    async captureTime() {
        // loading the browser and opening a new page
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36");
        try {
            // navigating to wfm
            await page.goto(this.wfmUrl);
            console.log("Initial page load successful");
            const emailInput = await page.$("[name=Code]");
            await emailInput?.type(this.email, { delay: 100 });
            const firstLoginButton = await page.$("[name=Login]");
            await Promise.all([
                page.waitForNavigation(),
                firstLoginButton?.click({ delay: 1000 })
            ]);
            const passwordSelector = "[name=Password]";
            const passwordInput = await page.waitForSelector(passwordSelector, { visible: true });
            for (let x = 0; x < 2; x++) {
                await passwordInput?.click({ clickCount: 3 });
                await passwordInput?.type(this.password, { delay: 100 });
            }
            const secondLoginButton = await page.$("[name=button]");
            await Promise.all([
                page.waitForNavigation(),
                secondLoginButton?.click({ delay: 1000 })
            ]);
            await page.waitForXPath("//*[@title='Enter Time']");
            console.log("Login successful");
            // navigate to your target date to enter the timesheet
            await page.goto(`https://app.my.workflowmax.com/my/timesheet.aspx?filter=&date=${this.date}&tab=daily`);
            // wait to make sure the form is ready for input
            const saveButton = await page.waitForSelector("[name='ctl00$PageContent$btn0']", { visible: true, timeout: 0 });
            console.log("Timesheet loaded");
            // select the our timesheet entries based on the user's input
            const selectJob = await page.$("select[name='ctl00$PageContent$ctlxlayoutJob']");
            const selectTask = await page.$("select[name='ctl00$PageContent$ctlxlayoutTask']");
            const timeInput = await page.$("[name='ctl00$PageContent$ctlxlayoutTime']");
            const notesInput = await page.$("[name='ctl00$PageContent$ctlxlayoutNotes']");
            await selectJob?.type(this.job);
            await selectTask?.type(this.task);
            await timeInput?.click({ clickCount: 3 });
            await timeInput?.type(this.time, { delay: 100 });
            await notesInput?.type(this.notes, { delay: 100 });
            console.log("Data entry complete");
            // save our changes
            await Promise.all([
                page.waitForNavigation(),
                saveButton?.click({ delay: 1000 })
            ]);
            console.log("Timesheet entry saved");
            // checking our entry made it to the table
            const tableData = await page.evaluate(() => {
                const tds = Array.from(document.querySelectorAll("[class=HtmlGrid] tr td"));
                return tds.map(td => td.innerHTML);
            });
            // if our entry is not in the table, we return a failure
            if (!tableData.includes(this.notes)) {
                return false;
            }
            console.log("Timesheet entry confirmed");
        }
        catch {
            return false;
        }
        finally {
            await browser.close();
            return true;
        }
    }
}
exports.default = Timesheet;
