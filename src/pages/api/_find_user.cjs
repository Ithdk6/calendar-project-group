const { db } = require('../../database/databaseAggregateFunctions.cjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'supersecret-key-that-no-one-knows';

// Used for the sign-in page
async function post({ request }) {
    // In case of bad JSON
    let command;
    try {
        command = await request.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON format' }), { status: 400 });
    }

    try {
        // Check if command has already been run
        const sqlCheck = "SELECT CommandID FROM Commands WHERE CommandID = ?";
        const exists = await db.getQuery(sqlCheck, [command.commandId]);
        if (exists.length > 0) {
            return new Response(JSON.stringify({ status: 'already_processed' }), { status: 200 });
        }

        // Validating payload
        if (!command.payload || !command.payload.email || !command.payload.password) {
            return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
        }

        // Find user by email
        const sql = "SELECT Uid, pass FROM users WHERE email = ?";
        const rows = await db.getQuery(sql, [command.payload.email]);

        if (rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        }

        const user = rows[0];

        // Check password (no hashing for now)
        if (user.pass !== command.payload.password) {
            return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
        }

        // Save Command ID in database
        const sqlCommand = "INSERT INTO Commands (CommandID) VALUES (?)";
        await db.runQuery(sqlCommand, [command.commandId]);

        // JWT token creation
        const token = jwt.sign({ userId: user.Uid }, SECRET, { expiresIn: "2d" });

        // Set cookie header
        const headers = new Headers();
        headers.append(
            'Set-Cookie',
            `session=${token}; HttpOnly; path=/; Max-Age=${2*24*60*60}; Same-Site=Strict`
        );

        return new Response(
            JSON.stringify({ status: 'accepted', commandId: command.commandId, userId: user.Uid }),
            { status: 200, headers }
        );

    } catch (err) {
        console.error("Database Error:", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

module.exports = { post };