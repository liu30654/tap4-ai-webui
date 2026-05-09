// pages/letter/letter.js — 信
const app = getApp();

Page({
  data: {
    letter: '',
    paragraphs: [],
    paperOpen: false,
    actionsReady: false,
    canvas: { w: 375, h: 1200 }
  },

  onLoad() {
    const letter = (app.globalData.session.letter || '').trim();
    if (!letter) {
      wx.redirectTo({ url: '/pages/index/index' });
      return;
    }
    // 分段浮现
    const paragraphs = letter.split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
    this.setData({ letter, paragraphs });
    // 信纸展开
    setTimeout(() => this.setData({ paperOpen: true }), 200);
    // 等所有段都浮现完，再亮按钮
    const total = 600 + paragraphs.length * 600 + 1200;
    setTimeout(() => this.setData({ actionsReady: true }), total);
  },

  onCopy() {
    wx.setClipboardData({
      data: this.data.letter,
      success: () => wx.showToast({ title: '已复制', icon: 'none' })
    });
  },

  onSaveImage() {
    // 把信文绘到 canvas 再保存
    const sysInfo = wx.getSystemInfoSync();
    const dpr = sysInfo.pixelRatio || 2;
    const W = 750;            // px 设计宽度（rpx 的 1:1 也凑合，这里用 px）
    const padding = 60;
    const fontSize = 30;
    const lineHeight = 56;
    const text = this.data.letter;

    // 估算高度
    const ctx = wx.createCanvasContext('letter-canvas', this);
    ctx.setFillStyle('#FFFDF8');
    // 先按宽度分行
    const lines = this._wrapText(text, W - padding * 2, fontSize);
    const H = padding * 2 + lines.length * lineHeight;

    this.setData({ canvas: { w: W, h: H } }, () => {
      const ctx2 = wx.createCanvasContext('letter-canvas', this);
      ctx2.setFillStyle('#FFFDF8');
      ctx2.fillRect(0, 0, W, H);
      ctx2.setFillStyle('#3C3530');
      ctx2.setFontSize(fontSize);
      ctx2.setTextBaseline('top');
      lines.forEach((line, i) => {
        ctx2.fillText(line, padding, padding + i * lineHeight);
      });
      ctx2.draw(false, () => {
        setTimeout(() => {
          wx.canvasToTempFilePath({
            canvasId: 'letter-canvas',
            success: (res) => {
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: () => wx.showToast({ title: '已存到相册', icon: 'none' }),
                fail: (e) => {
                  if (e.errMsg && e.errMsg.indexOf('auth') >= 0) {
                    wx.showToast({ title: '需要相册权限', icon: 'none' });
                  } else {
                    wx.showToast({ title: '保存失败', icon: 'none' });
                  }
                }
              });
            },
            fail: () => wx.showToast({ title: '生成失败', icon: 'none' })
          }, this);
        }, 200);
      });
    });
  },

  _wrapText(text, maxWidth, fontSize) {
    // 简版换行：按字符宽估算（中文 = fontSize, 英文 ≈ 0.55*fontSize）
    const lines = [];
    text.split('\n').forEach(raw => {
      let buf = '';
      let w = 0;
      for (const ch of raw) {
        const cw = /[\x00-\xff]/.test(ch) ? fontSize * 0.55 : fontSize;
        if (w + cw > maxWidth) {
          lines.push(buf);
          buf = ch;
          w = cw;
        } else {
          buf += ch;
          w += cw;
        }
      }
      lines.push(buf);
    });
    return lines;
  },

  onRestart() {
    app.resetSession();
    wx.reLaunch({ url: '/pages/index/index' });
  }
});
