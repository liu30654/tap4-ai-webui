import Link from 'next/link';

import { formatDate, type PostMeta } from '@/lib/posts';

export default function PostList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) {
    return <p className='text-muted'>还没有发布的文章。</p>;
  }
  return (
    <ul className='divide-y divide-rule'>
      {posts.map((post) => (
        <li key={post.slug} className='py-8 first:pt-0'>
          <article>
            <p className='mb-2 font-sans text-xs uppercase tracking-widest text-muted'>{formatDate(post.date)}</p>
            <h2 className='font-serif text-2xl leading-snug'>
              <Link href={`/writing/${post.slug}`} className='hover:text-accent'>
                {post.title}
              </Link>
            </h2>
            {post.excerpt && <p className='mt-3 text-muted'>{post.excerpt}</p>}
          </article>
        </li>
      ))}
    </ul>
  );
}
