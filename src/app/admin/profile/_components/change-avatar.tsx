import React from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
const ChangeAvatar = ({
  name,
  avatar,
  value,
  onChange,
}: {
  name: string;
  avatar: string;
  value: File | undefined;
  onChange: (value: File | undefined) => void;
}) => {
  const [preview, setPreview] = React.useState<string | undefined>();
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-4">
      <Avatar name={name} src={value ? preview : avatar} className="size-12 rounded-lg" />
      <div className="flex">
        <input
          type="file"
          ref={inputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] || undefined;
            setPreview(file ? URL.createObjectURL(file) : undefined);
            onChange(file);
          }}
        />
        <Button
          variant="outline"
          className="h-8"
          size="sm"
          onClick={() => {
            inputRef.current?.click();
          }}
        >
          {value || avatar ? 'Change Avatar' : 'Upload Avatar'}
        </Button>
      </div>
    </div>
  );
};

export default ChangeAvatar;
