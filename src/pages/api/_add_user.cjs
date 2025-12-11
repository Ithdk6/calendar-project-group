const { db } = require('../../database/databaseAggregateFunctions.cjs');

async function post({ request }) {
    // In case of a bad JSON
    let command;
    try {
        command = await request.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON format' }), { status: 400 });
    }

    // Idempotency check and create user
    try {
        const newUser = await db.createUserWithOutbox(
            command.payload.name,
            command.payload.email,
            command.payload.password,
            command.commandId
        );

        if (!newUser) {
            return new Response(JSON.stringify({ status: 'Username taken' }), { status: 409 });
        }

        // Outbox entry created inside db.createUserWithOutbox
        return new Response(
            JSON.stringify({ status: 'accepted', commandId: command.commandId, userId: newUser }),
            { status: 202 }
        );
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

module.exports = { post };