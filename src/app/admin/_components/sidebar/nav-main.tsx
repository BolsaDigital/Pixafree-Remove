'use client';

import { type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { cn } from '@/lib/utils';

export function NavMain({
  title,
  items,
}: {
  title: string;
  items: {
    title: string;
    url?: string;
    icon?: LucideIcon;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="py-2">
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              className={cn(
                'relative overflow-visible after:content-[""] after:absolute after:h-[calc(100%-8px)] after:top-[4px] after:rounded-tr-xl after:rounded-br-xl after:-left-[12px] after:w-[3px] after:bg-transparent',
                {
                  'after:bg-primary': pathname === item.url,
                },
              )}
              isActive={pathname === item.url}
              asChild
            >
              <Link href={item.url || ''}>
                {item.icon && <item.icon className="!size-[18px]" />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
