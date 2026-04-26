import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='mx-auto max-w-prose px-6 py-32 text-center'>
      <p className='mb-4 font-sans text-xs uppercase tracking-[0.3em] text-muted'>404</p>
      <h1 className='mb-6 font-serif text-4xl sm:text-5xl'>页面走丢了</h1>
      <p className='mb-12 text-muted'>你要找的内容也许已经被搬走了，或者它从来就不在这里。</p>
      <Link href='/' className='font-sans text-sm uppercase tracking-widest underline underline-offset-4 hover:text-accent'>
        回到首页
      </Link>
    </div>
  );
}
