const { db } = require('../src/database/databaseAggregateFunctions.ts');

async function schema_test(){
    try {
        const commandID = crypto.randomUUID();
        const date = new Date();
        
        await db.addOutbox("test_user", commandID, "test_pass", date);
        
        const sql = "SELECT * FROM Outbox WHERE AggregateId = ?";
        const output = await db.getQuery(sql, [commandID]);

        if (!output || output.length === 0) {
            throw new Error("Verification failed: Record not found");
        }

        console.log("Outbox test passed!");
        process.exit(0);
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
}

schema_test();