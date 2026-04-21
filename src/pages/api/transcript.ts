import type { APIRoute } from 'astro';
import { db } from '../../database/databaseAggregateFunctions.ts';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { eventId, transcript } = body || {};

    if (!eventId || !transcript) {
      return new Response(JSON.stringify({ error: 'Missing eventId or transcript' }), { status: 400 });
    }

    // Lightweight extractive summary: pick first three sentences if available
    const sentences = transcript.match(/[^\.!\?]+[\.!\?]+/g) || [transcript];
    const summary = sentences.slice(0, 3).join(' ').trim();

    // Update the EventCore Summary column
    const sqlUpdate = 'UPDATE EventCore SET Summary = ? WHERE Eid = ?';
    await db.runQuery(sqlUpdate, [summary, eventId]);

    // Also add a record to Outbox so other services/processors can pick it up
    await db.addOutbox('Summary', Number(eventId), { summary, transcript }, new Date().toISOString());

    return new Response(JSON.stringify({ status: 'ok', summary }), { status: 200 });
  } catch (err: any) {
    console.error('Transcript API error:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Internal server error' }), { status: 500 });
  }
};