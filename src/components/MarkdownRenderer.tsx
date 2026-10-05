import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Helper to parse inline styles (bold, inline code, italics)
  const renderInlineFormatted = (text: string): React.ReactNode[] => {
    // Regex splits on **bold**, `code`, *italic*
    const tokens = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

    return tokens.map((token, i) => {
      if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
        return (
          <strong key={i} className="font-bold text-slate-900 tracking-tight">
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
        return (
          <code
            key={i}
            className="bg-slate-100 text-indigo-700 font-mono text-[11px] sm:text-xs px-1.5 py-0.5 rounded font-semibold border border-slate-200/70"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
        return (
          <em key={i} className="italic text-slate-800">
            {token.slice(1, -1)}
          </em>
        );
      }
      return token;
    });
  };

  // Split content into blocks: code blocks vs text blocks
  const blocks: Array<
    | { type: 'code'; language: string; code: string }
    | { type: 'text'; lines: string[] }
  > = [];

  const rawLines = content.split('\n');
  let currentCodeBlock: { language: string; lines: string[] } | null = null;
  let currentTextLines: string[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const codeMatch = line.match(/^```(\w+)?/);

    if (codeMatch) {
      if (currentCodeBlock) {
        // Closing code block
        blocks.push({
          type: 'code',
          language: currentCodeBlock.language || 'text',
          code: currentCodeBlock.lines.join('\n'),
        });
        currentCodeBlock = null;
      } else {
        // Opening code block
        if (currentTextLines.length > 0) {
          blocks.push({ type: 'text', lines: currentTextLines });
          currentTextLines = [];
        }
        currentCodeBlock = { language: codeMatch[1] || '', lines: [] };
      }
      continue;
    }

    if (currentCodeBlock) {
      currentCodeBlock.lines.push(line);
    } else {
      currentTextLines.push(line);
    }
  }

  if (currentCodeBlock) {
    blocks.push({
      type: 'code',
      language: currentCodeBlock.language || 'text',
      code: currentCodeBlock.lines.join('\n'),
    });
  }
  if (currentTextLines.length > 0) {
    blocks.push({ type: 'text', lines: currentTextLines });
  }

  let codeBlockCounter = 0;

  return (
    <div className="space-y-3 font-[450] text-slate-800 text-xs sm:text-sm leading-relaxed tracking-normal">
      {blocks.map((block, blockIdx) => {
        if (block.type === 'code') {
          const idx = codeBlockCounter++;
          const isCopied = copiedCodeIdx === idx;
          return (
            <div
              key={blockIdx}
              className="my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 text-xs font-mono shadow-sm"
            >
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400">
                <span className="uppercase tracking-wider font-semibold text-indigo-400">
                  {block.language || 'Code'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(block.code, idx)}
                  className="flex items-center gap-1 text-slate-300 hover:text-white transition px-2 py-0.5 rounded hover:bg-slate-800 cursor-pointer"
                  title="Copy code"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 text-[10px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3.5 overflow-x-auto leading-relaxed whitespace-pre font-mono text-[11px] sm:text-xs">
                {block.code}
              </div>
            </div>
          );
        }

        // Render structured text lines
        const renderedElements: React.ReactNode[] = [];
        let listItems: React.ReactNode[] = [];
        let listType: 'bullet' | 'number' | null = null;

        const flushList = () => {
          if (listItems.length > 0) {
            renderedElements.push(
              <ul key={`list-${renderedElements.length}`} className="my-2 space-y-1 pl-1">
                {listItems}
              </ul>
            );
            listItems = [];
            listType = null;
          }
        };

        for (let lIdx = 0; lIdx < block.lines.length; lIdx++) {
          const rawLine = block.lines[lIdx];
          const line = rawLine.trim();

          if (!line) {
            flushList();
            continue;
          }

          // Headers
          if (line.startsWith('# ')) {
            flushList();
            renderedElements.push(
              <h1
                key={lIdx}
                className="text-base sm:text-lg font-bold text-slate-900 mt-4 mb-2 tracking-tight flex items-center gap-1.5"
              >
                {renderInlineFormatted(line.slice(2))}
              </h1>
            );
            continue;
          }
          if (line.startsWith('## ')) {
            flushList();
            renderedElements.push(
              <h2
                key={lIdx}
                className="text-sm sm:text-base font-bold text-slate-900 mt-3.5 mb-1.5 tracking-tight"
              >
                {renderInlineFormatted(line.slice(3))}
              </h2>
            );
            continue;
          }
          if (line.startsWith('### ')) {
            flushList();
            renderedElements.push(
              <h3
                key={lIdx}
                className="text-xs sm:text-sm font-bold text-slate-900 mt-3 mb-1"
              >
                {renderInlineFormatted(line.slice(4))}
              </h3>
            );
            continue;
          }

          // Blockquotes (> text)
          if (line.startsWith('> ')) {
            flushList();
            renderedElements.push(
              <blockquote
                key={lIdx}
                className="border-l-3 border-indigo-500 bg-indigo-50/50 pl-3.5 py-1.5 my-2.5 rounded-r-lg text-slate-800 text-xs sm:text-sm italic"
              >
                {renderInlineFormatted(line.slice(2))}
              </blockquote>
            );
            continue;
          }

          // Bullet list items (- or *)
          const bulletMatch = line.match(/^[-*]\s+(.*)/);
          if (bulletMatch) {
            listType = 'bullet';
            listItems.push(
              <li key={lIdx} className="flex items-start gap-2 text-slate-800">
                <span className="text-indigo-600 font-bold shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{renderInlineFormatted(bulletMatch[1])}</span>
              </li>
            );
            continue;
          }

          // Numbered list items (1. 2.)
          const numberMatch = line.match(/^(\d+)\.\s+(.*)/);
          if (numberMatch) {
            listType = 'number';
            listItems.push(
              <li key={lIdx} className="flex items-start gap-2 text-slate-800">
                <span className="text-indigo-600 font-bold shrink-0 font-mono text-[11px] mt-0.5">
                  {numberMatch[1]}.
                </span>
                <span className="leading-relaxed">{renderInlineFormatted(numberMatch[2])}</span>
              </li>
            );
            continue;
          }

          // Horizontal rule
          if (line === '---' || line === '***') {
            flushList();
            renderedElements.push(<hr key={lIdx} className="border-slate-200 my-3" />);
            continue;
          }

          // Regular paragraph
          flushList();
          renderedElements.push(
            <p key={lIdx} className="leading-relaxed mb-2 text-slate-800">
              {renderInlineFormatted(rawLine)}
            </p>
          );
        }

        flushList();

        return <div key={blockIdx}>{renderedElements}</div>;
      })}
    </div>
  );
};
