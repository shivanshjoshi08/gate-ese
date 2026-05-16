"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Mathematics from "@tiptap/extension-mathematics";
import Placeholder from "@tiptap/extension-placeholder";
import { common, createLowlight } from "lowlight";
import { useEffect } from "react";
import type { RichContent } from "@/lib/question-types";
import { createRichContent, EMPTY_DOC } from "@/lib/rich-content";
import "katex/dist/katex.min.css";

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  value: RichContent;
  onChange: (content: RichContent) => void;
  placeholder?: string;
  minHeight?: string;
}

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm ${
        active
          ? "bg-blue-600 text-white"
          : "border border-transparent bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Type question content…",
  minHeight = "160px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ lowlight }),
      Mathematics.configure({
        katexOptions: { throwOnError: false },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value.doc ?? EMPTY_DOC,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[var(--editor-min-h)] px-3 py-2 text-[15px] leading-relaxed text-zinc-100 outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(createRichContent(ed.getJSON()));
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(value.doc);
    if (current !== incoming) {
      editor.commands.setContent(value.doc ?? EMPTY_DOC);
    }
  }, [editor, value.doc]);

  if (!editor) return null;

  const insertInlineMath = () => {
    const latex = window.prompt("Inline LaTeX (e.g. x^2 + y^2 = z^2)");
    if (latex) editor.chain().focus().insertInlineMath({ latex }).run();
  };

  const insertBlockMath = () => {
    const latex = window.prompt("Block LaTeX");
    if (latex) editor.chain().focus().insertBlockMath({ latex }).run();
  };

  const insertImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;

      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        const j = (await res.json().catch(() => ({}))) as {
          url?: string;
          error?: string;
          storage?: string;
        };
        if (!res.ok || !j.url) {
          throw new Error(j.error ?? `Upload failed (${res.status})`);
        }
        editor.chain().focus().setImage({ src: j.url }).run();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        window.alert(
          `${msg}\n\nIf Cloudinary env is missing locally, uploads stay under /uploads until you configure it. You can paste an image URL instead.`,
        );
        const url = window.prompt("Image URL (optional)", "");
        if (url?.trim()) editor.chain().focus().setImage({ src: url.trim() }).run();
      }
    };
    input.click();
  };

  return (
    <div className="cms-tiptap overflow-hidden rounded-xl border border-zinc-600 bg-zinc-950 text-zinc-100 shadow-sm shadow-black/40">
      <div className="flex flex-wrap gap-1 border-b border-zinc-700 bg-zinc-900 p-2">
        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </ToolbarButton>
        <ToolbarButton
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          title="Ordered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </ToolbarButton>
        <ToolbarButton
          title="Table"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          Table
        </ToolbarButton>
        <ToolbarButton
          title="Code block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          Code
        </ToolbarButton>
        <ToolbarButton title="Inline math" onClick={insertInlineMath}>
          ∑ inline
        </ToolbarButton>
        <ToolbarButton title="Block math" onClick={insertBlockMath}>
          ∑ block
        </ToolbarButton>
        <ToolbarButton title="Upload or insert image" onClick={insertImage}>
          🖼
        </ToolbarButton>
      </div>
      <EditorContent
        editor={editor}
        className="cms-tiptap-editor bg-zinc-950 [&_.ProseMirror]:min-h-[var(--editor-min-h)] [&_.ProseMirror]:bg-zinc-950 [&_.ProseMirror]:text-zinc-100 [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:my-2 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_li]:my-0.5 [&_.ProseMirror-focused_p.is-editor-empty:first-child::before]:text-zinc-500"
        style={{ "--editor-min-h": minHeight } as React.CSSProperties}
      />
    </div>
  );
}
