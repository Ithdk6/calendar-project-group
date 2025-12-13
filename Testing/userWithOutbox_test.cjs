const { db } = require('../src/database/databaseAggregateFunctions.cjs');

async function runQuery_test(){
    try{

        const output = await db.createUserWithOutbox('testUser', '1234512345', 'testEmail@test.test', 1);
        
        if (!output) {
            throw new Error("Aggregate function returned false/null");
        }
        
        //verify user
        const userCheck = await db.getQuery("SELECT * FROM users WHERE username = ?", ['testUser']);

        //verify outbox
        const outboxCheck = await db.getQuery("SELECT * FROM Outbox WHERE username = ?", ['testUser']);

        //if user ad outbox were both inserted and retrieved then it passed
        if (userCheck.length > 0 && outboxCheck.length > 0) {
            console.log("integration Test Passed: User and Outbox record created.");
            process.exit(0);
        } else {
            throw new Error(`Verification failed. User: ${userCheck.length}, Outbox: ${outboxCheck.length}`);
        }
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
}

runQuery_test();