'use client';

import type React from 'react';
import { useState, useEffect } from 'react';

import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  labelClassName?: string;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  color?: string;
  bgColor?: string;
  label?: React.ReactNode;
}

export default function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  labelClassName,
  showValue = true,
  valuePrefix = '',
  valueSuffix = '%',
  color = 'var(--primary)',
  bgColor = 'var(--muted)',
  label,
}: CircularProgressProps) {
  const [progress, setProgress] = useState(0);

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(value);
    }, 100);

    return () => clearTimeout(timer);
  }, [value]);

  // Calculate SVG parameters
  const normalizedValue = Math.min(Math.max(progress, 0), max);
  const percentage = (normalizedValue / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={`fill-none`}
          style={{ stroke: bgColor }}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={`fill-none transition-all duration-500 ease-out`}
          style={{ stroke: color }}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Center label */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center flex-col text-center',
          labelClassName,
        )}
      >
        {showValue && (
          <span className="font-medium">
            {valuePrefix}
            {Math.round(percentage)}
            {valueSuffix}
          </span>
        )}
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}
