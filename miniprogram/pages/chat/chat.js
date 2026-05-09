// pages/chat/chat.js — 阶段 1-4 对话 + 进入"信"
const { nextTurn, generateLetter } = require('../../utils/api.js');
const app = getApp();

const STAGE_HINT = {
  1: '阶段 1 · 看见你的处境',
  2: '阶段 2 · 看见你看不见的',
  3: '阶段 3 · 暴露隐藏的成本',
  4: '阶段 4 · 找到具体的下一步'
};

Page({
  data: {
    messages: [],     // [{ id, role: 'ai'|'user', text, chars }]
    draft: '',
    stage: 1,
    stageHint: STAGE_HINT[1],
    canType: false,   // 等 AI 说完再允许输入
    sending: false,
    thinking: false,
    scrollAnchor: 'bottom'
  },

  onLoad() {
    const session = app.globalData.session;
    if (!session.sessionId) {
      // 没有 session，回首页
      wx.redirectTo({ url: '/pages/index/index' });
      return;
    }
    // 把进入页带过来的两条消息渲染出来
    const msgs = session.messages.map((m, i) => this._buildMsg(m.role, m.text, i));
    this.setData({
      messages: msgs,
      stage: session.stage,
      stageHint: STAGE_HINT[session.stage] || ''
    });
    // 给 AI 的逐字浮现一点时间，再开放输入
    this._scheduleUnlock(msgs[msgs.length - 1]);
  },

  _buildMsg(role, text, id) {
    return {
      id: 'm' + id + '-' + Date.now(),
      role,
      text,
      chars: role === 'ai' ? text.split('') : []
    };
  },

  _scheduleUnlock(msg) {
    if (!msg || msg.role !== 'ai') {
      this.setData({ canType: true });
      return;
    }
    // 至少等到逐字动画 + 500ms 呼吸停顿（PRD §6.4）
    const t = msg.chars.length * 30 + 500;
    this.setData({ canType: false });
    setTimeout(() => this.setData({ canType: true }), t);
    // 滚动到底部
    this.setData({ scrollAnchor: '' });
    setTimeout(() => this.setData({ scrollAnchor: 'bottom' }), 30);
  },

  onInput(e) {
    this.setData({ draft: e.detail.value || '' });
  },

  async onSend() {
    if (!this.data.canType || this.data.sending) return;
    const text = this.data.draft.trim();
    if (!text) return;

    // 推入用户消息
    const messages = this.data.messages.concat([
      this._buildMsg('user', text, this.data.messages.length)
    ]);
    this.setData({
      messages,
      draft: '',
      sending: true,
      thinking: true,
      canType: false,
      scrollAnchor: ''
    });
    setTimeout(() => this.setData({ scrollAnchor: 'bottom' }), 30);

    // 把这轮也写到 globalData，方便后端无状态时回放
    app.globalData.session.messages = messages.map(m => ({ role: m.role, text: m.text }));

    try {
      const resp = await nextTurn(app.globalData.session.sessionId, text);
      // resp: { stage, ai_text, finished }
      const newStage = resp.stage || this.data.stage;
      const aiMsg = this._buildMsg('ai', resp.ai_text, messages.length);
      const next = messages.concat([aiMsg]);
      this.setData({
        messages: next,
        stage: newStage,
        stageHint: STAGE_HINT[newStage] || '',
        thinking: false,
        sending: false
      });
      app.globalData.session.stage = newStage;
      app.globalData.session.messages = next.map(m => ({ role: m.role, text: m.text }));
      this._scheduleUnlock(aiMsg);

      // 阶段 4 用户回完最后一题，后端 finished=true，跳转生成信
      if (resp.finished) {
        // 给最后一段话留一点呼吸再跳
        const t = aiMsg.chars.length * 30 + 1200;
        setTimeout(() => this._goLetter(), t);
      }
    } catch (err) {
      console.error(err);
      this.setData({ sending: false, thinking: false, canType: true });
      wx.showToast({ title: '网络断了一下，再试一次', icon: 'none' });
    }
  },

  async _goLetter() {
    wx.showLoading({ title: '正在写信……', mask: true });
    try {
      const resp = await generateLetter(app.globalData.session.sessionId);
      app.globalData.session.letter = resp.letter || '';
      wx.hideLoading();
      wx.redirectTo({ url: '/pages/letter/letter' });
    } catch (err) {
      wx.hideLoading();
      console.error(err);
      wx.showToast({ title: '信暂时写不出，再试一次', icon: 'none' });
    }
  }
});
