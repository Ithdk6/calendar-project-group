//actual file routes will be finalized later
import { db } from '../database/databaseAggregateFunctions.js';

export async function post({ request }) {
	//in case of a bad command json
	let command;
	try {
		command = await request.json();
	} catch (e) {
		return new Response(JSON.stringify({ error: 'Invalid JSON format' }), { status: 400 });
	}

	//idempotency check
	try {
		const newUser = await db.createUserWithOutbox(
			command.payload.name,
			command.payload.email,
			command.payload.password
		);

		if (!newUser) {
			return new Response(JSON.stringify({ status: 'already_processed' }), { status: 200 });
		}
		//outbox created inside the database class instance via the createEventWithOutbox
		return new Response(JSON.stringify({ status: 'accepted', commandId: command.commandId, userId: newUser }), { status: 202 });
	}
	catch (err) {
		return new Response(JSON.stringify({ error: err.message }), { status: 500 });
	}
}