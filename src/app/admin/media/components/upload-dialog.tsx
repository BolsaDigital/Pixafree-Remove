import React from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import UploadBox from './upload-box';

const UploadDialog = ({
  openUploadDialog,
  setOpenUploadDialog,
}: {
  openUploadDialog: boolean;
  setOpenUploadDialog: (open: boolean) => void;
}) => {
  return (
    <Dialog open={openUploadDialog} onOpenChange={() => setOpenUploadDialog(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <UploadBox />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
