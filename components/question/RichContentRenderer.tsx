"use client";

import type { JSONContent } from "@tiptap/core";
import type { RichContent } from "@/lib/question-types";
import { sanitizeHtml } from "@/lib/sanitize";
import EquationBlock from "./EquationBlock";
import ImageBlock from "./ImageBlock";
import TableBlock from "./TableBlock";
import CodeBlock from "./CodeBlock";

interface RichContentRendererProps {
  content: RichContent | JSONContent;
  className?: string;
}

function isRichContent(c: RichContent | JSONContent): c is RichContent {
  return "format" in c && "doc" in c;
}

function renderNode(node: JSONContent, key: string): React.ReactNode {
  const children = node.content?.map((child, i) =>
    renderNode(child, `${key}-${i}`)
  );

  switch (node.type) {
    case "doc":
      return <div key={key}>{children}</div>;
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading": {
      const level = (node.attrs as { level?: number })?.level ?? 2;
      const Tag = `h${Math.min(level, 4)}` as "h1" | "h2" | "h3" | "h4";
      return <Tag key={key}>{children}</Tag>;
    }
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return <ol key={key}>{children}</ol>;
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "codeBlock": {
      const lang = (node.attrs as { language?: string })?.language ?? "plaintext";
      const code = node.content?.map((n) => n.text).join("\n") ?? "";
      return <CodeBlock key={key} code={code} language={lang} />;
    }
    case "horizontalRule":
      return <hr key={key} className="my-4 border-zinc-600" />;
    case "table":
      return <TableBlock key={key} node={node} />;
    case "image": {
      const attrs = node.attrs as {
        src?: string;
        alt?: string;
        title?: string;
      };
      if (!attrs?.src) return null;
      return (
        <ImageBlock
          key={key}
          src={attrs.src}
          alt={attrs.alt}
          caption={attrs.title}
        />
      );
    }
    case "inlineMath": {
      const latex = (node.attrs as { latex?: string })?.latex ?? "";
      return <EquationBlock key={key} latex={latex} displayMode={false} />;
    }
    case "blockMath": {
      const latex = (node.attrs as { latex?: string })?.latex ?? "";
      return <EquationBlock key={key} latex={latex} displayMode />;
    }
    case "text": {
      let el: React.ReactNode = node.text ?? "";
      node.marks?.forEach((mark) => {
        if (mark.type === "bold")
          el = <strong key={`${key}-b`}>{el}</strong>;
        if (mark.type === "italic")
          el = <em key={`${key}-i`}>{el}</em>;
        if (mark.type === "underline")
          el = <u key={`${key}-u`}>{el}</u>;
        if (mark.type === "strike")
          el = <s key={`${key}-s`}>{el}</s>;
        if (mark.type === "code")
          el = <code key={`${key}-c`}>{el}</code>;
        if (mark.type === "link") {
          const href = (mark.attrs as { href?: string })?.href ?? "#";
          el = (
            <a
              key={`${key}-a`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {el}
            </a>
          );
        }
      });
      return <span key={key}>{el}</span>;
    }
    case "hardBreak":
      return <br key={key} />;
    default:
      if (node.type === "html") {
        const html = (node.attrs as { html?: string })?.html ?? "";
        return (
          <div
            key={key}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
          />
        );
      }
      return children ? <div key={key}>{children}</div> : null;
  }
}

export default function RichContentRenderer({
  content,
  className = "",
}: RichContentRendererProps) {
  const doc = isRichContent(content) ? content.doc : content;
  if (!doc?.content?.length) return null;

  return (
    <div className={`qb-content ${className}`}>
      {doc.content.map((node, i) => renderNode(node, `root-${i}`))}
    </div>
  );
}
