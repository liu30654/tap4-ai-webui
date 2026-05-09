// utils/api.js — 后端调用封装
// PRD §7.2：小程序前端 → 轻量后端 → Anthropic Claude API
// 流式输出在小程序里 wx.request 默认不支持 SSE；
// 这里用普通 POST 拿到完整段落，前端再做"逐字浮现"伪流式（PRD §6.4）。

const app = getApp();

function post(path, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.apiBase + path,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data,
      timeout: 60000,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error('HTTP ' + res.statusCode + ': ' + JSON.stringify(res.data)));
        }
      },
      fail(err) { reject(err); }
    });
  });
}

// 启动一段对话：把"处境"交给后端，后端返回阶段 1 的复述 + 提问
function startSession(situation) {
  return post('/session/start', { situation });
}

// 推进一轮对话：把用户回答给后端，后端推进到下一阶段
function nextTurn(sessionId, userText) {
  return post('/session/turn', { session_id: sessionId, user_text: userText });
}

// 生成"信"
function generateLetter(sessionId) {
  return post('/session/letter', { session_id: sessionId });
}

module.exports = { startSession, nextTurn, generateLetter };
