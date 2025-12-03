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

    //Adds a new user to the database
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

    //adds a new group with that user as a member
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

    //Adds a user to an existing group
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

    //Adds a new availability to the user
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

    //Adds a new event to a calendar
    async addEvent(ETitle, Description, Type, StartTime, EndTime, Day, Month, Year, CalID){
        const sqlECore = "INSERT INTO ECore (Title, Description) VALUES (?, ?)";
        const sqlETime = "INSERT INTO EventTime (EventID, StartTime, EndTime, Day, Month, EYear) VALUES (?, ?, ?, ?, ?)";
        const sqlEventAdd = "INSERT INTO EventAdd (Cid, EventID) VALUES (?, ?)";
        try{

        const result = await this.runQuery(sqlECore, [ETitle, Description]);
        console.log(`Event ${ETitle} added to EventCore.`);

        await this.runQuery(sqlETime, [result.id, StartTime, EndTime, Day, Month, Year]);
        console.log(`Event ${result.id} added to EventTime.`);

        await this.runQuery(sqlEventAdd, [CalID, result.id]);
        console.log(`Event ${result.id} added to EventAdd.`);

        } catch (err){
            console.error("Error adding Event:", err);
        }
    }

    //Adds a blank calendar to a group
    async addBlankCalendar(Gid, Cid, calName){

        const sql = "INSERT INTO Calendar (calName) VALUES (?)";
        const sqlGCal = "INSERT INTO GCal (Gid, Cid) VALUES (?, ?)";
        try{
            const result = await this.runQuery(sql, [calName]);
        
            console.log(`Calender ${calName} added.`);
            console.log(`The Calendar ID is ${result.id}`);
            
            await this.runQuery(sqlGCal, [Gid, Cid]);

            console.log(`mapping of Group and Calendar`);
            return result.id;
        }
        catch (err){
            console.error("Error adding Calendar:", err);
        }
    }

    //Adds a new type of Event to the database
    async addEventType(typeName, Eid){

        const sqlType = "INSERT INTO Type (Tname) VALUES (?)";
        const sqlEventType = "INSERT INTO EventType (TypeID, EventID) VALUES (?, ?)";
        try{
            const result = await this.runQuery(sqlType, [typeName]);
            console.log(`Type ${typeName} added.`);
            
            await this.runQuery(sqlGCal, [result.id, Eid]);
            console.log(`mapping of Type and Event added`);
        }
        catch (err){
            console.error("Error adding Calendar:", err);
        }
    }

    async deleteType(Tid){
        const sqlDeleteType = "DELETE FROM Type WHERE Tid = ?";
        const sqlDeleteEType = "DELETE FROM EventType WHERE TypeID = ?";

        //wrap all sql commands in a "Packet" so that in the instance of a server crash,
        //it can rollback to the previous stable state
        await this.runQuery("BEGIN TRANSACTION");
        try{
            //Delete all mappings of this Type to Events from EventType table
            this.db.run(sqlDeleteType, [Tid]);
            console.log(`Type ${Tid} Deleted from EventType.`);

            //Delete the Type from Type table
            this.db.run(sqlDeleteType, [Tid]);
            console.log(`Type ${Tid} Deleted from Type.`);

            //end the transaction
            await this.runQuery("COMMIT");
        }
        catch (err){
            //roll back the delete if error occured
            await this.runQuery("ROLLBACK");
            console.error("Error deleting Type:", err);
        }
    }

    //Deletes a Group from the database
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
            this.
        }
        catch (err){
            //roll back the delete if error occured
            await this.runQuery("ROLLBACK");
            console.error("Error deleting group:", err);
        }
    }

    //Deletes a user from the database
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

    //removes a user's access to a group
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

    //Deletes a calendar from a group
    async deleteCalendar(groupID, calID){
        const sqlDeleteGCal = "DELETE FROM GCal WHERE (Uid, Cid) = (?, ?)";
        const sqlDeleteCal = "DELETE FROM Calendar WHERE Cid = ?";
        const sqlDeleteEventAdded = "DELETE FROM EventAdded WHERE Cid = ?";

        //wrap all sql commands in a "Packet" so that in the instance of a server crash,
        //it can rollback to the previous stable state
        await this.runQuery("BEGIN TRANSACTION");
        try{
            //Delete all mappings of this user to groups from Included table
            this.db.run(sqlDeleteGCal, [groupID, calID]);
            console.log(`Calendar mapping ${calID} Deleted from GCal.`);

            //Delete the user from Users table
            this.db.run(sqlDeleteCal, [calID]);
            console.log(`Calendar ${calID} Deleted from Calendar.`);

            //Delete the user from Users table
            this.db.run(sqlDeleteEventAdded, [calID]);
            console.log(`Calendar mapping ${calID} Deleted from Calendar.`);

            //end the transaction
            await this.runQuery("COMMIT");
        }
        catch (err){
            //roll back the delete if error occured
            await this.runQuery("ROLLBACK");
            console.error("Error deleting Calendar:", err);
        }
    }

    //Deletes an event from a calendar
    async deleteEvent(EventID, CalID){
        const sqlDeleteEventAdded = "DELETE FROM EventAdd WHERE (Eid, Cid) = (?, ?)";
        const sqlDeleteETime = "DELETE FROM EventTime WHERE Eid = ?";
        const sqlDeleteECore = "DELETE FROM EventCore WHERE Eid = ?";

        //wrap all sql commands in a "Packet" so that in the instance of a server crash,
        //it can rollback to the previous stable state
        await this.runQuery("BEGIN TRANSACTION");

        try{
            //Delete the EventTime from EventTime table
            this.db.run(sqlDeleteETime, [EventID]);
            console.log(`Calendar mapping ${EventID} Deleted from GCal.`);

            //Delete the Event from EventCore table
            this.db.run(sqlDeleteECore, [EventID]);
            console.log(`Event ${EventID} Deleted from EventCore.`);

            //Delete all mappings of this Event to Calendar from GCal table
            this.db.run(sqlDeleteEventAdded, [EventID, calID]);
            console.log(`Event mapping ${EventID} Deleted from EventAdd.`);

            //end the transaction
            await this.runQuery("COMMIT");
        }
        catch (err){
            //roll back the delete if error occured
            await this.runQuery("ROLLBACK");
            console.error("Error deleting Event:", err);
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