import { db } from '../src/database/databaseAggregateFunctions.ts';

async function test_schema() {
    const sql = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';";
    console.log(db);
    try {
        // Use 'all' or 'getQuery' because we expect a list of names
        const tables: any = await new Promise((resolve, reject) => {
            db.db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });

        console.log("Tables found in database:");
        console.table(tables);

        // Verification logic
        const tableNames = tables.map(row => row.name);
        if (tableNames.includes('Users') && tableNames.includes('Outbox')) {
            console.log("Schema verification passed!");
        } else {
            console.error("Schema verification failed. Missing tables.");
            process.exit(1);
        }

    } catch (error: any) {
        console.error("Error checking schema:", error.message);
        process.exit(1);
    }
}
test_schema();