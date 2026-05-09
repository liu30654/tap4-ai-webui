"""
决策室 v1.0 — 后端
PRD §7：FastAPI + Anthropic Claude API
- 不存用户身份，不存对话历史；session 只在内存里
- 48 小时自动清理（这里用 in-memory + TTL，重启即清；生产可换 Redis）
"""
import os
import time
import uuid
import threading
from typing import Dict, List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from anthropic import Anthropic

from system_prompt import SYSTEM_PROMPT, LETTER_PROMPT

load_dotenv()

# 模型选择：PRD §7.3 默认 Sonnet 4.6；想要更深就上 Opus 4.7
MODEL = os.environ.get("DECISION_ROOM_MODEL", "claude-sonnet-4-6")
MAX_TOKENS = 1500
SESSION_TTL_SECONDS = 48 * 3600   # PRD §7.5：48 小时

client = Anthropic()  # 读 ANTHROPIC_API_KEY

app = FastAPI(title="Decision Room v1.0")

# 小程序前端跨域（开发期）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# —— 极简 KV，按 PRD §7.3：不上数据库 ——
_sessions: Dict[str, dict] = {}
_lock = threading.Lock()


def _now() -> float:
    return time.time()


def _gc():
    """简单的 TTL 清理。每次写入时顺手扫一遍。"""
    cutoff = _now() - SESSION_TTL_SECONDS
    dead = [sid for sid, s in _sessions.items() if s["updated_at"] < cutoff]
    for sid in dead:
        _sessions.pop(sid, None)


# —— 请求 / 响应 ——

class StartReq(BaseModel):
    situation: str = Field(min_length=10, max_length=1000)


class StartResp(BaseModel):
    session_id: str
    stage: int
    ai_text: str


class TurnReq(BaseModel):
    session_id: str
    user_text: str = Field(min_length=1, max_length=2000)


class TurnResp(BaseModel):
    stage: int
    ai_text: str
    finished: bool


class LetterReq(BaseModel):
    session_id: str


class LetterResp(BaseModel):
    letter: str


# —— Claude 调用 ——

def _call_claude(messages: List[dict], system: str = SYSTEM_PROMPT) -> str:
    resp = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=system,
        messages=messages,
    )
    # 拼接 text blocks
    parts = []
    for block in resp.content:
        if getattr(block, "type", None) == "text":
            parts.append(block.text)
    return "".join(parts).strip()


END_TOKEN = "[[END_OF_DIALOGUE]]"


def _detect_stage(messages: List[dict]) -> int:
    """
    用 AI 回复条数粗估当前阶段。和 system prompt 里的节奏对齐：
    - 阶段 1：前 2 条 AI 回复
    - 阶段 2：第 3 条
    - 阶段 3：第 4 条
    - 阶段 4：第 5 条及以后
    """
    ai_count = sum(1 for m in messages if m["role"] == "assistant")
    if ai_count <= 2:
        return 1
    if ai_count == 3:
        return 2
    if ai_count == 4:
        return 3
    return 4


# —— 路由 ——

@app.post("/session/start", response_model=StartResp)
def start(req: StartReq):
    sid = uuid.uuid4().hex
    user_msg = (
        "[这是用户进入产品时输入的处境，请你按 system 中阶段 1 的指示回应——"
        "复述一遍 + 问 1-2 个具体问题]\n\n" + req.situation.strip()
    )
    messages = [{"role": "user", "content": user_msg}]
    try:
        ai_text = _call_claude(messages)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Claude 调用失败: {e}")

    messages.append({"role": "assistant", "content": ai_text})
    with _lock:
        _gc()
        _sessions[sid] = {
            "situation": req.situation.strip(),
            "messages": messages,
            "started_at": _now(),
            "updated_at": _now(),
            "finished": False,
        }
    return StartResp(session_id=sid, stage=1, ai_text=ai_text)


@app.post("/session/turn", response_model=TurnResp)
def turn(req: TurnReq):
    with _lock:
        s = _sessions.get(req.session_id)
    if not s:
        raise HTTPException(status_code=404, detail="session not found or expired")
    if s["finished"]:
        raise HTTPException(status_code=400, detail="session already finished")

    s["messages"].append({"role": "user", "content": req.user_text.strip()})
    try:
        ai_text = _call_claude(s["messages"])
    except Exception as e:
        # 失败时回滚最后一条用户消息，让前端可以重试
        s["messages"].pop()
        raise HTTPException(status_code=502, detail=f"Claude 调用失败: {e}")

    finished = END_TOKEN in ai_text
    if finished:
        ai_text = ai_text.replace(END_TOKEN, "").strip()
        s["finished"] = True

    s["messages"].append({"role": "assistant", "content": ai_text})
    s["updated_at"] = _now()
    stage = _detect_stage(s["messages"])
    return TurnResp(stage=stage, ai_text=ai_text, finished=finished)


@app.post("/session/letter", response_model=LetterResp)
def letter(req: LetterReq):
    with _lock:
        s = _sessions.get(req.session_id)
    if not s:
        raise HTTPException(status_code=404, detail="session not found or expired")

    # 把对话再喂回去 + 写信指令
    duration_min = max(1, int((s["updated_at"] - s["started_at"]) / 60))
    messages = list(s["messages"]) + [
        {
            "role": "user",
            "content": (
                f"[本次对话总时长约 {duration_min} 分钟。请把这个数字填进信里 "
                f"\"我们今天用了 X 分钟\" 的位置。]\n\n" + LETTER_PROMPT
            ),
        }
    ]
    try:
        letter_text = _call_claude(messages)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Claude 调用失败: {e}")

    s["letter"] = letter_text
    s["updated_at"] = _now()
    return LetterResp(letter=letter_text)


@app.get("/health")
def health():
    return {"ok": True, "model": MODEL, "live_sessions": len(_sessions)}
