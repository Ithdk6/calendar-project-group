import { db } from '../../database/databaseAggregateFunctions.ts';
import jwt from 'jsonwebtoken';
import type { APIRoute } from 'astro';

const SECRET = process.env.JWT_SECRET || 'supersecret-key-that-no-one-knows';

// Used for fetching notes for an event
export const GET: APIRoute = async ({ request }) => {
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
  } catch (error) {
    console.log(`Error: ${error}`);
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401 });
  }

  // Get eventId from query parameters
  const url = new URL(request.url);
  const eventId = url.searchParams.get('eventId');

  if (!eventId) {
    return new Response(JSON.stringify({ error: 'Missing eventId parameter' }), { status: 400 });
  }

  try {
    const note = await db.getNote(Number(eventId), Number(Uid));

    return new Response(JSON.stringify({
      status: 'success',
      note: note || null
    }), { status: 200 });

  } catch (error: any) {
    console.error("Database Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}