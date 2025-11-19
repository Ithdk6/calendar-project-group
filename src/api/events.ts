import type {APIRoute} from 'astro';
import sqlite3 from 'sqlite3';
import {open} from 'sqlite';

export const GET: APIRoute = async () => {
    try {
        const db = await open ({
            filename: './database/Calendar.sql',
            driver: sqlite3.Database,
        });

        const events = await db.all('SELECT * FROM Event')

        return new Response(JSON.stringify(events), {
            status:200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (e) {
        console.error('Databse error:', e);
        return new Response(JSON.stringify({e: 'Failed to fetch data'}), {
            status: 500,
        });
    }
};
