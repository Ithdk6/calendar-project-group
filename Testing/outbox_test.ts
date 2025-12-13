import { db } from '../src/database/databaseAggregateFunctions.ts';

async function Outbox_Test(){
    try {
        const commandID = 1;
        const date = new Date();
        
        await db.addOutbox("test_user", commandID, "test_pass", String(date));
        
        const sql = "SELECT * FROM Outbox WHERE AggregateId = ?";
        const output = await db.getQuery(sql, [commandID]);

        if (!output) {
            throw new Error("Verification failed: Record not found");
        }

        console.log("Outbox test passed!");
        process.exit(0);
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
}

Outbox_Test();