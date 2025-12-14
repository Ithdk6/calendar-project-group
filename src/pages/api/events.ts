import { db } from '../../database/databaseAggregateFunctions.ts';
import jwt from 'jsonwebtoken';
import type { APIRoute } from 'astro';

const SECRET = process.env.JWT_SECRET || 'supersecret-key-that-no-one-knows';

// Used for the event creation
export const POST: APIRoute = async ({ request }) => {
  // Parse cookie header
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => c.trim().split('='))
  );
  const token = cookies['session'];

  if (!token) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }
  interface Token {
    userId?: string | number;
    userid?: string | number;
  }
  let Uid;
  try {
    const decoded = jwt.verify(token, SECRET) as Token;
    Uid = decoded.userId || decoded.userid;

    //check if user is known
    if (!Uid) {
      return new Response(JSON.stringify({ error: 'Token missing user identity' }), { status: 401 });
    }
  } catch (error) {
    console.log(`Error: ${error}`);
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401 });
  }

  // Parse request JSON
  let command;
  try {
    command = await request.json();
  } catch (error) {
    console.log(`Error: ${error}`);
    return new Response(JSON.stringify({ error: 'Invalid JSON format' }), { status: 400 });
  }

  try {
    // Integrity check: command already processed?
    const sqlCheck = "SELECT CommandID FROM Commands WHERE CommandID = ?";
    const exists = await db.getQuery(sqlCheck, [command.commandId]);
    if (exists) {
      return new Response(JSON.stringify({ status: 'already_processed' }), { status: 200 });
    }

    // Unpack payload
    const { title, date, type, time } = command.payload || {};

    // Validate payload
    if (!command.payload || !title || !date) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
    }

    // Create event with outbox
    const gID = await db.findGroupFromUser(Number(Uid));
    if (!gID) {
      return new Response(JSON.stringify({ error: 'User group not found' }), { status: 404 });
    }
    const eId = await db.createEventWithOutbox(Number(Uid), gID, title, '', date, type);

    // Save Command ID in database
    const sqlCommand = "INSERT INTO Commands (CommandID) VALUES (?)";
    await db.runQuery(sqlCommand, [command.commandId]);

    return new Response(JSON.stringify({
      status: 'accepted',
      commandId: command.commandId,
      userId: Uid,
      eventId: eId
    }), { status: 200 });

  } catch (error: any) {
    console.error("Database Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}