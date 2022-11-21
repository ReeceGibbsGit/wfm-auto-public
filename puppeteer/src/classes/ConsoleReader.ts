// class used to take user input
import { Interface, createInterface } from "readline";

class ConsoleReader {
    private readLine: Interface;

    public constructor() {
        this.readLine = createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    
    // function to close the reader
    public close() {
        this.readLine.close();
    }

    // function to take in user input
    public async read(prompt: string): Promise<string> {
        return new Promise<string>(resolve => this.readLine.question(prompt, resolve));
    }

}

export default ConsoleReader;