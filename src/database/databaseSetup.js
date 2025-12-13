const sqlite3 = require('sqlite3').verbose();
const fs = require('fs').promises;

//Connect to the database
//if database doesn't exist, it will be created


async function executeSetup() {
    try{
        const sqlSetup = await readFileContent();
        const dbPath = process.env.DB_NAME || 'calendar';

        const db = await new Promise((resolve, reject) => {
            const connection = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error("Connection error:", err.message);
                    return reject(err);
                }
                console.log(`Connected to the SQLite database at: ${dbPath}`);
                resolve(connection);
            });
        });

        await new Promise((resolve, reject) => {
            db.exec(sqlSetup, (err) => {
                if (err) {
                    console.error("Error executing SQL setup:", err.message);
                    return reject(err);
                }
                else{
                    console.log("Database setup completed successfully.");
                    resolve();
                }
            });
        });
        await new Promise((resolve, reject) =>{
            db.close((err) => {
               if (err) {
                   console.error(err.message);
                   return reject(err);
                }
               else{
                   console.log('Close the database connection.');
                   resolve();
               }
            });
        });
    }
    catch (error) {
        console.error("Setup failed:", error);
        process.exit(1);
    }
}

// read the sql file content
async function readFileContent() {
    try {
        
        const data = await fs.readFile('../Calendar.sql', 'utf8');
        
        console.log("File content:");
        console.log(data);
        
        return data;

    } catch (err) {
        console.error("Error reading file:", err.message);
    }
}
executeSetup();
// 3. Close the connection when done