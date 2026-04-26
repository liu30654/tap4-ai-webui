import type { Metadata } from 'next';
import { EB_Garamond, Inter } from 'next/font/google';

import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';

import './globals.css';

const serif = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: '你的名字 — 写作',
    template: '%s · 你的名字',
  },
  description: '一个记录写作的个人网站。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='zh-CN' className={`${serif.variable} ${sans.variable}`}>
      <body className='flex min-h-screen flex-col'>
        <SiteHeader />
        <main className='flex-1'>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
