import { db } from '../../database/databaseAggregateFunctions.ts';
import jwt from 'jsonwebtoken';
import type { APIRoute } from "astro";

const SECRET = process.env.JWT_SECRET || 'supersecret-key-that-no-one-knows';

//needs to be post because get requests cant have a body json
export const GET: APIRoute = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => c.trim().split('='))
  );
  const token = cookies['session']

  if (!token) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  //struct for userId
  interface TokenPayload {
    userId?: string;
    userid?: string;
  }
  let userId;

  try {
    const decoded = jwt.verify(token, SECRET) as TokenPayload;
    userId = decoded.userId || decoded.userid;

    if (!userId) throw new Error("No user ID in token");
  } catch (error) {
    console.log(`Error: ${error}`);
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401 });
  }

  try {
    //get the user's group
    const gID = await db.findGroupFromUser(Number(userId));

    if (!gID) {
      return new Response(JSON.stringify({ error: 'User group not found' }), { status: 404 });
    }

    //find all calendars in the group
    const cIDs = await db.findCidsFromGCal(Number(gID));

    //get all events from all calendars the user is apart of at the same time via map
    const eventIds = (await Promise.all(cIDs.map((c: any) => db.findEidsFromCalendar(c))))[0];
    console.log("Events IDs:", eventIds);
    const events = await Promise.all(eventIds.map((e: any) => db.findEvent(e)));
    console.log("Events:", events);

    return new Response(JSON.stringify({
      status: 'accepted',
      userId: userId,
      events: events
    }), { status: 200 });

  } catch (error: any) {
    console.error("Database Error: ", error.message);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
  }
}