import MediaTable from '@/app/admin/media/components/media-table';
import type { Editor } from '@tiptap/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ImageEditBlockProps {
  editor: Editor;
  close: () => void;
}

export const ImageEditBlock: React.FC<ImageEditBlockProps> = ({ editor, close }) => {
  const [link, setLink] = React.useState('');
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (link) {
        editor.commands.setImage({ src: link });
        close();
      }
    },
    [editor, link, close],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="image-link">Attach an image link</Label>
        <div className="flex">
          <Input
            id="image-link"
            type="url"
            required
            placeholder="https://example.com"
            value={link}
            className="grow"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLink(e.target.value)}
          />
          <Button type="submit" className="ml-2 h-10">
            Submit
          </Button>
        </div>
      </div>
      <Button type="button" className="w-full h-10" onClick={() => setOpenDialog(true)}>
        Select from media
      </Button>
      <Dialog open={openDialog} onOpenChange={() => setOpenDialog(false)}>
        <DialogContent className="sm:max-w-5xl">
          <div>
            <DialogHeader>
              <DialogTitle className="sr-only">Select Image</DialogTitle>
            </DialogHeader>
            <div className="w-full">
              <MediaTable
                onSelect={(e) => {
                  setOpenDialog(false);
                  close();
                  if (!e) return;
                  editor.commands.setImage({ src: e });
                }}
                allowTypes={['image']}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default ImageEditBlock;
