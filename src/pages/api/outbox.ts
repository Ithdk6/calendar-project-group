import { db } from '../../database/databaseAggregateFunctions';
import Kafka from 'kafkajs';

const kafka = new Kafka.Kafka({
  clientId: "calendar-service",
  brokers: ["localhost:9092"]
});

const producer = kafka.producer();

async function publishOutbox() {
  const sqlCommand = "SELECT * FROM Outbox WHERE Processed = 0 ORDER BY CreatedAt ASC";
  let outboxs = [];

  try {
    outboxs = await db.getQuery(sqlCommand);
  } catch (err) {
    console.error("Failed to read outbox table: ", err);
    return;
  }

  for (const ob of outboxs) {
    try {
      const payloadString = typeof ob.payload === "string"
        ? ob.payload
        : JSON.stringify(ob.payload);

      await producer.send({
        topic: ob.outboxType,
        messages: [
          { key: ob.OutboxId.toString(), value: payloadString },
        ]
      });

      const sqlOutbox = "UPDATE Outbox set Processed = 1 WHERE outboxId = ?";
      await db.runQuery(sqlOutbox, [ob.OutboxId]);

      console.log(`Published and processed outbox entry ${ob.OutboxId}`);
    } catch (err) {
      console.error(`Error handling outbox entry ${ob.OutboxId}: `, err);
    }
  }
}

(async () => {
  await producer.connect();
  console.log("Outbox processor started...");
  setInterval(publishOutbox, 5000); // runs every 5sec (can be changed later)
})();

module.exports = { publishOutbox };