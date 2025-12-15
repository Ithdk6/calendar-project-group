import { expect } from 'chai'; 
import { db } from '../src/database/databaseAggregateFunctions';

describe('Add Event', function () {
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