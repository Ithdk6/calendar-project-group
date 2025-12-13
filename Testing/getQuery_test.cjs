const { db } = require('../src/database/databaseAggregateFunctions.ts');

async function getQuery_test(){
    try{
        const sql = "SELECT * from Users where username = ?";
        const addSql = "INSERT INTO Users (username, email, pass) VALUES (?, ?, ?)";
        const params = ['testUser', 'testEmail@test.test', '1234512345'];
        const pkg = await db.runQuery(addSql, params);

        const output = await db.getQuery(sql, ['testUser']);
        //if output was not found then fail, otherwise check for correctness
        if (output && output.username === "testUser" &&
            output.email === "testEmail@test.test" && output.pass === "1234512345") {
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