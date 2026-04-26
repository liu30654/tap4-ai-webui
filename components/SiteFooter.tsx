export default function SiteFooter() {
  return (
    <footer className='mt-24 border-t border-rule'>
      <div className='mx-auto flex max-w-page flex-col gap-2 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between'>
        <p>© {new Date().getFullYear()} 你的名字</p>
        <p className='font-sans tracking-wide'>谨以文字记录</p>
      </div>
    </footer>
  );
}
