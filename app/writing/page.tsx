import type { Metadata } from 'next';

import PostList from '@/components/PostList';
import { getAllPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: '文章',
  description: '所有文章列表',
};

export default function WritingPage() {
  const posts = getAllPosts();
  return (
    <div className='mx-auto max-w-page px-6 py-16 sm:py-20'>
      <header className='mb-14'>
        <p className='mb-4 font-sans text-xs uppercase tracking-[0.3em] text-muted'>Writing</p>
        <h1 className='font-serif text-4xl sm:text-5xl'>文章</h1>
      </header>
      <PostList posts={posts} />
    </div>
  );
}
