'use client';

import { ALLOWED_IMAGE_TYPES } from '@/config/constants';
import { ChevronDownIcon, Loader2, PlusIcon, XIcon } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';

import { useRemoveBg } from '../../_services/removebg-hooks';

const BgRemoveBox = () => {
  const {
    onDrop,
    image,
    onClear,
    onChange,
    isLoading,
    showOrignal,
    setShowOrignal,
    progress,
    inputRef,
    downloadPremium,
    premiumDownloadMutation,
  } = useRemoveBg();

  return (
    <div
      className="z-[1] max-w-full w-[650px]"
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {!isLoading && image?.result && (
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="bg-accent rounded-md p-1">
            <Button
              className={cn('h-8', {
                'shadow-md !bg-card': showOrignal,
              })}
              variant="ghost"
              onClick={() => setShowOrignal(true)}
            >
              Before
            </Button>
            <Button
              className={cn('h-8', {
                'shadow-md !bg-card': !showOrignal,
              })}
              variant="ghost"
              onClick={() => setShowOrignal(false)}
            >
              After
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                Download <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[250px] rounded-2xl shadow-lg p-3 gap-2 flex flex-col">
              <DropdownMenuItem
                onClick={() => {
                  window.open(image?.result?.preview, '_blank');
                }}
                className="flex items-center rounded-full px-5 transition-all py-2 pr-4"
              >
                <div>
                  <p className="text-[13px] font-semibold">Preview</p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {image?.result?.previewWidth || 0} x {image?.result?.previewHeight || 0}
                  </p>
                </div>
                <Badge className="ml-auto" variant="secondary">
                  Free
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  downloadPremium();
                }}
                className="flex items-center rounded-full px-5 transition-all py-2 pr-4"
              >
                <div>
                  <p className="text-[13px] font-semibold">Max Quality</p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {image?.result?.outputWidth || 0} x {image?.result?.outputHeight || 0}
                  </p>
                </div>
                <Badge
                  className="ml-auto bg-primary text-primary-foreground h-6 w-17"
                  variant="default"
                >
                  {premiumDownloadMutation.isPending ? (
                    <Loader2 className="animate-spin text-primary-foreground size-4" />
                  ) : (
                    'Premium'
                  )}
                </Badge>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <div className="flex relative items-center flex-col justify-center gap-5 border-2 shadow-xl border-card dark:border-input rounded-2xl bg-[repeating-conic-gradient(var(--accent)_0_25%,transparent_0_50%)] bg-[length:20px_20px] w-full h-[300px] sm:h-[450px]">
        {image ? (
          <>
            <Image
              src={showOrignal || !image?.result?.preview ? image.preview : image?.result?.preview}
              alt="image"
              className="object-contain w-auto h-full"
              unoptimized
              width={1000}
              height={1000}
            />
            <Button
              variant="outline"
              className="absolute top-4 right-4 p-0 size-8 z-[1]"
              onClick={onClear}
            >
              <XIcon className="stroke-[3px]" />
            </Button>
            {isLoading && (
              <div className="absolute z-[2] bg-background/60 inset-0 flex flex-col justify-center items-center">
                <div className="bg-background rounded-md p-2">
                  <Loader2 className="animate-spin text-primary size-7" />
                </div>
                <p className="text-xs font-semibold mt-2 text-center drop-shadow-md">
                  {progress < 100 ? `Uploading ${progress}%` : 'Processing...'}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <Button asChild size="lg" className="h-12 px-4 font-semibold rounded-xl">
              <label htmlFor="file-upload">
                <div className="bg-accent/10 rounded-full p-1">
                  <PlusIcon className="stroke-[3px]" />
                </div>
                Start from a photo
              </label>
            </Button>
            <input
              type="file"
              id="file-upload"
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              onChange={onChange}
              className="hidden"
              ref={inputRef}
            />
            <p className="font-semibold">Or drop an image here</p>
          </>
        )}
      </div>
      <div className="flex flex-col items-center justify-center gap-4 mt-10 text-center max-w-[400px] mx-auto">
        <p className="text-xs mt-3 text-muted-foreground">
          By uploading an image you agree to our{' '}
          <a className="font-semibold text-primary hover:underline" href="#">
            Terms of Service
          </a>
          . For more details on processing and your rights, check our{' '}
          <a className="font-semibold text-primary hover:underline" href="#">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default BgRemoveBox;
