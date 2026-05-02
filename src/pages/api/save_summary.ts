import { db } from '../../database/databaseAggregateFunctions.ts';
import jwt from 'jsonwebtoken';
import type { APIRoute } from 'astro';

const SECRET = process.env.JWT_SECRET || 'supersecret-key-that-no-one-knows';

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
    if (!Uid) {
      return new Response(JSON.stringify({ error: 'Token missing user identity' }), { status: 401 });
    }
  } catch (err) {
    console.error('JWT error', err);
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401 });
  }

  // Parse request JSON
  let command;
  try {
    command = await request.json();
  } catch (err) {
    console.error('Invalid JSON', err);
    return new Response(JSON.stringify({ error: 'Invalid JSON format' }), { status: 400 });
  }

  try {
    const sqlCheck = "SELECT CommandID FROM Commands WHERE CommandID = ?";
    const exists = await db.getQuery(sqlCheck, [command.commandId]);
    if (exists) {
      return new Response(JSON.stringify({ status: 'already_processed' }), { status: 200 });
    }

    const eventId = Number(command?.payload?.eventId);
    const summary = String(command?.payload?.summary || '');

    if (!eventId || !summary) {
      return new Response(JSON.stringify({ error: 'Invalid payload: eventId and summary required' }), { status: 400 });
    }

    // Update the summary field in EventCore
    await db.updateEventSummary(eventId, summary);

    // Save Command ID to avoid replay
    const sqlCommand = "INSERT INTO Commands (CommandID) VALUES (?)";
    await db.runQuery(sqlCommand, [command.commandId]);

    return new Response(JSON.stringify({ status: 'accepted', eventId }), { status: 200 });
  } catch (err: any) {
    console.error('Database Error:', err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500 });
  }
};