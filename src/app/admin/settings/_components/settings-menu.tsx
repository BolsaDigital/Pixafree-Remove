'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import React from 'react';

import { Select } from '@/components/ui/select';

import { cn } from '@/lib/utils';

const settingsNav = [
  {
    title: 'General',
    url: '/admin/settings/general',
  },
  {
    title: 'Storage',
    url: '/admin/settings/storage',
  },
  {
    title: 'Mail',
    url: '/admin/settings/mail',
  },
  {
    title: 'Billing',
    url: '/admin/settings/billing',
  },
  {
    title: 'AI',
    url: '/admin/settings/ai',
  },
  {
    title: 'Advance',
    url: '/admin/settings/advance',
  },
  {
    title: 'Legal',
    url: '/admin/settings/legal',
  },
];

const SettingsMenu = () => {
  const pathanme = usePathname();
  const router = useRouter();

  return (
    <>
      <ul className="space-y-1 hidden lg:block">
        {settingsNav.map((navItem) => (
          <li key={navItem.url}>
            <Link
              href={navItem.url}
              className={cn(
                'flex text-sm items-center p-2 px-3 h-8 rounded-md font-medium gap-2 hover:bg-accent',
                {
                  'bg-primary/5 text-primary': pathanme === navItem.url,
                },
              )}
            >
              {navItem.title}
            </Link>
          </li>
        ))}
      </ul>
      <Select
        onChange={(e) => {
          if (e.target.value) {
            router.push(e.target.value);
          }
        }}
        defaultValue={pathanme}
        className="w-full lg:hidden"
      >
        {settingsNav.map((navItem) => (
          <option key={navItem.url} value={navItem.url}>
            {navItem.title}
          </option>
        ))}
      </Select>
    </>
  );
};

export default SettingsMenu;
