"use client";

import { useEffect } from "react";
import { clsx } from "clsx";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";

/**
 * WYSIWYG editor for long-form prose fields — currently the consultant bio,
 * which was a bare textarea whose only formatting was "leave a blank line
 * for a new paragraph".
 *
 * Serializes to HTML in one hidden input, so the server action reads it with
 * the same `str(formData, ...)` as any other field. The HTML is sanitized
 * server-side on save (see sanitizeRichText) rather than trusted from here —
 * the editor's schema constrains what *this* UI can produce, but nothing
 * stops a crafted POST straight to the action.
 */
export function RichText({
  name,
  initialHtml = "",
  placeholder,
}: {
  name: string;
  initialHtml?: string;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: initialHtml,
    // Rendering the editor on the server produces markup React then has to
    // reconcile against ProseMirror's own DOM, which warns; TipTap's own
    // guidance for SSR frameworks is to mount client-side only.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: clsx(
          "prose-editor min-h-40 w-full px-3.5 py-3 text-[15px] leading-relaxed outline-none",
        ),
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
      },
    },
  });

  useEffect(() => {
    return () => editor?.destroy();
  }, [editor]);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] focus-within:border-violet-400">
      <input type="hidden" name={name} value={editor?.getHTML() ?? initialHtml} />
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--border)] px-1.5 py-1.5">
      <Btn
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={15} />
      </Btn>
      <Btn
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={15} />
      </Btn>
      <Btn
        label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={15} />
      </Btn>

      <Divider />

      <Btn
        label="Heading"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <span className="text-[13px] font-semibold">H2</span>
      </Btn>
      <Btn
        label="Subheading"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <span className="text-[13px] font-semibold">H3</span>
      </Btn>

      <Divider />

      <Btn
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={15} />
      </Btn>
      <Btn
        label="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={15} />
      </Btn>
      <Btn
        label="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={15} />
      </Btn>

      <Divider />

      <Btn
        label="Link"
        active={editor.isActive("link")}
        onClick={() => {
          if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
            return;
          }
          const url = window.prompt("Link URL");
          if (!url) return;
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
      >
        <LinkIcon size={15} />
      </Btn>

      <div className="ml-auto flex items-center gap-0.5">
        <Btn
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo2 size={15} />
        </Btn>
        <Btn
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo2 size={15} />
        </Btn>
      </div>
    </div>
  );
}

function Btn({
  children,
  label,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 transition-colors",
        active
          ? "bg-violet-50 text-violet-600"
          : "text-[var(--muted)] hover:bg-[var(--sunken)] hover:text-[var(--foreground)]",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-4 w-px bg-[var(--border)]" />;
}
