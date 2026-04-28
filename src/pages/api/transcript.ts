import type { APIRoute } from 'astro';
import { db } from '../../database/databaseAggregateFunctions.ts';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with correct API key from environment
const apiKey = process.env.GOOGLE_GENAI_API_KEY || '';
if (!apiKey) {
  console.warn('WARNING: GOOGLE_GENAI_API_KEY not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { eventId, transcript } = body || {};

    console.log(`Received transcript request - eventId: ${eventId}, transcript length: ${transcript?.length}`);

    // Input validation
    if (!eventId) {
      console.error('Missing eventId');
      return new Response(JSON.stringify({ error: 'Missing eventId' }), { status: 400 });
    }

    if (!transcript || typeof transcript !== 'string') {
      console.error('Missing or invalid transcript');
      return new Response(JSON.stringify({ error: 'Missing or invalid transcript' }), { status: 400 });
    }

    if (transcript.trim().length === 0) {
      console.error('Transcript is empty');
      return new Response(JSON.stringify({ error: 'Transcript cannot be empty' }), { status: 400 });
    }

    // Summarize using Gemini LLM
    let summary = '';
    try {
      summary = await getGeminiSummary(transcript);
    } catch (llmError: any) {
      console.warn(`Gemini summarization failed: ${llmError.message}, falling back to basic summary`);
      summary = getBasicSummary(transcript);
    }

    console.log(`Generated summary: ${summary}`);

    try {
      // Update the EventCore Summary column
      const sqlUpdate = 'UPDATE EventCore SET Summary = ? WHERE Eid = ?';
      await db.runQuery(sqlUpdate, [summary, Number(eventId)]);
      console.log(`Updated EventCore for eventId: ${eventId}`);
    } catch (dbError: any) {
      console.error('Database update error:', dbError.message);
      throw new Error(`Failed to update event summary: ${dbError.message}`);
    }

    try {
      // Also add a record to Outbox so other services/processors can pick it up
      await db.addOutbox('Summary', Number(eventId), { summary, transcript }, new Date().toISOString());
      console.log(`Added to Outbox for eventId: ${eventId}`);
    } catch (outboxError: any) {
      console.error('Outbox insert error:', outboxError.message);
      // Don't throw - this is non-critical
    }

    return new Response(JSON.stringify({ 
      status: 'ok', 
      summary,
      transcript 
    }), { status: 200 });
  } catch (err: any) {
    console.error('Transcript API error:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Internal server error' }), { status: 500 });
  }
};

/**
 * Get summary from Google Gemini API
 */
async function getGeminiSummary(transcript: string): Promise<string> {
  console.log('Calling Gemini API for summarization');

  try {
    if (!apiKey) {
      throw new Error('GOOGLE_GENAI_API_KEY environment variable not set');
    }

    const prompt = `You are a helpful assistant that creates concise summaries of transcribed conversations. 
Summarize the following transcript in 2-3 sentences, capturing the key points.

Transcript:
${transcript}`;

    // Call generateContent with just the prompt string
    const result = await model.generateContent(prompt);
    const response = result.response;
    const summary = response.text();

    if (!summary || summary.trim().length === 0) {
      throw new Error('Empty response from Gemini API');
    }

    console.log('Gemini summary generated successfully');
    return summary.trim();
  } catch (error: any) {
    console.error('Gemini API error:', error);
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

/**
 * Fallback: basic extractive summary without LLM
 */
function getBasicSummary(transcript: string): string {
  console.log('Using basic summary fallback');
  const sentenceRegex = /[^\.!\?]+[\.!\?]+/g;
  const sentences = transcript.match(sentenceRegex) || [transcript];

  const validSentences = sentences
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .slice(0, 3);

  return validSentences.length > 0 ? validSentences.join(' ').trim() : transcript.trim();
}