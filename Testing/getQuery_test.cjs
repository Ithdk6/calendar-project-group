const { db } = require('../src/database/databaseAggregateFunctions.cjs');

async function getQuery_test(){
    try{
        const sql = "SELECT * from Users where username = ?";
        const addSql = "INSERT INTO users (username, email, pass) VALUES (?, ?, ?)";
        const params = ['testUser', 'testEmail@test.test', '1234512345'];
        await db.runQuery(addSql, params);

        const output = await db.getQuery(sql, 'testUser');
        
        //if output was not found then fail, otherwise check for correctness
        if (output && output.length > 0) {
            const user = output[0];
            if (user.username == "testUser" && 
                user.email === "testEmail@test.test" && 
                user.pass === "1234512345"){
            console.log("runQuery test passed!");
            process.exit(0);
            }
        } else {
            throw new Error("Record was not found via serch");
        }
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
}
getQuery_test();