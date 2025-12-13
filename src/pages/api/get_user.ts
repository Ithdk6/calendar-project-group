import { db } from '../../database/databaseAggregateFunctions';
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

    let userId
    try {
      const decoded = jwt.verify(token, SECRET);
      userId = decoded.userId
    } catch (error) {
      console.log(`Error: ${error}`);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401 }
      );
    }

    const sql = 'SELECT Uid, email, username FROM Users WHERE Uid = ?';
    const rows = await db.getQuery(sql, [userId]);

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 401 }
      );
    }

    return new Response(
      JSON.stringify({ rows }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error) {
    console.log("Get user error: ", error);
    return new Response(
      JSON.stringify({ error: error }),
      { status: 500 }
    );
  }
}