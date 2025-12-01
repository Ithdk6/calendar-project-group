const sqlite3 = require('sqlite3').verbose();

// 1. Connect to the database
// If 'my-database.db' doesn't exist, it will be created automatically.
db = new sqlite3.Database('./calendar.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// 2. Perform Database Operations
// serialize function makes these run one after another
db.serialize(() => {

  // Create a table named 'users'
  db.run(`DROP table if EXISTS Users;`);
  db.run(`
CREATE TABLE Users(
  Uid INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(255) NOT NULL,
  pass VARCHAR(255) NOT NULL);`
  );
  db.run(`DROP table if EXISTS Groups;`);
  db.run(`

CREATE TABLE Groups(
  Gid INTEGER PRIMARY KEY AUTOINCREMENT,
  Gname VARCHAR(255) NOT NULL
);`
  );
db.run(`
CREATE Table Included(
  UserID INTEGER,
  GroupID INTEGER,
  PRIMARY key (UserID, GroupID)
);`
  );

  db.run(`DROP table if EXISTS Calendar;`);
  db.run(`
CREATE TABLE Calendar(
  Cid INTEGER PRIMARY KEY AUTOINCREMENT,
  Cname VARCHAR(255) NOT NULL
);`);

});

// 3. Close the connection when done
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Close the database connection.');
});