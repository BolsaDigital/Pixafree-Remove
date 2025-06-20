'use client';

import { useSettings } from '@/app/_providers/settings-provider';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { cn } from '@/lib/utils';

const Logo = ({
  href,
  className,
  iconOnly,
}: {
  href?: string;
  className?: string;
  iconOnly?: boolean;
}) => {
  const settings = useSettings();
  const applicationName = settings?.general.applicationName;
  const logo = settings?.general?.logo;
  const darkLogo = settings?.general?.darkLogo;
  const iconLogo = settings?.general?.iconLogo;
  const iconLogoDark = settings?.general?.iconLogoDark;

  return (
    <Link
      href={href || '/'}
      className={cn('flex items-center justify-start text-xl font-semibold', className)}
    >
      {!iconOnly ? (
        <>
          {logo ? (
            <>
              <Image
                className={cn('dark:hidden object-contain h-8 w-auto')}
                src={logo}
                alt={applicationName || ''}
                unoptimized
                height={100}
                width={300}
              />
              <Image
                className={cn('hidden dark:block object-contain h-8 w-auto')}
                src={darkLogo || logo}
                alt={applicationName || ''}
                unoptimized
                height={100}
                width={300}
              />
            </>
          ) : (
            <span className="block">{applicationName || 'Logo'}</span>
          )}
        </>
      ) : (
        <>
          {iconLogo || logo ? (
            <>
              <Image
                className={cn('dark:hidden size-8 object-contain')}
                src={iconLogo || logo || ''}
                alt={applicationName || ''}
                unoptimized
                height={100}
                width={100}
              />
              <Image
                className={cn('hidden dark:block size-8 object-contain')}
                src={iconLogoDark || iconLogo || darkLogo || logo || ''}
                alt={applicationName || ''}
                unoptimized
                height={100}
                width={100}
              />
            </>
          ) : (
            <span className="flex items-center justify-center size-8 bg-accent rounded-md text-md">
              {applicationName?.substring(0, 2).toUpperCase() || 'LG'}
            </span>
          )}
        </>
      )}
    </Link>
  );
};

export default Logo;
