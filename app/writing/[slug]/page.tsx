import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { formatDate, getAllSlugs, getPost } from '@/lib/posts';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <div className='mx-auto max-w-prose px-6 py-16 sm:py-24'>
      <Link
        href='/writing'
        className='mb-12 inline-block font-sans text-xs uppercase tracking-widest text-muted hover:text-accent'
      >
        ← 返回文章
      </Link>

      <header className='mb-12 border-b border-rule pb-10'>
        <p className='mb-4 font-sans text-xs uppercase tracking-[0.3em] text-muted'>{formatDate(post.date)}</p>
        <h1 className='font-serif text-3xl leading-snug sm:text-4xl'>{post.title}</h1>
      </header>

      <article className='prose prose-lg max-w-none'>
        <Markdown remarkPlugins={[remarkGfm]}>{post.content}</Markdown>
      </article>
    </div>
  );
}
