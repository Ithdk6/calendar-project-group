const expect = require('chai').expect;
const { db } = require('../src/database/databaseAggregateFunctions.ts');

describe('Add User', function () {
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