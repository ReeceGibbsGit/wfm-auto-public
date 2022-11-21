"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// simple script to insert an item into your wfm timesheet
const ConsoleReader_1 = __importDefault(require("./classes/ConsoleReader"));
const Timesheet_1 = __importDefault(require("./classes/Timesheet"));
const constants_1 = __importDefault(require("./constants/constants"));
const main = async () => {
    // gathering user input for timesheet entry
    const consoleReader = new ConsoleReader_1.default();
    const dateRegex = /^((20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01]))$/;
    const timeRegex = /^([0-9])$/;
    let email = process.env["WFM_EMAIL"] ?? "";
    let password = process.env["WFM_PASSWORD"] ?? "";
    let date;
    let time;
    let job;
    let task;
    let notes;
    while (true) {
        // getting email address and password for login
        if (email != "") {
            console.log(`WFM Email Address: ${email}`);
        }
        else {
            email = (await consoleReader.read("WFM Email Address: ")).trim();
        }
        if (password != "") {
            console.log(`WFM Password: ${password}`);
        }
        else {
            password = (await consoleReader.read("WFM Password: ")).trim();
        }
        const isCredentialsConfirmed = (await consoleReader.read("Confirm credentials (y/n): ")).trim().toLowerCase();
        if (isCredentialsConfirmed == 'y') {
            break;
        }
        email = password = "";
    }
    console.log(email);
    console.log(password);
    while (true) {
        // getting the details for our timesheet entry
        while (true) {
            date = (await consoleReader.read("Date (yyyyMMdd): ")).trim();
            if (dateRegex.test(date)) {
                break;
            }
            console.log("Invalid date format");
        }
        while (true) {
            time = (await consoleReader.read("Time (hours): ")).trim();
            if (timeRegex.test(time)) {
                break;
            }
            console.log("Invalid time format");
        }
        job = (await consoleReader.read("Job: ")).trim();
        task = (await consoleReader.read("Task: ")).trim();
        notes = (await consoleReader.read("Notes: ")).trim();
        const isDetailsConfirmed = (await consoleReader.read("Confirm details (y/n): ")).trim().toLowerCase();
        if (isDetailsConfirmed == 'y') {
            break;
        }
    }
    consoleReader.close();
    // logging our timesheet entry
    const timesheet = new Timesheet_1.default(constants_1.default.wfmUrl, email, password, date, time, job, task, notes);
    const isTimesheetEntrySuccessful = await timesheet.captureTime();
    if (!isTimesheetEntrySuccessful) {
        console.log("Timesheet entry failed");
        return;
    }
    console.log("Timesheet entry complete");
};
main();
