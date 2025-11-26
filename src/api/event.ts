//actual file routes will be finalized later
import {db} from '../database/Calendar.sql
import {generateID} from '../astro/utils'

export async function post({request}) {
	const command = await request.json();
	
	//idempotency check
	const exists = await db.commands.findOne({commandID: command.commandID});
	if (exists) {
		return new Response(JSON.stringify({status: 'already_processed'}), {status: 200});
	}
	
	//validating payload
	if (!command.payload.userId || !command.payload.event?.length) {
		return new Response(JSON.stringify({error: 'Invalid payload'}), {status: 400});
	}
	
	const event = {
		eventId: generateId(),
		userId: command.payload.userId,
		groupId: command.payload.groupId,
		event: command.payload.event,
		dateTime: command.payload.dateTime,
		status: 'Created'
	};
	await db.events.insert(event);
	
	const outbox = {
		outboxId: generateId(),
		outboxType: 'EventCreated',
		aggregateId: event.eventId,
		version: 1,
		payload: event,
		createdAt: new Date().toISOString(),
		processed: false
	};
	await db.outbox.insert(outbox);
	
	return new Response(JSON.stringify({status: 'accepted', commandId: command.commandId}), {status: 202});
}
		
