//paths will be finalized later (on break and not at main computer that has npm server)
//import the db
//import eventBus from Astro

async function publishOutbox() {
	const outboxs = await db.outbox.find({processed: false});
	for (const ob of outboxs) {
		await eventBus.publish(ob)//Kafka implementation goes here
		await db.outbox.update({outboxId: ob.outboxId}, {processed: true});
	}
}

setInterval(publishOutbox, 5000);//runs every 5sec (can be changed later)
