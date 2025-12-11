const sqlite3 = require('sqlite3').verbose();
const fs = require('node:fs').promises;

//Connect to the database
//if database doesn't exist, it will be created
db = new sqlite3.Database('./calendar.db', (err) => {
  if (err)
    console.error(err.message);
  else
    console.log('Connected to the SQLite database.');
});

async function executeSetup() {
  let sqlSetup = await readFileContent();
  db.exec(sqlSetup, (err) => {
    if (err) {
      console.error("Error executing SQL setup:", err.message);
      return;
    }
    else
      console.log("Database setup completed successfully.");

    db.close((err) => {
      if (err)
        console.error(err.message);

      console.log('Close the database connection.');
    });
  });
}

// read the sql file content
async function readFileContent() {
  try {
    
    const data = await fs.readFile('./Calendar.sql', 'utf8');
    
    console.log("File content:");
    console.log(data);
    
    return data;

  } catch (err) {
    console.error("Error reading file:", err.message);
  }
}

executeSetup();
// 3. Close the connection when done