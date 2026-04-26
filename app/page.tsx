import Link from 'next/link';

import PostList from '@/components/PostList';
import { getAllPosts } from '@/lib/posts';

export default function HomePage() {
  const posts = getAllPosts().slice(0, 5);

  return (
    <div className='mx-auto max-w-page px-6'>
      <section className='py-20 sm:py-28'>
        <p className='mb-6 font-sans text-xs uppercase tracking-[0.3em] text-muted'>刘馨睿 · Xinrui Liu</p>
        <h1 className='font-serif text-4xl leading-tight sm:text-5xl md:text-6xl'>
          天高海阔，
          <br />
          来去自由。
        </h1>
        <p className='mt-8 max-w-prose text-lg leading-relaxed text-muted'>
          GTM for AI in Europe。这里记录我的思考、职场观察与个人成长。不定期更新，欢迎慢慢读。
        </p>
      </section>

      <section className='border-t border-rule pt-16'>
        <div className='mb-10 flex items-baseline justify-between'>
          <h2 className='font-serif text-2xl'>最近的文章</h2>
          <Link href='/writing' className='font-sans text-sm uppercase tracking-widest text-muted hover:text-accent'>
            查看全部 →
          </Link>
        </div>
        <PostList posts={posts} />
      </section>
    </div>
  );
}
