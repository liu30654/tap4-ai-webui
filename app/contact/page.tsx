import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '联系',
  description: '联系方式',
};

export default function ContactPage() {
  return (
    <div className='mx-auto max-w-prose px-6 py-16 sm:py-24'>
      <header className='mb-14'>
        <p className='mb-4 font-sans text-xs uppercase tracking-[0.3em] text-muted'>Contact</p>
        <h1 className='font-serif text-4xl sm:text-5xl'>联系</h1>
      </header>
      <div className='space-y-8 font-serif text-lg leading-relaxed'>
        <p>欢迎来信。无论是关于某篇文章、关于写作本身，还是只想说一句&ldquo;读到了&rdquo;，我都很乐意收到。</p>
        <dl className='space-y-4'>
          <div>
            <dt className='font-sans text-xs uppercase tracking-widest text-muted'>邮箱</dt>
            <dd className='mt-1'>
              <a href='mailto:hello@example.com' className='underline underline-offset-4 hover:text-accent'>
                hello@example.com
              </a>
            </dd>
          </div>
          <div>
            <dt className='font-sans text-xs uppercase tracking-widest text-muted'>社交</dt>
            <dd className='mt-1 text-muted'>暂无公开账号</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
