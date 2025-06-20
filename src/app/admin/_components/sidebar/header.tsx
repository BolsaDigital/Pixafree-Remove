'use client';

import React from 'react';

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

import { cn } from '@/lib/utils';

import Logo from '../logo';

const DashboardHeader = () => {
  const { isMobile } = useSidebar();

  return (
    <div
      className={cn('hidden py-4 border-b', {
        flex: isMobile,
      })}
    >
      <div className="container flex items-center justify-between gap-4">
        <Logo />
        <SidebarTrigger className="[&>svg]:!size-5" />
      </div>
    </div>
  );
};

export default DashboardHeader;
