const sqlite3 = require('sqlite3').verbose();
const fs = require('fs').promises;

//Connect to the database
//if database doesn't exist, it will be created
db = new sqlite3.Database(process.env.DB_NAME || 'calendar', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

async function executeSetup() {
    sqlSetup = await readFileContent();
    await new Promise((resolve, reject) => {
    db.exec(sqlSetup, (err) => {
        if (err) {
            console.error("Error executing SQL setup:", err.message);
            reject(err);
        }
        else{
            console.log("Database setup completed successfully.");
            resolve();
        }
    });
    await new Promise((resolve, reject) =>{
        db.close((err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            else{
                console.log('Close the database connection.');
                resolve();
            }
        });
    });
}

// read the sql file content
async function readFileContent() {
    try {
        
        const data = await fs.readFile('Calendar.sql', 'utf8');
        
        console.log("File content:");
        console.log(data);
        
        return data;

    } catch (err) {
        console.error("Error reading file:", err.message);
    }
}
executeSetup();
// 3. Close the connection when done