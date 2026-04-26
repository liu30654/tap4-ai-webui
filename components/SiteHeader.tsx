import Link from 'next/link';

const navItems = [
  { href: '/', label: '首页' },
  { href: '/writing', label: '文章' },
  { href: '/about', label: '关于' },
  { href: '/contact', label: '联系' },
];

export default function SiteHeader() {
  return (
    <header className='border-b border-rule'>
      <div className='mx-auto flex max-w-page items-baseline justify-between px-6 py-8 sm:py-10'>
        <Link href='/' className='font-serif text-xl tracking-wide sm:text-2xl'>
          刘馨睿
        </Link>
        <nav>
          <ul className='flex gap-6 font-serif text-sm sm:gap-8 sm:text-base'>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className='hover:text-accent'>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
