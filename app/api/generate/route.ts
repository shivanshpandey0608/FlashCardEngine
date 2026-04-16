import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured on the server.' }, { status: 500 });
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const body = await req.json();
    const { text, filename } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }
    if (text.trim().length < 100) {
      return NextResponse.json({ error: 'Text too short to generate cards' }, { status: 400 });
    }
    if (text.length > 60000) {
      return NextResponse.json({ error: 'Text too long' }, { status: 400 });
    }

    const systemPrompt = `You are an expert educator and flashcard designer.
Your job is to create high-quality flashcards from educational text.

Rules for great flashcards:
- Each card tests ONE specific concept, fact, or relationship
- Front: a clear question, prompt, or term — never vague
- Back: a concise, complete answer. Include examples where helpful
- Cover: key definitions, important facts, cause-effect relationships, worked examples, edge cases
- Do NOT create trivial or redundant cards
- Do NOT create cards about page numbers, headings, or metadata
- Aim for 15–25 cards for short texts, 25–40 for longer texts
- hint: one short phrase that jogs memory without giving away the answer (optional, omit if not useful)

Respond ONLY with valid JSON in this exact format, no markdown, no explanation:
{
  "cards": [
    { "front": "...", "back": "...", "hint": "..." },
    ...
  ]
}`;

    const userPrompt = `Generate flashcards from this educational content titled "${filename ?? 'Document'}":\n\n${text}`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
      max_tokens: 4000,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 502 });
    }

    let parsed: { cards: Array<{ front: string; back: string; hint?: string }> };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 502 });
    }

    if (!Array.isArray(parsed.cards) || parsed.cards.length === 0) {
      return NextResponse.json({ error: 'No cards generated' }, { status: 502 });
    }

    const cards = parsed.cards
      .filter(c => c.front && c.back)
      .map(c => ({
        front: String(c.front).slice(0, 300),
        back: String(c.back).slice(0, 600),
        ...(c.hint ? { hint: String(c.hint).slice(0, 150) } : {}),
      }));

    if (cards.length === 0) {
      return NextResponse.json({ error: 'No valid cards after sanitisation' }, { status: 502 });
    }

    return NextResponse.json({ cards });
  } catch (err: unknown) {
    console.error('[/api/generate]', err);
    const anyErr = err as { status?: number };
    if (anyErr?.status === 429) {
      return NextResponse.json(
        { error: 'OpenAI rate limit hit. Wait a minute and retry.' },
        { status: 429 }
      );
    }
    if (anyErr?.status === 401) {
      return NextResponse.json({ error: 'Invalid OpenAI API key.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
