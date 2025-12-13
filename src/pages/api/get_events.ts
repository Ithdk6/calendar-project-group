import { db } from '../../database/databaseAggregateFunctions';
import jwt from 'jsonwebtoken';
import type { APIRoute } from "astro";

const SECRET = process.env.JWT_SECRET || 'supersecret-key-that-no-one-knows';

export const GET: APIRoute = async ({ request }) => {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
        cookieHeader.split(';').map(c => c.trim().split('='))
    );
    const token = cookies['session']

    if (!token) {
        return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }

    let userId;
    try {
        const decoded = jwt.verify(token, SECRET);
        userId = decoded.userId || decoded.userid;
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
        if (exists.length > 0) {
            return new Response(JSON.stringify({ status: 'already_processed' }), { status: 200 });
        }

        const { title, date, type } = command.payload || {};

        if (!command.payload || !title || !date) {
            return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
        }

        const gID = await db.findGroupFromUser(userId);
        const cID = await db.findCidsFromGCal(gID);

        //get all events from all calendars the user is apart of
        const events = [];
        for (const c of cID) {
            const group_events = await db.findEidsFromCalendar(c)
            for (const event of group_events) {
                events.push(event);
            }
        }

        return new Response(JSON.stringify({
            status: 'accepted',
            commandId: command.commandId,
            userId: userId,
        }), { status: 200 });

    } catch (error) {
        console.error("Database Error: ", error);
        return new Response(JSON.stringify({ error: error }), { status: 500 });
    }
}