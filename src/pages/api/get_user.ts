import { db } from '../../database/databaseAggregateFunctions.ts';
import jwt from 'jsonwebtoken';
import type { APIRoute } from 'astro';

const SECRET = process.env.JWT_SECRET || 'supersecret-key-that-no-one-knows';

export const GET: APIRoute = async ({ request }) => {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader
        .split(';')
        .map(c => c.trim().split('='))
    );
    const token = cookies['session'];

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Not Authenticated' }),
        { status: 401 }
      );
    }

    let userId: string | number;
    try {
      //decode the user object and cast it into an number
      const decoded = jwt.verify(token, SECRET) as { userId: string | number};
      userId = Number(decoded.userId);
    } catch (error: any) {
      console.log(`Error: ${error.message}`);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401 }
      );
    }
    //get user
    const sql = 'SELECT Uid, email, username FROM Users WHERE Uid = ?';
    const user = await db.getQuery(sql, [userId]);

    //if user doesnt exist then throw error
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ user }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error: any) {
    console.log("Get user error: ", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}