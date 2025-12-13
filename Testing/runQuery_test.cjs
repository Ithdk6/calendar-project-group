const { Data } = require('../src/database/databaseAggregateFunctions.cjs');

async function runQuery_test(){
    try{
        const sql = "SELECT * from users where username = testUser";
        const addSql = "INSERT INTO users (username, email, pass) VALUES (?, ?, ?)";
        const params = ['testUser', 'testEmail@test.test', '1234512345'];
        await Data.runQuery(addSql, params);

        const output = await Data.db.run(sql);
        
        //if output was not found then fail, otherwise check for correctness
        if (output && output.length > 0) {
            if (output.username == "testUser" && 
                output.email === "testEmail@test.test" && 
                output.pass === "1234512345"){
            console.log("runQuery test passed!");
            process.exit(0);
            }
        } else {
            throw new Error("Record was not found after insertion.");
        }
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
}

runQuery_test();