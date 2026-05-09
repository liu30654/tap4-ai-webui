'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type ChatMsg = { role: 'user' | 'assistant'; content: string };
type Screen = 'entry' | 'chat' | 'letter';
type Msg = { id: string; role: 'ai' | 'user'; text: string };

const PROMPT = '你现在，想想清楚什么？';

const STAGE_HINT: Record<number, string> = {
  1: '阶段 1 · 看见你的处境',
  2: '阶段 2 · 看见你看不见的',
  3: '阶段 3 · 暴露隐藏的成本',
  4: '阶段 4 · 找到具体的下一步',
};

export default function DecisionRoomApp() {
  const [screen, setScreen] = useState<Screen>('entry');

  // —— entry ——
  const [situation, setSituation] = useState('');
  const [inputReady, setInputReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // —— chat ——
  const [messages, setMessages] = useState<Msg[]>([]);
  const [history, setHistory] = useState<ChatMsg[]>([]);
  const [stage, setStage] = useState(1);
  const [draft, setDraft] = useState('');
  const [canType, setCanType] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [sending, setSending] = useState(false);
  const startedAtRef = useRef<number>(0);
  const threadRef = useRef<HTMLDivElement | null>(null);

  // —— letter ——
  const [letter, setLetter] = useState('');
  const [paperOpen, setPaperOpen] = useState(false);
  const [actionsReady, setActionsReady] = useState(false);

  const promptChars = useMemo(() => PROMPT.split(''), []);

  useEffect(() => {
    const t = window.setTimeout(() => setInputReady(true), PROMPT.length * 50 + 600);
    return () => window.clearTimeout(t);
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    if (screen !== 'chat') return;
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, thinking, screen]);

  const canEnter = situation.trim().length >= 20 && !loading;

  function unlockAfterAi(text: string) {
    // 等到逐字浮现 + 500ms 呼吸停顿
    const t = text.length * 30 + 500;
    setCanType(false);
    window.setTimeout(() => setCanType(true), t);
  }

  async function onEnter() {
    if (!canEnter) return;
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/decision-room/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ situation: situation.trim() }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      const aiText: string = data.ai_text;
      setHistory(data.messages);
      const initial: Msg[] = [
        { id: 'u-0', role: 'user', text: situation.trim() },
        { id: 'a-0', role: 'ai', text: aiText },
      ];
      setMessages(initial);
      setStage(1);
      startedAtRef.current = data.started_at || Date.now();
      setScreen('chat');
      unlockAfterAi(aiText);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg.length > 80 ? msg.slice(0, 80) + '…' : msg);
    } finally {
      setLoading(false);
    }
  }

  async function onSend() {
    const text = draft.trim();
    if (!text || sending || !canType) return;
    const myId = 'u-' + messages.length;
    const newMsgs: Msg[] = [...messages, { id: myId, role: 'user', text }];
    setMessages(newMsgs);
    setDraft('');
    setSending(true);
    setThinking(true);
    setCanType(false);

    try {
      const r = await fetch('/api/decision-room/turn', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history, user_text: text }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      const aiText: string = data.ai_text;
      setHistory(data.messages);
      const aiMsg: Msg = { id: 'a-' + newMsgs.length, role: 'ai', text: aiText };
      setMessages([...newMsgs, aiMsg]);
      setStage(data.stage || stage);
      setThinking(false);
      setSending(false);
      unlockAfterAi(aiText);

      if (data.finished) {
        const t = aiText.length * 30 + 1200;
        window.setTimeout(() => goLetter(data.messages), t);
      }
    } catch (e: unknown) {
      setThinking(false);
      setSending(false);
      setCanType(true);
      const msg = e instanceof Error ? e.message : String(e);
      // 滚动一条错误提示当作 AI 消息
      setMessages([
        ...newMsgs,
        { id: 'err-' + Date.now(), role: 'ai', text: '（断了一下：' + msg + '。再发一遍试试。）' },
      ]);
    }
  }

  async function goLetter(finalHistory: ChatMsg[]) {
    try {
      const r = await fetch('/api/decision-room/letter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: finalHistory, started_at: startedAtRef.current }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
      setLetter(data.letter || '');
      setScreen('letter');
      window.setTimeout(() => setPaperOpen(true), 200);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setMessages((prev) => [
        ...prev,
        { id: 'err-' + Date.now(), role: 'ai', text: '（信暂时写不出：' + msg + '）' },
      ]);
    }
  }

  // —— letter 段落浮现 + 按钮亮起 ——
  const paragraphs = useMemo(
    () =>
      letter
        .split(/\n{2,}/)
        .map((s) => s.trim())
        .filter(Boolean),
    [letter],
  );
  useEffect(() => {
    if (screen !== 'letter' || !paperOpen) return;
    const total = 600 + paragraphs.length * 600 + 1200;
    const t = window.setTimeout(() => setActionsReady(true), total);
    return () => window.clearTimeout(t);
  }, [screen, paperOpen, paragraphs.length]);

  function onCopy() {
    if (!letter) return;
    navigator.clipboard?.writeText(letter).catch(() => {});
  }
  function onRestart() {
    // 全部重置
    setScreen('entry');
    setSituation('');
    setMessages([]);
    setHistory([]);
    setStage(1);
    setDraft('');
    setLetter('');
    setPaperOpen(false);
    setActionsReady(false);
    setCanType(false);
    setInputReady(false);
    window.setTimeout(() => setInputReady(true), PROMPT.length * 50 + 600);
  }

  // ——————————— 渲染 ———————————

  if (screen === 'entry') {
    return (
      <div className='dr-entry'>
        <div className='dr-scene'>
          <div className='dr-scene-window'>
            <div className='dr-scene-mountains' />
            <div className='dr-scene-mountains near' />
            <div className='dr-scene-sun' />
          </div>
          <div className='dr-scene-table'>
            <div className='dr-scene-cup' />
          </div>
        </div>

        <div className='dr-prompt'>
          {promptChars.map((c, i) => (
            <span key={i} className='dr-char' style={{ animationDelay: `${i * 50}ms` }}>
              {c}
            </span>
          ))}
        </div>

        <div className={'dr-input-wrap' + (inputReady ? ' show' : '')}>
          <textarea
            className='dr-textarea'
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder='把你现在卡在哪里，写下来。可以是一两段话。'
            maxLength={600}
            rows={5}
          />
          <div className='dr-hint'>{situation.length} / 600</div>
          <button
            className={'dr-btn' + (canEnter ? ' on' : '')}
            onClick={onEnter}
            disabled={!canEnter}
          >
            {loading ? '正在进入……' : '进入决策室'}
          </button>
          {error && <div className='dr-error'>{error}</div>}
          <div className='dr-meta'>这是一个帮你想清楚的工具，不是给你答案的工具。</div>
        </div>
      </div>
    );
  }

  if (screen === 'chat') {
    return (
      <div className='dr-chat'>
        <div className='dr-thread' ref={threadRef}>
          {messages.map((m) => (
            <div key={m.id} className={'dr-msg dr-msg-' + m.role}>
              {m.role === 'ai' ? (
                m.text.split('').map((c, i) => (
                  <span key={i} className='dr-char' style={{ animationDelay: `${i * 30}ms` }}>
                    {c}
                  </span>
                ))
              ) : (
                <span>{m.text}</span>
              )}
            </div>
          ))}
          {thinking && <div className='dr-thinking'>……</div>}
        </div>

        <div className={'dr-composer' + (canType ? '' : ' off')}>
          <textarea
            className='dr-composer-input'
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={canType ? '慢慢回答……' : '等一下，先看看上面'}
            disabled={!canType}
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSend();
            }}
          />
          <div className='dr-composer-row'>
            <span className='dr-stage-hint'>{STAGE_HINT[stage] || ''}</span>
            <button
              className={'dr-send-btn' + (draft.length > 0 && canType ? ' on' : '')}
              onClick={onSend}
              disabled={!canType || draft.length === 0 || sending}
            >
              {sending ? '……' : stage >= 4 ? '生成那封信' : '发送'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // letter
  return (
    <div className='dr-letter'>
      <div className={'dr-paper' + (paperOpen ? ' open' : '')}>
        <div className='dr-paper-inner'>
          <div className='dr-letter-body'>
            {paragraphs.map((p, i) => (
              <div key={i} className='dr-para' style={{ animationDelay: `${600 + i * 600}ms` }}>
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={'dr-actions' + (actionsReady ? ' show' : '')}>
        <button className='dr-act-btn' onClick={onCopy}>
          复制全文
        </button>
      </div>
      <button className={'dr-restart' + (actionsReady ? ' show' : '')} onClick={onRestart}>
        想清楚了。离开。
      </button>
    </div>
  );
}
