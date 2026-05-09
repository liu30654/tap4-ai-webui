import { NextResponse } from 'next/server';

import { callClaude, ChatMsg } from '@/lib/decision-room/anthropic';
import { END_TOKEN } from '@/lib/decision-room/prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function detectStage(messages: ChatMsg[]): number {
  const aiCount = messages.filter((m) => m.role === 'assistant').length;
  if (aiCount <= 2) return 1;
  if (aiCount === 3) return 2;
  if (aiCount === 4) return 3;
  return 4;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: '后端没配 ANTHROPIC_API_KEY，预览版暂不可用' },
      { status: 500 },
    );
  }
  let body: { messages?: ChatMsg[]; user_text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const userText = (body.user_text || '').trim();
  const history = Array.isArray(body.messages) ? body.messages : [];
  if (!userText) {
    return NextResponse.json({ error: 'empty user_text' }, { status: 400 });
  }
  if (history.length === 0) {
    return NextResponse.json({ error: 'no history; call /start first' }, { status: 400 });
  }

  const next: ChatMsg[] = [...history, { role: 'user', content: userText }];

  try {
    let aiText = await callClaude(next);
    const finished = aiText.includes(END_TOKEN);
    if (finished) aiText = aiText.replace(END_TOKEN, '').trim();
    next.push({ role: 'assistant', content: aiText });
    return NextResponse.json({
      messages: next,
      ai_text: aiText,
      stage: detectStage(next),
      finished,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
