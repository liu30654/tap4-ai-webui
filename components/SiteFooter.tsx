export default function SiteFooter() {
  return (
    <footer className='mt-24 border-t border-rule'>
      <div className='mx-auto flex max-w-page flex-col gap-2 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between'>
        <p>© {new Date().getFullYear()} 刘馨睿 · Xinrui Liu</p>
        <p className='font-serif italic tracking-wide'>天高海阔,来去自由。</p>
      </div>
    </footer>
  );
}
