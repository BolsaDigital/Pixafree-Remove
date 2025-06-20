'use client';

import Logo from '@/app/admin/_components/logo';
import { useProfile, useCredits } from '@/app/admin/profile/_services/profile-hooks';
import { UserResponse } from '@/server/auth/auth-services';
import { IconLogout, IconUser, IconShieldHalfFilled } from '@tabler/icons-react';
import { AlignJustifyIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

import { cn } from '@/lib/utils';

import HeaderMenu from './menu';
import ThemeToggle from './theme-toggle';

const Header = ({ initalUser }: { initalUser?: UserResponse }) => {
  const { user, logout } = useProfile(initalUser);
  const { credits, isLoading: creditsLoading } = useCredits();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header
      className={cn(
        'sticky transition-all z-50 duration-300 border-b border-border/60 top-0 bg-background/90 backdrop-blur-sm',
      )}
    >
      <div className="container flex h-20 items-center justify-between">
        <Logo href="/" className="[&>img]:h-9" />
        <HeaderMenu isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <div className="items-center gap-3 flex">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer">
                <Avatar
                  className={cn('ease-snappy transition-[width]')}
                  name={user?.name || ''}
                  src={user?.avatar || undefined}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 rounded-3xl shadow-lg p-6"
                side="bottom"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 pb-5 text-left text-sm">
                    <Avatar src={user?.avatar || undefined} name={user?.name || ''} />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.name}</span>
                      <span className="truncate text-xs">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>
                  {creditsLoading ? (
                    <Skeleton className="h-6 w-full rounded-md" />
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-left text-sm">
                        <span className="text-lg font-semibold text-primary">{credits}</span>
                        <p className="font-semibold">Credits</p>
                      </div>
                    </>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="py-3 space-y-2">
                  <DropdownMenuItem
                    className="font-medium !bg-transparent hover:!text-primary"
                    asChild
                  >
                    <Link href="/profile">
                      <IconUser className="size-5" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem
                      className="font-medium !bg-transparent hover:!text-primary"
                      asChild
                    >
                      <Link href="/admin">
                        <IconShieldHalfFilled className="size-5" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="!text-destructive font-medium !bg-transparent"
                    onClick={logout}
                  >
                    <IconLogout className="!text-destructive size-5" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link className={buttonVariants({ variant: 'outline' })} href="/login">
                Login
              </Link>
              <Link className={cn(buttonVariants(), 'hidden md:flex')} href="/signup">
                Start Creating
              </Link>
            </>
          )}
          <Button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            size="icon"
            variant="ghost"
            className="lg:hidden"
          >
            <AlignJustifyIcon className="!size-6 stroke-[1.5]" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
