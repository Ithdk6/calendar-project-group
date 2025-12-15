const expect = require('chai').expect;
let db;

describe('Add Event', function () {

    before(async function() {
    // We 'await' the import because ESM is asynchronous by nature
    const module = await import('../src/database/databaseAggregateFunctions.ts');
    
    // Assign the named export 'db' to our local variable
    db = module.db; 
    
    // Safety check: Immediate feedback if the 'sync' failed
    if (!db) {
        throw new Error("Failed to load 'db' from the module. Check your exports!");
    }
});
    it('should return Evnet id when event is added', async function () {
        // A simple function to test (in a real app, this would be imported)
        const uid = await db.createUserWithOutbox("TestUser", "TestPass", "TestEmail", "3");
        console.log(uid);

        await db.addGroup("TestGroup", uid);
        await db.addBlankCalendar(1, "TestCalendar");


        const date = new Date();
        const result = await db.createEventWithOutbox(uid, 1, "Event", "EventDescription", date, "Work");

        // Chai's expect BDD style assertion
        expect(result).to.equal(1);
    });

    it('should throw error if not given any parameters', async function () {
        try {
            await db.createEventWithOutbox(null, null, null, null, null, null);

            throw new Error('Function did not throw an error');
        } catch (error) {
            expect(error).to.exist;
        }
    });
});