//actual file routes will be finalized later
import { db } from '../database/databaseAggregateFunctions.js';

//used for the sign in page
export async function post({ request }) {
	//in case of a bad command json
	let command;
	try {
		command = await request.json();
	} catch (e) {
		return new Response(JSON.stringify({ error: 'Invalid JSON format' }), { status: 400 });
	}

	try {

		//check if command has already been run
		const sqlCheck = "SELECT CommandID FROM Commands WHERE CommandID = ?";
		const exists = await db.getQuery(sqlCheck, [command.commandId]);
		if (exists.length > 0) {
			return new Response(JSON.stringify({ status: 'already_processed' }), { status: 200 });
		}

		//validating payload
		if (!command.payload || !command.payload.email || !command.payload.password) {
			return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
		}

		//find userid from email and password
		const sql = "SELECT Uid, pass FROM users WHERE (email) = (?)"
		const rows = await db.getQuery(sql, [command.payload.email]);

		if (rows.length == 0) {
			return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
		}

		const user = rows[0];

		//no hashing (will change for future)
		if (user.pass !== command.payload.password) {
			return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
		}

		//save Command ID in database
		const sqlCommand = "INSERT INTO Commands (CommandID) VALUES (?)";
		await db.runQuery(sqlCommand, [command.commandId]);

		return new Response(JSON.stringify({ status: 'accepted', commandId: command.commandId, userId: user.Uid }), { status: 200 });
	}
	catch (err) {
		console.error("Database Error:", err);
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
}