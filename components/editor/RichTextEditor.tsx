'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { useState, useCallback, useEffect } from 'react';
import clsx from 'clsx';

type RichTextEditorProps = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
};

const TOOLBAR_GROUPS = [
  [
    { key: 'bold', label: 'B', style: 'font-bold', command: 'toggleBold' },
    { key: 'italic', label: 'I', style: 'italic', command: 'toggleItalic' },
    { key: 'underline', label: 'U', style: 'underline', command: 'toggleUnderline' },
    { key: 'strike', label: 'S', style: 'line-through', command: 'toggleStrike' },
  ],
  [
    { key: 'heading-2', label: 'H2', command: 'toggleHeading', args: { level: 2 } },
    { key: 'heading-3', label: 'H3', command: 'toggleHeading', args: { level: 3 } },
  ],
  [
    { key: 'bulletList', label: '...', command: 'toggleBulletList', icon: 'list-ul' },
    { key: 'orderedList', label: '1.', command: 'toggleOrderedList', icon: 'list-ol' },
  ],
  [
    { key: 'blockquote', label: '"', command: 'toggleBlockquote' },
    { key: 'codeBlock', label: '<>', command: 'toggleCodeBlock' },
  ],
] as const;

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const handleCommand = (command: string, args?: Record<string, unknown>) => {
    const chain = editor.chain().focus();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fn = (chain as any)[command];
    if (typeof fn === 'function') {
      (args ? fn.call(chain, args) : fn.call(chain)).run();
    }
  };

  const isActive = (key: string, args?: Record<string, unknown>) => {
    if (key.startsWith('heading')) {
      return editor.isActive('heading', args);
    }
    return editor.isActive(key);
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5 rounded-t-lg">
      {TOOLBAR_GROUPS.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {gi > 0 && <div className="mx-1 h-5 w-px bg-gray-300" />}
          {group.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleCommand(item.command, 'args' in item ? item.args : undefined)}
              className={clsx(
                'rounded px-2 py-1 text-xs font-medium transition',
                isActive(item.key, 'args' in item ? item.args : undefined)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-200'
              )}
              title={item.key}
            >
              <span className={'style' in item ? item.style : ''}>{item.label}</span>
            </button>
          ))}
        </div>
      ))}

      <div className="mx-1 h-5 w-px bg-gray-300" />
      <button
        type="button"
        onClick={() => {
          const url = window.prompt('URLを入力してください');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={clsx(
          'rounded px-2 py-1 text-xs font-medium transition',
          editor.isActive('link')
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-600 hover:bg-gray-200'
        )}
        title="リンク"
      >
        🔗
      </button>
      {editor.isActive('link') && (
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          className="rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
          title="リンク解除"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export function RichTextEditor({ name, defaultValue = '', placeholder }: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [html, setHtml] = useState(defaultValue);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: 'prose-editor min-h-[120px] px-4 py-3 outline-none',
      },
    },
    onUpdate: ({ editor: e }) => {
      setHtml(e.getHTML());
    },
  });

  useEffect(() => {
    if (editor && defaultValue && !editor.getText().trim()) {
      editor.commands.setContent(defaultValue);
    }
  }, [editor, defaultValue]);

  const togglePreview = useCallback(() => {
    setShowPreview((v) => !v);
  }, []);

  return (
    <div>
      <input type="hidden" name={name} value={html} />

      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium">説明</label>
        <button
          type="button"
          onClick={togglePreview}
          className={clsx(
            'text-xs px-2 py-1 rounded transition',
            showPreview
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:bg-gray-100'
          )}
        >
          {showPreview ? 'プレビューを閉じる' : 'プレビュー'}
        </button>
      </div>

      {/* Desktop: side-by-side / Tablet and below: toggle */}
      <div className={clsx(
        'gap-4',
        showPreview ? 'md:grid md:grid-cols-2' : ''
      )}>
        {/* Editor (hidden on mobile when previewing) */}
        <div className={clsx(
          'rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent',
          showPreview ? 'hidden md:block' : ''
        )}>
          <Toolbar editor={editor} />
          <EditorContent editor={editor} />
          {!editor?.getText().trim() && placeholder && (
            <div className="pointer-events-none absolute px-4 py-3 text-gray-400 text-sm" style={{ marginTop: '-40px' }}>
            </div>
          )}
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className={clsx(
            'rounded-lg border border-gray-200 bg-gray-50 p-4',
            'md:block'
          )}>
            <div className="mb-2 text-xs font-medium text-gray-500">プレビュー</div>
            <div
              className="event-description-content"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
