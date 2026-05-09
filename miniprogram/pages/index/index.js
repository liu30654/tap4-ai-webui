// pages/index/index.js — 阶段 0：进入
const { startSession } = require('../../utils/api.js');
const app = getApp();

const PROMPT = '你现在，想想清楚什么？';

Page({
  data: {
    promptChars: PROMPT.split(''),
    inputReady: false,
    situation: '',
    canEnter: false,
    loading: false
  },

  onLoad() {
    // 重置 session（用完即走）
    app.resetSession();
    // 等打字机演完再亮出输入框：每字 50ms + 入场 400ms 缓冲
    const total = PROMPT.length * 50 + 600;
    setTimeout(() => this.setData({ inputReady: true }), total);
  },

  onInput(e) {
    const v = e.detail.value || '';
    this.setData({
      situation: v,
      canEnter: v.trim().length >= 20  // 至少 20 字，避免太浅
    });
  },

  async onEnter() {
    if (!this.data.canEnter || this.data.loading) return;
    this.setData({ loading: true });
    try {
      const resp = await startSession(this.data.situation.trim());
      // resp: { session_id, stage, ai_text }
      app.globalData.session = {
        sessionId: resp.session_id,
        situation: this.data.situation.trim(),
        messages: [
          { role: 'user', text: this.data.situation.trim() },
          { role: 'ai', text: resp.ai_text }
        ],
        stage: resp.stage || 1,
        letter: ''
      };
      wx.navigateTo({ url: '/pages/chat/chat' });
    } catch (err) {
      console.error(err);
      wx.showToast({ title: '连接不上后端', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
