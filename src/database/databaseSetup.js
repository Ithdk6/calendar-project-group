const sqlite3 = require('sqlite3').verbose();
const fs = require('fs').promises;
const path = require('path');

//Connect to the database
//if database doesn't exist, it will be created


async function executeSetup() {
    try{
        const sqlSetup = await readFileContent();

        if (!sqlSetup) {
            throw new Error("SQL setup string is empty or undefined.");
        }

        const dbPath = process.env.DB_NAME || 'testdb.db';

        //connect to database or create new
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

        await new Promise((resolve, reject) => {
            db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
            if (err) return reject(err);
                console.log("Tables actually created:", rows);
                resolve();
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
    const filePath = path.resolve(__dirname, 'Calendar.sql');
    try {
        const data = await fs.readFile(filePath, 'utf8');
        
        console.log("File content:");
        console.log(data);
        
        return data;

    } catch (err) {
        console.error("Error reading file:", err.message);
        throw new Error(`Cant find Calendar.sql at ${filePath}`);
    }
}
executeSetup();