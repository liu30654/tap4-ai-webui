import Anthropic from '@anthropic-ai/sdk';

import { MODEL, SYSTEM_PROMPT } from './prompt';

export type ChatMsg = { role: 'user' | 'assistant'; content: string };

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export async function callClaude(messages: ChatMsg[], system: string = SYSTEM_PROMPT): Promise<string> {
  const resp = await client().messages.create({
    model: MODEL,
    max_tokens: 1500,
    system,
    messages,
  });
  return resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
}
