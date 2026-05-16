import type { JSONContent } from "@tiptap/core";
import type { RichContent } from "@/lib/question-types";

export const EMPTY_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export function createRichContent(
  doc: JSONContent = EMPTY_DOC,
  plainText?: string
): RichContent {
  return {
    format: "tiptap-v1",
    doc,
    plainText: plainText ?? extractPlainText(doc),
  };
}

export function createParagraph(text: string): RichContent {
  const doc: JSONContent = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: text ? [{ type: "text", text }] : [],
      },
    ],
  };
  return createRichContent(doc, text);
}

export function extractPlainText(node: JSONContent): string {
  if (node.text) return node.text;
  if (node.type === "inlineMath" || node.type === "blockMath") {
    const latex = (node.attrs as { latex?: string })?.latex ?? "";
    return ` ${latex} `;
  }
  if (!node.content?.length) return "";
  return node.content
    .map(extractPlainText)
    .join(
      node.type === "paragraph" || node.type === "heading" ? "\n" : " "
    );
}

export function isRichContentEmpty(content: RichContent): boolean {
  const text = content.plainText ?? extractPlainText(content.doc);
  return text.trim().length === 0;
}
