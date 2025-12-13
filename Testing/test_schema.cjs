const { db } = require('src/dbbase/databaseAggregateFunctions.cjs');

async function getQuery_test(){
    const sql = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';";
        
        // Use 'all' or 'getQuery' because we expect a list of names
        const tables = await new Promise((resolve, reject) => {
            db.db.all(sql, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        console.log("Tables found in database:");
        console.table(tables);

        // Verification logic
        const tableNames = tables.map(row => row.name);
        if (tableNames.includes('users') && tableNames.includes('Outbox')) {
            console.log("✅ Schema verification passed!");
        } else {
            console.error("❌ Schema verification failed. Missing tables.");
            process.exit(1);
        }

    } catch (err) {
        console.error("Error checking schema:", err.message);
        process.exit(1);
    }
}
getQuery_test();