import { NextResponse } from 'next/server';

import { callClaude, ChatMsg } from '@/lib/decision-room/anthropic';
import { LETTER_PROMPT } from '@/lib/decision-room/prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: '后端没配 ANTHROPIC_API_KEY，预览版暂不可用' },
      { status: 500 },
    );
  }
  let body: { messages?: ChatMsg[]; started_at?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const history = Array.isArray(body.messages) ? body.messages : [];
  if (history.length < 2) {
    return NextResponse.json({ error: 'history too short' }, { status: 400 });
  }
  const started = typeof body.started_at === 'number' ? body.started_at : Date.now();
  const durationMin = Math.max(1, Math.round((Date.now() - started) / 60000));

  const messages: ChatMsg[] = [
    ...history,
    {
      role: 'user',
      content:
        `[本次对话总时长约 ${durationMin} 分钟。请把这个数字填进信里 ` +
        `"我们今天用了 X 分钟" 的位置。]\n\n` +
        LETTER_PROMPT,
    },
  ];
  try {
    const letter = await callClaude(messages);
    return NextResponse.json({ letter });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
