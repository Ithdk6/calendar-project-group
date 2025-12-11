import { db } from '../../database/databaseAggregateFunctions';
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

  let userId;
  try {
    const decoded = jwt.verify(token, SECRET);
    userId = decoded.userId || decoded.userid; // make sure to match your token payload
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
    if (exists.length > 0) {
      return new Response(JSON.stringify({ status: 'already_processed' }), { status: 200 });
    }

    // Unpack payload
    const { title, date, type } = command.payload || {};

    // Validate payload
    if (!command.payload || !title || !date) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
    }

    // Create event with outbox
    const gID = await db.findGroupFromUser(userId);
    await db.createEventWithOutbox(userId, gID, title, '', date, type);

    // Save Command ID in database
    const sqlCommand = "INSERT INTO Commands (CommandID) VALUES (?)";
    await db.runQuery(sqlCommand, [command.commandId]);

    return new Response(JSON.stringify({
      status: 'accepted',
      commandId: command.commandId,
      userId: userId
    }), { status: 200 });

  } catch (error) {
    console.error("Database Error:", error);
    return new Response(JSON.stringify({ error: error }), { status: 500 });
  }
}