"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// class used to take user input
const readline_1 = require("readline");
class ConsoleReader {
    readLine;
    constructor() {
        this.readLine = (0, readline_1.createInterface)({
            input: process.stdin,
            output: process.stdout
        });
    }
    // function to close the reader
    close() {
        this.readLine.close();
    }
    // function to take in user input
    async read(prompt) {
        return new Promise(resolve => this.readLine.question(prompt, resolve));
    }
}
exports.default = ConsoleReader;
