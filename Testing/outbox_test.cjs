const { Data } = require('../src/database/databaseAggregateFunctions.cjs');

async function outbox_test(){
    try {
        const commandID = crypto.randomUUID();
        const date = new Date();
        
        await Data.addOutbox("test_user", commandID, "test_pass", date);
        
        const sql = "SELECT * FROM Outbox WHERE AggregateId = ?";
        const output = await Data.getQuery(sql, [commandID]);

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

outbox_test();