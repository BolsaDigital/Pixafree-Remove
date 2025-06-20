'use client';

import { Trash2Icon } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import MediaTable from './media-table';

const ImagePicker = ({
  value,
  onChange,
  allowTypes = ['image'],
}: {
  value?: string;
  onChange?: (e?: string) => void;
  allowTypes?: string[];
}) => {
  const [openDialog, setOpenDialog] = React.useState(false);

  return (
    <div>
      {value ? (
        <div className="size-[50px] relative overflow-hidden bg-muted flex items-center justify-center bg-transparent-image">
          <Image
            src={value}
            width={60}
            height={60}
            alt="Image"
            className="max-w-full object-contain"
          />
          <Button
            variant="secondary"
            size="sm"
            className="absolute size-5 top-1 right-1 !p-0 rounded-xs"
            onClick={() => onChange?.()}
          >
            <Trash2Icon className="size-3" />
          </Button>
        </div>
      ) : (
        <Button variant="secondary" onClick={() => setOpenDialog(true)}>
          Choose from gallery
        </Button>
      )}
      <Dialog open={openDialog} onOpenChange={() => setOpenDialog(false)}>
        <DialogContent className="sm:max-w-5xl">
          <div>
            <DialogHeader>
              <DialogTitle className="sr-only">Select Image</DialogTitle>
            </DialogHeader>
            <div className="w-full">
              <MediaTable
                onSelect={(e) => {
                  onChange?.(e);
                  setOpenDialog(false);
                }}
                allowTypes={allowTypes}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImagePicker;
