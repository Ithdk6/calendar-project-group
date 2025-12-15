import { db } from '../src/database/databaseAggregateFunctions.ts';
/**
 * Generates a random string.
 * @param {number} length - length of string
 * @param {string} chars - Optional set of characters to use.
 * @returns {string} Randomly generated string.
 */
function generateRandomString(length: number, chars: string) {
    // Input validation
    if (typeof length !== 'number' || length <= 0) {
        throw new Error("Length must be a positive number.");
    }
    if (!chars) {
        // Default: alphanumeric (uppercase + lowercase + digits)
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    }
    if (typeof chars !== 'string' || chars.length === 0) {
        throw new Error("Character set must be a non-empty string.");
    }

    let result = '';
    const charsLength = chars.length;

    // Generate random string
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charsLength);
        result += chars.charAt(randomIndex);
    }
    return result;
}

async function getQuery_test() {
    try {
        const sql = "SELECT * from Users where username = ?";
        const addSql = "INSERT INTO Users (username, email, pass) VALUES (?, ?, ?)";
        const TDDTestString = generateRandomString(10, "");
        const TDDTestPass = generateRandomString(20, "");
        const params = [TDDTestString, `${TDDTestString}@test.test`, TDDTestPass];
        const pkg = await db.runQuery(addSql, params);

        const output = await db.getQuery(sql, [TDDTestString]);
        //if output was not found then fail, otherwise check for correctness
        if (output && output.username === TDDTestString &&
            output.email === `${TDDTestString}@test.test` && output.pass === TDDTestPass) {
            console.log("getQuery test passed!");
            process.exit(0);
        } else {
            throw new Error("Record was not found via serch");
        }
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
}
getQuery_test();