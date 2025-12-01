const readline = require('readline');
const sqlite3 = require('sqlite3').verbose();

class databaseClass {

    constructor(Dname) {
        this.db = new sqlite3.Database(`./${Dname}.db`, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the SQLite database.');
        });
    }

    //waiting for the db to run a query to continue execution
    runQuery(sql, params = []){
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err){
                if (err){
                    console.error(err.message);
                    console.log("Error running sql: " + sql);
                    console.log(err);
                    reject(err);
                }
                else{
                    resolve({id: this.lastID});
                }
            });
        });
    }

    async addUser(name, pass) {
        // Insert a new user into the Users table
        const sql = "INSERT INTO Users (username, pass) VALUES (?, ?)";
        try{
            const result = await this.runQuery(sql, [name, pass]);
        
            console.log(`User ${name} added.`);
            console.log(`The User ID is ${result.id}`);
        
            return result.id;
        }
        catch (err){
            console.error("Error adding User:", err);
        }
    }

    async addGroup(name, userID){
        const sqlGroup = "INSERT INTO Groups (Gname) VALUES (?)";
        const sqlIncludes = "INSERT INTO Included (Userid, Groupid) VALUES (?, ?)";

        try{
        //Insert the new group into Groups table
        const result = await this.runQuery(sqlGroup, [name]);
        console.log(`Group ${name} added to the database.`);

        // Get the ID of the newly created group
        const GroupID = result.id;
        console.log(`The Group ID is ${GroupID}`);

        //Insert the mapping of group and user into Included table
        await this.runQuery(sqlIncludes, [userID, GroupID]);
        console.log(`User ${userID} added to Group ${GroupID}.`);

        } catch (err){
            console.error("Error adding group:", err);
        }
    }


}
async function main(){
    const myDB = new databaseClass('calendar');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const UserID = await myDB.addUser("User1", "Pass1");
    myDB.addGroup("Group1", UserID);




    rl.close();
}


main();