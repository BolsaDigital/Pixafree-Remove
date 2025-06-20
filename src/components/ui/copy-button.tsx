import { Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
  tooltipTitle?: string;
}

export default function CopyButton({ textToCopy, className, tooltipTitle }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [isCopied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className={cn('h-8 w-8', className)}
        >
          {isCopied ? <Check className="size-4 " /> : <Copy className="size-4" />}
          <span className="sr-only">{tooltipTitle || 'Copy to clipboard'}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isCopied ? 'Copied!' : tooltipTitle || 'Copy to clipboard'}</p>
      </TooltipContent>
    </Tooltip>
  );
}
