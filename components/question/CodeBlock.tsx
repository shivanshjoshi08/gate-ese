"use client";

import { useMemo } from "react";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = "plaintext" }: CodeBlockProps) {
  const html = useMemo(() => {
    try {
      const tree = lowlight.highlight(language, code);
      return lowlightToHtml(tree);
    } catch {
      return escapeHtml(code);
    }
  }, [code, language]);

  return (
    <pre className="hljs">
      <code
        className={`language-${language}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </pre>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function lowlightToHtml(node: {
  type: string;
  value?: string;
  properties?: { className?: string[] };
  children?: unknown[];
}): string {
  if (node.type === "text") return escapeHtml(node.value ?? "");
  const cls = node.properties?.className?.join(" ") ?? "";
  const inner = (node.children ?? [])
    .map((c) => lowlightToHtml(c as typeof node))
    .join("");
  return cls ? `<span class="${cls}">${inner}</span>` : inner;
}
