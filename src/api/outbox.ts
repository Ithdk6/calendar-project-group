import { db } from '../database/databaseAggregateFunctions';
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: "calendar-service",
    brokers: ["localhost:9092"]
});

const producer = kafka.producer();

async function publishOutbox() {
    const sqlCommand = "SELECT * FROM Outbox WHERE Processed = 0 ORDER BY CreatedAt ASC";
    const outboxs = await db.runQuery(sqlCommand);

	for (const ob of outboxs) {
		await producer.send({
            topic: ob.outboxType,
            messages: [
                {key: ob.OutboxId.toString(), value: ob.Payload},
            ]
        });

        const sqlOutbox = `UPDATE Outbox SET Processed = 1 WHERE outboxId = ?`;
        await db.runQuery(sqlOutbox, [ob.OutboxId]);

        console.log(`Published and processed outbox entry ${ob.OutboxId}`);
	}
}

(async () => {
    await producer.connect();
    setInterval(publishOutbox, 5000);//runs every 5sec (can be changed later)
})();
