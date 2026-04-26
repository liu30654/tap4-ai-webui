import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于',
  description: '关于刘馨睿(Xinrui Liu)',
};

export default function AboutPage() {
  return (
    <div className='mx-auto max-w-prose px-6 py-16 sm:py-24'>
      <header className='mb-14'>
        <p className='mb-4 font-sans text-xs uppercase tracking-[0.3em] text-muted'>About</p>
        <h1 className='font-serif text-4xl sm:text-5xl'>关于</h1>
      </header>
      <article className='prose prose-lg max-w-none'>
        <p>
          你好,我是<strong>刘馨睿</strong>(Xinrui Liu)。
          目前在欧洲做 AI 行业的 GTM(Go-to-Market)。
        </p>
        <p>CUPL → 北大 → Northwestern。</p>
        <p>这里收录我写下的随笔与片段——关于<em>思考</em>、<em>职场观察</em>与<em>个人成长</em>。不定期更新,欢迎慢慢读。</p>
        <p>写作于我更像是一种整理的方式。把日常里飘忽的念头落到纸上,看清楚它们的形状,再让它们慢慢沉淀。</p>
        <hr />
        <h2>联系</h2>
        <ul>
          <li>
            邮箱:<a href='mailto:liux30654@gmail.com'>liux30654@gmail.com</a>
          </li>
          <li>微信:L5986428794</li>
          <li>即刻:Grace_Liu</li>
          <li>小红书号:299300429</li>
        </ul>
        <p className='!mt-12 text-center font-serif italic text-muted'>天高海阔,来去自由。</p>
      </article>
    </div>
  );
}
