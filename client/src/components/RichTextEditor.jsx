import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

export default function RichTextEditor({ value, onChange, placeholder = 'Add a note...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder })
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    }
  })

  useEffect(() => {
    if (editor && value === '') {
      editor.commands.clearContent()
    }
  }, [value])

  if (!editor) return null

  const btnStyle = (active) => ({
    padding: '4px 8px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: active ? '#6366f1' : 'transparent',
    color: active ? '#ffffff' : '#6b7280',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: 'Inter, system-ui, sans-serif'
  })

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#ffffff'
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        padding: '6px 8px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={btnStyle(editor.isActive('bold'))}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={{ ...btnStyle(editor.isActive('italic')), fontStyle: 'italic' }}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          style={{ ...btnStyle(editor.isActive('strike')), textDecoration: 'line-through' }}
          title="Strikethrough"
        >
          S
        </button>
        <div style={{ width: '1px', height: '16px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={btnStyle(editor.isActive('bulletList'))}
          title="Bullet list"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={btnStyle(editor.isActive('orderedList'))}
          title="Numbered list"
        >
          1. List
        </button>
        <div style={{ width: '1px', height: '16px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          style={{ ...btnStyle(editor.isActive('code')), fontFamily: 'monospace' }}
          title="Inline code"
        >
          {'</>'}
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('Enter URL')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
          style={btnStyle(editor.isActive('link'))}
          title="Add link"
        >
          🔗
        </button>
        {editor.isActive('link') && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            style={btnStyle(false)}
            title="Remove link"
          >
            Remove link
          </button>
        )}
      </div>

      {/* Editor Area */}
      <EditorContent
        editor={editor}
        style={{ padding: '10px 12px', minHeight: '80px', fontSize: '13px', color: '#111827', lineHeight: '1.6' }}
      />

      <style>{`
        .ProseMirror:focus { outline: none; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror ul { padding-left: 20px; }
        .ProseMirror ol { padding-left: 20px; }
        .ProseMirror code { background: #f3f4f6; padding: 1px 4px; border-radius: 4px; font-size: 12px; }
        .ProseMirror a { color: #6366f1; text-decoration: underline; }
        .ProseMirror strong { font-weight: 700; }
        .ProseMirror em { font-style: italic; }
      `}</style>
    </div>
  )
}