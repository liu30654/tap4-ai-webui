import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于',
  description: '关于作者',
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
          你好，我是<strong>你的名字</strong>。这里是我整理写作的地方——
          一些随笔、一些片段，关于我看见的、读过的、想过的事。
        </p>
        <p>
          写作于我更像是一种整理的方式。把日常里飘忽的念头落到纸上，看清楚它们的形状，再让它们慢慢沉淀。
          这个网站没有目的，也不追求频率，只想留一个安静的地方，让文字自己说话。
        </p>
        <p>
          欢迎读，也欢迎写信给我。
        </p>
        <hr />
        <h2>联系</h2>
        <ul>
          <li>邮箱：<a href='mailto:hello@example.com'>hello@example.com</a></li>
          <li>其他：暂无</li>
        </ul>
      </article>
    </div>
  );
}
