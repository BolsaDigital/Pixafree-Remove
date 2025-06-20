'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Background Remover',
    href: '/upload',
  },
  {
    title: 'Pricing',
    href: '/pricing',
  },
  {
    title: 'Blog',
    href: '/blog',
  },
];

export default function HeaderMenu({
  isMenuOpen,
  setIsMenuOpen,
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <div className="hidden lg:flex">
        {menuItems.map((item) => (
          <div key={item.title} className="relative">
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                'flex h-full items-center px-4 py-2 transition text-[15px] font-medium hover:text-primary',
                {
                  'text-primary': pathname === item.href,
                },
              )}
            >
              {item.title}
            </Link>
          </div>
        ))}
      </div>
      <ul
        className={cn(
          'fixed top-[80px] -ml-4 sm:-ml-6 h-[calc(100svh-80px)] w-screen border-t bg-background px-5 py-2 lg:hidden [&_a]:block [&_a]:py-3 [&_a]:font-semibold',
          '-translate-y-3 opacity-0 invisible transition-all overflow-y-auto',
          {
            'translate-y-0 opacity-100 visible': isMenuOpen,
          },
        )}
      >
        {menuItems.map((item) => (
          <li key={item.title} className="mb-2">
            <Link href={item.href} onClick={() => setIsMenuOpen(false)}>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
