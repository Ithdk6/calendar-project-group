import { db } from '../../database/databaseAggregateFunctions.ts';
import jwt from 'jsonwebtoken';
import type { APIRoute } from 'astro';

const SECRET = process.env.JWT_SECRET || 'supersecret-key-that-no-one-knows';

// Used for deletion of events
export const POST: APIRoute = async ({ request }) => {
   const cookieHeader = request.headers.get('cookie') || '';
   const cookies = Object.fromEntries(
     cookieHeader
    .split(';')
    .map(c => c.trim().split('='))
   );
  const token = cookies['session'];


  // In case of bad JSON
  let command;
  try {
    command = await request.json();
  } catch (error) {
    console.log(`Error: ${error}`);
    return new Response(JSON.stringify({ error: 'Invalid JSON format' }), { status: 400 });
  }

  try {
    
    const decoded = jwt.verify(token, SECRET) as { userId: string | number };
    const userId = decoded.userId;

    const exists = await db.getQuery("SELECT CommandID FROM Commands WHERE CommandID = ?", [command.commandId]);
        if (exists) {
            return new Response(JSON.stringify({ status: 'already_processed' }), { status: 200 });
        }
    
    //delete the event
    const { Eid } = command.payload || {};
        if (!Eid) {
            return new Response(JSON.stringify({ error: 'Missing Event ID (Eid)' }), { status: 400 });
        }
    await db.deleteEvent(Number(Eid));

    // Save Command ID in database
    const sqlCommand = "INSERT INTO Commands (CommandID) VALUES (?)";
    await db.runQuery(sqlCommand, [command.commandId]);


    return new Response(
      JSON.stringify({ status: 'accepted', commandId: command.commandId }),
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Deletion Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}