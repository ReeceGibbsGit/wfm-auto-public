// our timesheet class
import * as puppeteer from "puppeteer";

class Timesheet {
    private wfmUrl: string;
    private email: string;
    private password: string;
    private date: string;
    private time: string;
    private job: string;
    private task: string;
    private notes: string;

    public constructor(
        wfmUrl: string,
        email: string,
        password: string,
        date: string,
        time: string,
        job: string,
        task: string,
        notes: string
    ) {
        this.wfmUrl = wfmUrl;
        this.email = email;
        this.password = password;
        this.date = date;
        this.time = time;
        this.job = job;
        this.task = task;
        this.notes = notes;
    }

    public async captureTime(): Promise<boolean> {
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
            ])
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

export default Timesheet;