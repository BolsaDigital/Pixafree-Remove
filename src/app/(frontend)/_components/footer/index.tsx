'use client';

import { useSettings } from '@/app/_providers/settings-provider';
import Logo from '@/app/admin/_components/logo';
import Link from 'next/link';
import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const settings = useSettings();

  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-center py-12 gap-6">
        <Logo href="/" className="[&>img]:h-10" />
        <div className="text-sm text-muted-foreground text-center">
          Copyright © {currentYear}{' '}
          <Link className="cursor-pointer" href="/">
            {settings?.general.applicationName || ''}
          </Link>
          . All Rights Reserved.
        </div>
        <div className="flex items-center gap-2">
          <Link
            className="cursor-pointer text-sm text-muted-foreground text-center hover:text-foreground hover:underline"
            href="/privacy-policy"
          >
            Privacy Policy
          </Link>
          <span className="mx-2">|</span>
          <Link
            className="cursor-pointer text-sm text-muted-foreground text-center hover:text-foreground hover:underline"
            href="/terms-of-service"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
