import { db } from '../src/database/databaseAggregateFunctions.ts';

async function runQuery_test(){
    try{ 
        const sql = "SELECT * from Users where username = testUser";
        const addSql = "INSERT INTO users (username, email, pass) VALUES (?, ?, ?)";
        const params = ['testUser', 'testEmail@test.test', '1234512345'];
        await db.runQuery(addSql, params);

        const row: any = await new Promise((resolve, reject) => {
            const sql = "SELECT * FROM Users WHERE username = ?";
            //get the inserted data
            db.db.get(sql, ['testUser'], (error, result) => {
                if (error) reject(error);
                else{ 
                    resolve(result);
                }
            });
        });
        

        //Verifications
        if (row && row.pass === '1234512345' && 
            row.email === 'testEmail@test.test') {
            console.log("row found:", row);
            console.log("Test passed!");
            process.exit(0);
        } else {
            throw new Error("Record not found via raw driver.");
        }
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
}

runQuery_test();