'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: '!bg-background !border-input !rounded-2xl !pr-12',
          closeButton: '!right-3 !transform-none !left-auto !top-1/2 !-translate-y-1/2',
        },
      }}
      closeButton
      richColors
      position="bottom-right"
      duration={4000}
      {...props}
    />
  );
};

export { Toaster };
