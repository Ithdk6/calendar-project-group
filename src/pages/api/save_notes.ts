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
    if (!Uid) {
      return new Response(JSON.stringify({ error: 'Token missing user identity' }), { status: 401 });
    }
  } catch (err) {
    console.log('JWT error', err);
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401 });
  }

  // Parse request JSON
  let command;
  try {
    command = await request.json();
  } catch (err) {
    console.log('Invalid JSON', err);
    return new Response(JSON.stringify({ error: 'Invalid JSON format' }), { status: 400 });
  }

  try {
    // Idempotency: check if command already processed
    const sqlCheck = "SELECT CommandID FROM Commands WHERE CommandID = ?";
    const exists = await db.getQuery(sqlCheck, [command.commandId]);
    if (exists) {
      return new Response(JSON.stringify({ status: 'already_processed' }), { status: 200 });
    }

    const eventId = Number(command?.payload?.eventId || 0);
    const manualNotes = String(command?.payload?.manualNotes || '').trim();

    if (!eventId || manualNotes.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid payload: eventId and manualNotes are required' }), { status: 400 });
    }

    // Update EventCore.Description with the manual notes
    const sqlUpdate = "UPDATE EventCore SET Description = ? WHERE Eid = ?";
    await db.runQuery(sqlUpdate, [manualNotes, eventId]);

    // Save Command ID to prevent replay
    const sqlCommand = "INSERT INTO Commands (CommandID) VALUES (?)";
    await db.runQuery(sqlCommand, [command.commandId]);

    return new Response(JSON.stringify({ status: 'accepted', eventId }), { status: 200 });
  } catch (err: any) {
    console.error('Database Error:', err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
};