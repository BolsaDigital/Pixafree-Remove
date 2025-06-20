import './styles/index.css';

import type { Content, Editor } from '@tiptap/react';
import { EditorContent } from '@tiptap/react';
import * as React from 'react';

import { Separator } from '@/components/ui/separator';

import { cn } from '@/lib/utils';

import { LinkBubbleMenu } from './components/bubble-menu/link-bubble-menu';
import { MeasuredContainer } from './components/measured-container';
import { SectionFive } from './components/section/five';
import { SectionFour } from './components/section/four';
import { SectionOne } from './components/section/one';
import { SectionThree } from './components/section/three';
import { SectionTwo } from './components/section/two';
import { useMinimalTiptapEditor } from './hooks/use-minimal-tiptap';
import type { UseMinimalTiptapEditorProps } from './hooks/use-minimal-tiptap';

export interface MinimalTiptapProps extends Omit<UseMinimalTiptapEditorProps, 'onUpdate'> {
  value?: Content;
  onChange?: (value: Content) => void;
  className?: string;
  editorContentClassName?: string;
  maxHeight?: string;
}

const Toolbar = ({ editor }: { editor: Editor }) => (
  <div className="shrink-0 overflow-x-auto border-b border-border p-2">
    <div className="flex flex-wrap max-w-max items-center gap-px">
      <SectionOne editor={editor} activeLevels={[1, 2, 3, 4, 5, 6]} />

      <Separator orientation="vertical" className="mx-2 !h-7" />

      <SectionTwo
        editor={editor}
        activeActions={['bold', 'italic', 'underline', 'strikethrough', 'code', 'clearFormatting']}
        mainActionCount={3}
      />

      <Separator orientation="vertical" className="mx-2 !h-7" />

      <SectionThree editor={editor} />

      <Separator orientation="vertical" className="mx-2 !h-7" />

      <SectionFour
        editor={editor}
        activeActions={['orderedList', 'bulletList']}
        mainActionCount={0}
      />

      <Separator orientation="vertical" className="mx-2 !h-7" />

      <SectionFive
        editor={editor}
        activeActions={['codeBlock', 'blockquote', 'horizontalRule']}
        mainActionCount={0}
      />
    </div>
  </div>
);

export const MinimalTiptapEditor = React.forwardRef<HTMLDivElement, MinimalTiptapProps>(
  ({ value, onChange, maxHeight, className, editorContentClassName, ...props }, ref) => {
    const editor = useMinimalTiptapEditor({
      value,
      onUpdate: onChange,
      ...props,
    });

    if (!editor) {
      return null;
    }

    return (
      <MeasuredContainer
        as="div"
        name="editor"
        ref={ref}
        className={cn(
          'flex h-auto min-h-72 w-full flex-col rounded-md border border-input shadow-xs bg-card focus-within:border-ring focus-within:ring-ring/15 transition-[color,box-shadow] outline-none focus-within:ring-[3px]',
          'group-aria-[invalid=true]:!ring-destructive/20 dark:group-aria-[invalid=true]:!ring-destructive/40 group-aria-[invalid=true]:!border-destructive',
          className,
        )}
      >
        <Toolbar editor={editor} />
        <EditorContent
          editor={editor}
          className={cn('minimal-tiptap-editor overflow-auto h-full', editorContentClassName, {
            'max-h-[300px]': maxHeight,
          })}
        />
        <LinkBubbleMenu editor={editor} />
      </MeasuredContainer>
    );
  },
);

MinimalTiptapEditor.displayName = 'MinimalTiptapEditor';

export default MinimalTiptapEditor;
