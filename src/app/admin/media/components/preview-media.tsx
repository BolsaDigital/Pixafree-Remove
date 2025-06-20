import { Media } from '@prisma/client';
import { LinkIcon } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

import { formatFileSize } from '@/lib/utils';

const PreviewMediaDialog = ({
  media,
  open,
  onCLose,
}: {
  media: Media | null;
  open: boolean;
  onCLose: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={() => onCLose(false)}>
      <DialogContent className="p-0 overflow-hidden border-0 gap-0 min-h-[300px] min-w-[300px] max-w-[calc(100vw-30px)] md:max-w-[700px] lg:max-w-[1000px]">
        <DialogTitle className="sr-only">Preview Media</DialogTitle>
        <div className="flex items-center justify-center flex-col overflow-y-auto bg-accent">
          {media?.mimeType.startsWith('image/') ? (
            <Image
              src={media?.url}
              alt={media?.name}
              width={1000}
              height={600}
              className="size-full object-contain"
            />
          ) : media?.mimeType.startsWith('video/') ? (
            <video src={media?.url} controls className="size-full object-contain" />
          ) : (
            <div>
              <p>{media?.name}</p>
              <p>{formatFileSize(media?.size || 0)}</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 p-4 py-3">
          <p className="truncate max-w-[250px] md:max-w-[500px]">
            <a
              href={media?.url}
              className="hover:underline font-medium text-accent-foreground/80"
              target="_blank"
              rel="noreferrer"
            >
              {media?.name}
              <LinkIcon className="size-4 inline-block ml-1" />
            </a>
          </p>
          <Button variant="secondary" onClick={() => onCLose(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewMediaDialog;
