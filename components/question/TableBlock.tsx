"use client";

import type { JSONContent } from "@tiptap/core";

interface TableBlockProps {
  node: JSONContent;
}

function renderCell(cell: JSONContent, Tag: "th" | "td", key: number) {
  const text =
    cell.content?.map((n) => n.text ?? "").join("") ?? "";
  const colspan = (cell.attrs as { colspan?: number })?.colspan;
  const rowspan = (cell.attrs as { rowspan?: number })?.rowspan;
  return (
    <Tag key={key} colSpan={colspan} rowSpan={rowspan}>
      {text}
    </Tag>
  );
}

export default function TableBlock({ node }: TableBlockProps) {
  const rows = node.content ?? [];
  return (
    <div className="qb-table-wrap">
      <table>
        <tbody>
          {rows.map((row, ri) => {
            const cells = row.content ?? [];
            const isHeader = row.content?.some(
              (c) => c.type === "tableHeader"
            );
            return (
              <tr key={ri}>
                {cells.map((cell, ci) =>
                  renderCell(
                    cell,
                    isHeader || cell.type === "tableHeader" ? "th" : "td",
                    ci
                  )
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
