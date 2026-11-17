"use client";

import React from "react";

function formatMathFormula(raw: string): string {
  return raw
    .replace(/\\times/g, "×")
    .replace(/\\odot/g, "☉")
    .replace(/\\oplus/g, "⊕")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)")
    .replace(/\^\{([^}]+)\}/g, "^$1")
    .replace(/_\{([^}]+)\}/g, "_$1")
    .replace(/\\\s/g, " ")
    .replace(/\\/g, "");
}

function renderInline(text: string): React.ReactNode[] {
  const cleaned = text.replace(/\$([^$]+)\$/g, (_, m: string) => `\`${formatMathFormula(m)}\``);
  const parts = cleaned.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-[#F4F6FB]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={idx} className="italic text-[#C8D1E8]">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={idx}
          className="rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[0.85em] text-[#F3C969]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    // Markdown table
    if (
      line.startsWith("|") &&
      i + 1 < lines.length &&
      lines[i + 1].trim().startsWith("|") &&
      lines[i + 1].includes("---")
    ) {
      const headers = line
        .split("|")
        .slice(1, -1)
        .map((h) => h.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(
          lines[i]
            .trim()
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim())
        );
        i++;
      }
      blocks.push(
        <div
          key={`tbl-${i}`}
          className="my-3.5 overflow-x-auto rounded-xl border border-white/[0.08] bg-[#090D18]/80"
        >
          <table className="w-full min-w-[420px] border-collapse text-left text-[13.5px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03]">
                {headers.map((h, hIdx) => (
                  <th
                    key={hIdx}
                    className="px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#9AA4BF]"
                  >
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] tabular-nums">
              {rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="transition-colors hover:bg-white/[0.025]"
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`px-3.5 py-2.5 ${
                        cIdx === 0
                          ? "text-[#D7DEF0] font-medium"
                          : "text-[#B8C2DC] font-mono text-[12.5px]"
                      }`}
                    >
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      blocks.push(
        <h3
          key={`h3-${i}`}
          className="mt-1 mb-2 font-display text-[17px] font-semibold tracking-tight text-[#F4F6FB]"
        >
          {renderInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith("#### ")) {
      blocks.push(
        <h4
          key={`h4-${i}`}
          className="mt-4 mb-1.5 font-display text-[14.5px] font-semibold tracking-tight text-[#A5B4FC]"
        >
          {renderInline(line.slice(5))}
        </h4>
      );
      i++;
      continue;
    }

    // Blockquote callout
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push(
        <blockquote
          key={`q-${i}`}
          className="my-3 rounded-r-xl border-l-2 border-[#7C8CFF] bg-[#7C8CFF]/[0.07] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-[#CBD5F0]"
        >
          {renderInline(quoteLines.join(" "))}
        </blockquote>
      );
      continue;
    }

    // Unordered list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))
      ) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="my-2.5 space-y-1.5 text-[14.5px] leading-relaxed text-[#C4CDE4]">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7C8CFF]" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="my-2.5 space-y-2 text-[14.5px] leading-relaxed text-[#C4CDE4]">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7C8CFF]/15 font-mono text-[11px] font-semibold text-[#9BA8FF]">
                {idx + 1}
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Standard paragraph
    blocks.push(
      <p
        key={`p-${i}`}
        className="my-2 text-[14.5px] leading-[1.7] text-[#C8D1E8]"
      >
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1">{blocks}</div>;
}
