'use client';

import { UserResponse } from '@/server/auth/auth-services';
import {
  BoxIcon,
  HouseIcon,
  ImageIcon,
  LayoutListIcon,
  SettingsIcon,
  UsersIcon,
  ClockIcon,
} from 'lucide-react';
import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

import { cn } from '@/lib/utils';

import Logo from '../logo';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';

const overviewNav = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: HouseIcon,
  },
  {
    title: 'Users',
    url: '/admin/users',
    icon: UsersIcon,
  },
  {
    title: 'Posts',
    url: '/admin/posts',
    icon: LayoutListIcon,
  },
  {
    title: 'Media',
    url: '/admin/media',
    icon: ImageIcon,
  },
  {
    title: 'Settings',
    url: '/admin/settings/general',
    icon: SettingsIcon,
  },
];

const billingNav = [
  {
    title: 'Subscriptions',
    url: '/admin/billing/subscriptions',
    icon: ClockIcon,
  },
  {
    title: 'Plans',
    url: '/admin/billing/plans',
    icon: BoxIcon,
  },
];

export function AppSidebar({ user }: { user: UserResponse }) {
  const { open, isMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <Logo
            iconOnly
            href="/admin"
            className={cn('hidden', {
              flex: !open && !isMobile,
            })}
          />
          <Logo
            href="/admin"
            className={cn('p-2', {
              hidden: !open && !isMobile,
            })}
          />
          {open && !isMobile && <SidebarTrigger />}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={overviewNav} title="Platform" />
        <NavMain items={billingNav} title="Billing" />
      </SidebarContent>
      <SidebarFooter>
        {!open && !isMobile && <SidebarTrigger />}
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
