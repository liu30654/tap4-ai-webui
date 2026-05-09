import { NextResponse } from 'next/server';

import { callClaude, ChatMsg } from '@/lib/decision-room/anthropic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: '后端没配 ANTHROPIC_API_KEY，预览版暂不可用' },
      { status: 500 },
    );
  }
  let body: { situation?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const situation = (body.situation || '').trim();
  if (situation.length < 10) {
    return NextResponse.json({ error: '处境太短了' }, { status: 400 });
  }
  const wrapped =
    '[这是用户进入产品时输入的处境，请你按 system 中阶段 1 的指示回应——' +
    '复述一遍 + 问 1-2 个具体问题]\n\n' +
    situation;
  const messages: ChatMsg[] = [{ role: 'user', content: wrapped }];
  try {
    const aiText = await callClaude(messages);
    messages.push({ role: 'assistant', content: aiText });
    return NextResponse.json({ messages, ai_text: aiText, stage: 1, started_at: Date.now() });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
