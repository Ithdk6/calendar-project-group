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

    async addUserToGroup(UserID, GroupID){
        const sqlIncludes = "INSERT INTO Included (Userid, Groupid) VALUES (?, ?)";

        try{

        //map a new user to a group via included table
        await this.runQuery(sqlIncludes, [userID, GroupID]);
        console.log(`User ${userID} added to Group ${GroupID}.`);

        } catch (err){
            console.error("Error adding group:", err);
        }
    }

    async addAvailability(userID, startTime, endTime, Day, Month, Year){
        const sqlAvail = "INSERT INTO Availability (Day, Month, AYear, StartTime, EndTime) VALUES (?, ?, ?, ?, ?)";
        const sqlHas = "INSERT INTO Has (UserID, AvailID) VALUES (?, ?)";
        try{
            //Insert the new availability into Availability table
            const result = await this.runQuery(sqlGroup, [Day, Month, Year, startTime, endTime]);
            console.log(`Availability ${result.id} added to the Avail table.`);

            //Insert the mapping of availability and user into Has table
            await this.run(sqlHas, [userID, result.id]);
            console.log(`Availability ${result.id} added to the Has table.`);
        }
        catch (err){
            console.error("Error Adding Availability:", err);
        }
    }

    async deleteGroup(GroupID){
        const sqlDeleteIncluded = "DELETE FROM Included WHERE GroupID = ?";
        const sqlDeleteGroup = "DELETE FROM Groups WHERE Gid = ?";

        //wrap all sql commands in a "Packet" so that in the instance of a server crash,
        //it can rollback to the previous stable state
        await this.runQuery("BEGIN TRANSACTION");

        try{
            //Delete all mappings of users to this group from Included table
            this.db.run(sqlDeleteIncluded, [GroupID]);
            console.log(`Group ${GroupID} Deleted from Included.`);

            //Delete the group from Groups table
            this.db.run(sqlDeleteGroup, [GroupID]);
            console.log(`Group ${GroupID} Deleted from Groups.`);

            await this.runQuery("COMMIT");
        }
        catch (err){
            //roll back the delete if error occured
            await this.runQuery("ROLLBACK");
            console.error("Error deleting group:", err);
        }
    }

    async deleteUser(UserID){
        const sqlDeleteIncluded = "DELETE FROM Included WHERE UserID = ?";
        const sqlDeleteUser = "DELETE FROM Users WHERE Uid = ?";

        //wrap all sql commands in a "Packet" so that in the instance of a server crash,
        //it can rollback to the previous stable state
        await this.runQuery("BEGIN TRANSACTION");
        try{
            //Delete all mappings of this user to groups from Included table
            this.db.run(sqlDeleteIncluded, [UserID]);
            console.log(`User ${UserID} Deleted from Included.`);

            //Delete the user from Users table
            this.db.run(sqlDeleteUser, [UserID]);
            console.log(`User ${UserID} Deleted from Users.`);

            //end the transaction
            await this.runQuery("COMMIT");
        }
        catch (err){
            //roll back the delete if error occured
            await this.runQuery("ROLLBACK");
            console.error("Error deleting User:", err);
        }
    }

    async removeUserFromGroup(UserID, GroupID){
        const sqlDeleteIncluded = "DELETE FROM Included WHERE UserID = ? AND GroupID = ?";

        //wrap all sql commands in a "Packet" so that in the instance of a server crash,
        //it can rollback to the previous stable state
        await this.runQuery("BEGIN TRANSACTION");

        try{
            this.db.run(sqlDeleteIncluded, [UserID, GroupID]);
            console.log(`User ${UserID} Deleted from Included.`);
            //end the transaction
            await this.runQuery("COMMIT");
        }
        catch (err){
            //roll back the delete if error occured
            await this.runQuery("ROLLBACK");
            console.error("Error deleting include:", err);
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
    await myDB.addGroup("Group1", UserID);
    

    await myDB.removeUserFromGroup(`5`, `5`);

    rl.close();
}


main();