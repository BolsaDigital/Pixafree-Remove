import { Loader } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function DeleteAlert({
  open,
  onClose,
  onDelete,
  isLoading,
  description,
}: {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  isLoading: boolean;
  description?: string;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(e) => {
        if (!e) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            {description || 'This action cannot be undone. This will permanently deleted.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onDelete}
            variant="destructive"
            className="min-w-[100px]"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="animate-spin" /> : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteAlert;
