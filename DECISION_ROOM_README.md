# 决策室 v1.0 — 微信小程序 + FastAPI 后端

> 按《决策室 PRD v1.0（极简版）》落地的最小可跑版本。
> 4 个对话阶段 + 一封信，用完即走，不存身份。

## 目录

```
miniprogram/   # 微信小程序前端（原生小程序，无需打包工具）
  app.js / app.json / app.wxss
  pages/
    index/    # 阶段 0：进入
    chat/     # 阶段 1-4：对话
    letter/   # 阶段 5：信
  utils/api.js

backend/       # 轻量后端
  main.py            # FastAPI 路由
  system_prompt.py   # AI 角色 + 工具调度规则 + 信模板（产品的灵魂）
  requirements.txt
  .env.example
```

## 1. 跑后端

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# 把 ANTHROPIC_API_KEY 填进去
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

健康检查：

```bash
curl http://127.0.0.1:8000/health
# {"ok":true,"model":"claude-sonnet-4-6","live_sessions":0}
```

API：

| 路由 | 作用 |
|---|---|
| `POST /session/start` | 用户输入处境，返回 AI 阶段 1 回复 |
| `POST /session/turn`  | 推进一轮对话；阶段 4 结束时 `finished=true` |
| `POST /session/letter`| 生成那封信 |

## 2. 跑小程序

1. 打开微信开发者工具 → 导入项目 → 选 `miniprogram/` 目录。
2. AppID 填测试号或自己的。
3. 开发期：`miniprogram/app.js` 里 `apiBase` 默认 `http://127.0.0.1:8000`，
   在开发者工具的"详情 → 本地设置"里勾选 **"不校验合法域名"**。
4. 上线前：把 `apiBase` 改成你部署的 https 域名，并在小程序后台
   "开发管理 → 服务器域名"里把它加进 request 合法域名。

## 3. 设计契约（PRD 摘要）

- **唯一目标用户**：法律人面临"要不要去 AI 公司"的决策点。
- **总时长**：18-22 分钟（少于 15 太浅，多于 25 在拖延）。
- **AI 行为铁律**：
  - 一次只问 1-2 个问题，等用户答。
  - 不下结论、不鸡汤、不说"研究表明"。
  - 工具的名字 / 来源永远不暴露给用户。
- **数据策略**：
  - 不存账号、不存历史。
  - session 仅在内存里，48 小时 TTL（生产环境可换 Redis）。
- **视觉调性**：米白 `#FAF7F2`、深灰棕 `#3C3530`、雾蓝 `#6B8E9F`，思源宋体，逐字浮现，没有进度条 / 完成度。

## 4. 这个 v1.0 不做的事

照 PRD §8：用户账号、历史对话、PDF 导出、推送、付费、多语言、分享按钮、
"3 个月后回信"、用户选工具、心情记录——**都不做**。

## 5. 验收前自查（PRD §9）

- [ ] 全程 ≤ 25 分钟
- [ ] 阶段 2 / 3 各只用 1 个工具
- [ ] 工具名字 / 理论来源**未出现**在用户可见文本中
- [ ] 信符合模板（§5.2）和语气铁律（§5.3）
- [ ] session 在 48 小时内清除

## 6. 后续

如果种子用户反馈好：
- 不要急着加功能，先把 system prompt 调细。
- 任何新功能进 v2，先删一个旧功能。

— 张小龙式克制。
