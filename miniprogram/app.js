// app.js — 决策室 v1.0
App({
  globalData: {
    // 后端基地址：本地开发可填 http://127.0.0.1:8000
    // 上线时替换为部署后的 https 域名（小程序合法域名要在管理后台配）
    apiBase: 'http://127.0.0.1:8000',
    // session 内的对话上下文（用完即走，不持久化）
    session: {
      sessionId: '',
      situation: '',
      messages: [],
      stage: 0,
      letter: ''
    }
  },
  resetSession() {
    this.globalData.session = {
      sessionId: '',
      situation: '',
      messages: [],
      stage: 0,
      letter: ''
    };
  }
});
