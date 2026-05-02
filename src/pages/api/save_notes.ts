import { db } from '../../database/databaseAggregateFunctions.ts';
import jwt from 'jsonwebtoken';
import type { APIRoute } from 'astro';

/**
 * POST /api/save_notes
 *
 * Saves manual notes for an event into the database.
 *
 * Request JSON shape:
 * {
 *   "commandId": "uuid-v4-string",
 *   "payload": {
 *     "eventId": 123,
 *     "manualNotes": "Text of manual notes...",
 *     "dictationOutput": "Optional transcription text"
 *   }
 * }
 *
 * Behavior:
 * - Validates session JWT from cookie (same SECRET as other endpoints).
 * - Guarantees idempotency by checking Commands table for commandId.
 * - Updates `EventCore.Description` with `manualNotes`.
 * - (Optionally) leaves transcription handling/summarization to other endpoints.
 * - Stores the commandId in Commands to avoid replay.
 */
const SECRET = process.env.JWT_SECRET || 'supersecret-key-that-no-one-knows';

export const POST: APIRoute = async ({ request }) => {
  // Parse cookie header and extract session token (JWT)
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

    // Check if user is known
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
    const { eventId, noteContent } = command.payload || {};

    console.log(`eventId: ${eventId}, noteContent: ${noteContent}`);

    // Validate payload
    if (!command.payload || !eventId || !noteContent) {
      return new Response(JSON.stringify({ error: 'Invalid payload: missing eventId or noteContent' }), { status: 400 });
    }

    // Check if note already exists for this event and user
    const existingNote = await db.getNote(Number(eventId), Number(Uid));

    if (existingNote) {
      // Update existing note
      console.log(`Updating existing note for eventId: ${eventId}, userId: ${Uid}`);
      await db.updateNote(Number(eventId), Number(Uid), noteContent);
    } else {
      // Create new note
      console.log(`Creating new note for eventId: ${eventId}, userId: ${Uid}`);
      await db.saveNote(Number(eventId), Number(Uid), noteContent);
    }

    // Save Command ID in database
    const sqlCommand = "INSERT INTO Commands (CommandID) VALUES (?)";
    await db.runQuery(sqlCommand, [command.commandId]);

    return new Response(JSON.stringify({
      status: 'accepted',
      commandId: command.commandId,
      userId: Uid,
      eventId: eventId,
      updated: !!existingNote
    }), { status: 200 });

  } catch (error: any) {
    console.error("Database Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};