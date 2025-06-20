import { ALLOWED_ADMIN_UPLOAD_TYPES } from '@/config/constants';
import { CirclePlus, FileIcon, VideoIcon, XIcon } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import CircularProgress from '@/components/ui/circular-progress';

import { cn, formatFileSize } from '@/lib/utils';

import { useUploadFiles } from '../_services/media-hooks';

const UploadFiles = ({
  file,
  isUploading,
  progress = 0,
  onCancel,
  isUploaded,
  error,
}: {
  file: File;
  isUploading?: boolean;
  progress?: number;
  onCancel?: () => void;
  isUploaded?: boolean;
  error?: string;
}) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  return (
    <div className="flex gap-3 items-center border rounded-md p-2">
      {preview ? (
        <Image
          src={preview}
          width={50}
          height={50}
          className="size-10 min-w-10 rounded-md object-cover"
          alt="Preview"
        />
      ) : (
        <div className="size-10 min-w-10 flex items-center justify-center bg-gray-200 text-gray-500 rounded-md">
          <span className="text-xl">
            {file.type.startsWith('video') ? (
              <VideoIcon className="size-4" />
            ) : (
              <FileIcon className="size-4" />
            )}
          </span>
        </div>
      )}
      <div>
        <div className="font-medium truncate max-w-[100px] sm:max-w-[200px]">{file.name}</div>
        <div className="text-xs">
          {error ? (
            <p className="text-destructive truncate">{error}</p>
          ) : (
            <p className="text-muted-foreground font-medium">{formatFileSize(file.size)}</p>
          )}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {isUploading ? (
          <CircularProgress
            value={progress}
            size={40}
            strokeWidth={3}
            labelClassName="text-[10px]"
          />
        ) : (
          <p
            className={cn('border border-dashed rounded-sm px-1 py-0.5 text-xs font-medium', {
              'border-success/40 text-success': isUploaded,
              'border-destructive/40 text-destructive': error,
            })}
          >
            {isUploaded ? 'Uploaded' : error ? 'Error' : 'In queue'}
          </p>
        )}
        <Button className="size-7" variant="ghost" onClick={onCancel}>
          <XIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
};

const UploadBox = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { files, addFiles, cancelUpload, progress, isUploading, uploadingId } = useUploadFiles();

  return (
    <div className="mt-3">
      <div
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) {
            addFiles(Array.from(e.dataTransfer.files));
            setIsDragOver(false);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        className={cn(
          'relative p-4 flex transition flex-col items-center justify-center h-40 border border-dashed rounded-lg border-foreground/20',
          {
            'border-primary': isDragOver,
          },
        )}
      >
        <label
          htmlFor="file"
          className="absolute inset-0 flex gap-2 flex-col items-center justify-center cursor-pointer"
        >
          <CirclePlus className="size-7 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Drag and drop or click to choose files.
          </span>
        </label>
        <input
          id="file"
          onChange={(e) => {
            if (e.target.files) {
              addFiles(Array.from(e.target.files));
            }
          }}
          type="file"
          className="hidden"
          accept={ALLOWED_ADMIN_UPLOAD_TYPES.join(',')}
          multiple
        />
      </div>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file) => (
            <UploadFiles
              key={file.id}
              file={file.file}
              isUploading={isUploading && uploadingId === file.id}
              progress={progress}
              onCancel={() => cancelUpload(file.id)}
              isUploaded={file.isUploaded}
              error={file.error}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadBox;
