//actual file routes will be finalized later
import {db} from '../database/databaseAggregateFunctions.js';

export async function post({request}) {
	//in case of a bad command json
	let command;
	try {
		command = await request.json();
	} catch (e) {
		return new Response(JSON.stringify({ error: 'Invalid JSON format' }), { status: 400 });
	}
	
	//idempotency check
	try{
		const sqlCheck = "SELECT CommandID FROM Commands WHERE CommandID = ?";
		const exists = await db.getQuery(sqlCheck, [command.commandID]);
		if (exists) {
			return new Response(JSON.stringify({status: 'already_processed'}), {status: 200});
		}
	
		//validating payload
		if (!command.payload.userId || !command.payload.event?.length) {
			return new Response(JSON.stringify({error: 'Invalid payload'}), {status: 400});
		}

		
		const newEvent = await db.createEventWithOutbox(
			command.payload.userId,
			command.payload.groupId,
			command.payload.event,
			command.payload.description,
			command.payload.dateTime,
			command.payload.type
		);
		//outbox created inside the database class instance via the createEventWithOutbox
		//save Command ID in database
		const sqlCommand = "INSERT INTO Commands (CommandID) VALUES (?)";
		await db.runQuery(sqlCommand, [command.commandID]);
		return new Response(JSON.stringify({status: 'accepted', commandId: command.commandId, eventId: newEvent}), {status: 202});
	}
	catch(err){
		return new Response(JSON.stringify({error: err.message}), {status: 500});
	}
}
		
