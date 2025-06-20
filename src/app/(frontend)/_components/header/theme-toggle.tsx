'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import React, { useEffect } from 'react';

import { Button } from '@/components/ui/button';

const ThemeToggle = () => {
  const [isDark, setIsDark] = React.useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (theme === 'dark') {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, [theme]);

  return (
    <Button
      onClick={() => {
        setTheme(isDark ? 'light' : 'dark');
      }}
      size="icon"
      className="mr-1"
      variant="outline"
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
};

export default ThemeToggle;
