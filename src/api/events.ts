//actual file routes will be finalized later
import { db } from '../database/databaseAggregateFunctions.js';

//used for the event creation
export async function post({ request }) {
	//in case of a bad command json
	let command;
	try {
		command = await request.json();
	} catch (e) {
		return new Response(JSON.stringify({ error: 'Invalid JSON format' }), { status: 400 });
	}

	try {
		//Integrety check start
		//check if command has already been run
		const sqlCheck = "SELECT CommandID FROM Commands WHERE CommandID = ?";
		const exists = await db.getQuery(sqlCheck, [command.commandId]);
		if (exists.length > 0) {
			return new Response(JSON.stringify({ status: 'already_processed' }), { status: 200 });
		}

		//unpack the payload for ease
		const { title, date, type, userId } = command.payload || {};


		//validating payload
		if (!command.payload || !title || !date || !userId) {
			return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
		}
		//Integrety check end

		//create an event with the outbox table included
		const gID = await db.findGroupFromUser(userId);
		await db.createEventWithOutbox(userId, gID, title, '', date, type);

		

		//save Command ID in database
		const sqlCommand = "INSERT INTO Commands (CommandID) VALUES (?)";
		await db.runQuery(sqlCommand, [command.commandId]);

		return new Response(JSON.stringify({ status: 'accepted', commandId: command.commandId, userId: userId }), { status: 200 });
	}
	catch (err) {
		console.error("Database Error:", err);
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
}