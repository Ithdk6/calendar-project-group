const expect = require('chai').expect;
const { db } = require('../src/database/databaseAggregateFunctions.ts');

describe('Add User', function () {
    it('should return User id when user is added', async function () {

        const uid = await db.createUserWithOutbox("TestUser", "TestPass", "TestEmail", "2");
        console.log(uid);

        expect(uid).to.equal(2);
    });

    it('should throw error if not given any parameters', async function () {
        try {
            await db.createUserWithOutbox(null, null, null, null);

            throw new Error('Function did not throw an error');
        } catch (error) {
            expect(error).to.exist;
        }
    });
});