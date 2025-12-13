import { db } from '../../database/databaseAggregateFunctions.ts';
import jwt from 'jsonwebtoken';
import type { APIRoute } from "astro";

const SECRET = process.env.JWT_SECRET || 'supersecret-key-that-no-one-knows';

//needs to be post because get requests cant have a body json
export const POST: APIRoute = async ({ request }) => {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
        cookieHeader.split(';').map(c => c.trim().split('='))
    );
    const token = cookies['session']

    if (!token) {
        return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    //struct for userId
    interface TokenPayload{
        userId?: string;
        userid?: string;
    }
    let userId;

    try {
        const decoded = jwt.verify(token, SECRET) as TokenPayload;
        userId = decoded.userId || decoded.userid;

        if (!userId) throw new Error("No user ID in token");
    } catch (error)  {
        console.log(`Error: ${error}`);
        return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401 });
    }

    let command;
    try {
        command = await request.json();
    } catch (error)  {
        console.log(`Error: ${error}`);
        return new Response(JSON.stringify({ error: 'Invalid JSON format' }), { status: 400 });
    }

    try {
        const sqlCheck = "SELECT CommandID FROM Commands WHERE CommandID = ?";
        const exists = await db.getQuery(sqlCheck, [command.commandId]);
        if (exists) {
            return new Response(JSON.stringify({ status: 'already_processed' }), { status: 200 });
        }

        const { title, date, type } = command.payload || {};

        if (!command.payload || !title || !date) {
            return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
        }

        //get the user's group
        const gID = await db.findGroupFromUser(Number(userId));

        if (!gID) {
            return new Response(JSON.stringify({ error: 'User group not found' }), { status: 404 });
        }
        
        //find all calendars in the group
        const cIDs = await db.findCidsFromGCal(Number(gID));

        //get all events from all calendars the user is apart of at the same time via map
        const eventPromises = cIDs.map((c: any) => db.findEidsFromCalendar(c));
        const results = await Promise.all(eventPromises);

        console.log("Events:", results.flat());

        return new Response(JSON.stringify({
            status: 'accepted',
            commandId: command.commandId,
            userId: userId,
        }), { status: 200 });

    } catch (error: any) {
        console.error("Database Error: ", error.message);
        return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
    }
}