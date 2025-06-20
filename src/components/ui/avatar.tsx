'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';

import { cn } from '@/lib/utils';

const defaultColors = ['#A62A21', '#7e3794', '#0B51C1', '#3A6024', '#A81563', '#B3003C'];

function _stringAsciiPRNG(value: string, m: number) {
  const charCodes = [...value].map((letter) => letter.charCodeAt(0));
  const len = charCodes.length;

  const a = (len % (m - 1)) + 1;
  const c = charCodes.reduce((current, next) => current + next) % m;

  let random = charCodes[0] % m;
  for (let i = 0; i < len; i++) random = (a * random + c) % m;

  return random;
}

export function getRandomColor(value: string, colors = defaultColors) {
  // if no value is passed, always return transparent color otherwise
  // a rerender would show a new color which would will
  // give strange effects when an interface is loading
  // and gets rerendered a few consequent times
  if (!value) return 'transparent';

  // value based random color index
  // the reason we don't just use a random number is to make sure that
  // a certain value will always get the same color assigned given
  // a fixed set of colors
  const colorIndex = _stringAsciiPRNG(value, colors.length);

  return colors[colorIndex];
}

export function getNameInitials(name: string) {
  if (!name || name.length < 3) return '';

  const [firstName, lastName] = name.split(' ');

  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  }

  return `${firstName.charAt(0)}${firstName.charAt(1)}`;
}

const AvatarWrapper = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn('relative flex h-9 w-9 shrink-0 overflow-hidden rounded-md', className)}
    {...props}
  />
));
AvatarWrapper.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square object-cover h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted',
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    src?: string;
    name: string;
  }
>(({ src, name, ...props }, ref) => {
  return (
    <AvatarWrapper {...props} ref={ref}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback
        className="rounded-lg text-white"
        style={{
          backgroundColor: getRandomColor(name),
        }}
      >
        {getNameInitials(name)}
      </AvatarFallback>
    </AvatarWrapper>
  );
});
Avatar.displayName = 'Avatar';

export { AvatarWrapper, AvatarImage, AvatarFallback, Avatar };
