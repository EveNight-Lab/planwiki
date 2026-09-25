/**
 * @domain 기획 문서 작업
 * @feature 단락 본문 내 인라인 HTML 샌드박스
 * @phase 출력 (Render)
 * @target 혼합 마크다운-인라인HTML 기획서 뷰어
 * @desc 표, 체크리스트, 첨부 이미지 및 본문 중간의 인라인 대화형 HTML 샌드박스를 순서대로 화면에 표시
 */
import React, { useMemo } from 'react';
import { marked } from 'marked';
import { splitMarkdownIntoSegments, type ContentSegment } from '../../lib/markdownSegments';
import { InlineSandbox } from '../sandbox/InlineSandbox';

interface Props {
  content: string;
  assets: Record<string, string>;
  onUpdateContent?: (newContent: string) => void;
}

// Pure helper: Toggle the N-th task checkbox in markdown text
function toggleTaskCheckbox(md: string, targetIndex: number): string {
  let currentIndex = 0;
  return md.replace(/^(\s*[-*]\s*\[)([ xX])(\]\s+)/gm, (match, prefix, checkState, suffix) => {
    if (currentIndex === targetIndex) {
      currentIndex++;
      const isCurrentlyChecked = checkState.toLowerCase() === 'x';
      return `${prefix}${isCurrentlyChecked ? ' ' : 'x'}${suffix}`;
    }
    currentIndex++;
    return match;
  });
}

function renderMarkdownHtml(mdText: string, assets: Record<string, string>): string {
  if (!mdText.trim()) return '';

  let processed = mdText;
  for (const [filename, url] of Object.entries(assets)) {
    const regex = new RegExp(`assets/${filename}`, 'g');
    processed = processed.replace(regex, url);
  }

  try {
    const rawHtml = marked.parse(processed, {
      gfm: true,
      breaks: true,
    }) as string;

    // Make task list checkboxes interactive
    let taskIdx = 0;
    return rawHtml.replace(/<input\s+([^>]*?)type=["']checkbox["']([^>]*?)>/gi, (match) => {
      const idx = taskIdx++;
      const cleaned = match
        .replace(/\s*disabled(?:=["'][^"']*["'])?/gi, '')
        .replace(/class=["'][^"']*["']/gi, '');
      return `<input type="checkbox" data-task-index="${idx}" class="task-checkbox cursor-pointer w-4 h-4 rounded accent-blue-600 align-middle mr-1.5 transition-transform active:scale-90" ${cleaned.slice(6)}`;
    });
  } catch (err) {
    console.error('Markdown parse error:', err);
    return `<pre class="text-red-400">${mdText}</pre>`;
  }
}

export const MarkdownViewer: React.FC<Props> = ({ content, assets, onUpdateContent }) => {
  const segments: ContentSegment[] = useMemo(() => {
    if (!content) return [];
    return splitMarkdownIntoSegments(content);
  }, [content]);

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target && target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
      const idxStr = target.getAttribute('data-task-index');
      if (idxStr !== null && onUpdateContent) {
        const idx = parseInt(idxStr, 10);
        const updated = toggleTaskCheckbox(content, idx);
        onUpdateContent(updated);
      }
    }
  };

  if (!content) {
    return (
      <p className="text-slate-400 italic">
        작성된 내용이 없습니다. [편집] 버튼을 눌러 내용을 작성하세요.
      </p>
    );
  }

  const proseClasses = `prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200
    [&_h1]:text-2xl sm:[&_h1]:text-3xl [&_h1]:font-black [&_h1]:text-slate-900 dark:[&_h1]:text-white [&_h1]:mt-7 [&_h1]:mb-3.5 [&_h1]:pb-2 [&_h1]:border-b [&_h1]:border-slate-200 dark:[&_h1]:border-slate-800
    [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h2]:mt-6 [&_h2]:mb-3
    [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-800 dark:[&_h3]:text-slate-100 [&_h3]:mt-5 [&_h3]:mb-2.5
    [&_p]:my-3 [&_p]:leading-relaxed
    [&_strong]:font-bold [&_strong]:text-slate-900 dark:[&_strong]:text-white
    [&_table]:block [&_table]:overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:text-xs sm:[&_table]:text-sm [&_table]:scrollbar-thin
    [&_th]:bg-slate-100 dark:[&_th]:bg-slate-800 [&_th]:border [&_th]:border-slate-300 dark:[&_th]:border-slate-700 [&_th]:p-2 sm:[&_th]:p-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:whitespace-nowrap sm:[&_th]:whitespace-normal
    [&_td]:border [&_td]:border-slate-200 dark:[&_td]:border-slate-800 [&_td]:p-2 sm:[&_td]:p-2.5 [&_td]:whitespace-nowrap sm:[&_td]:whitespace-normal
    [&_tr:nth-child(even)]:bg-slate-50/60 dark:[&_tr:nth-child(even)]:bg-slate-800/40
    [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:bg-blue-50/50 dark:[&_blockquote]:bg-blue-950/20 [&_blockquote]:py-2 [&_blockquote]:px-3 sm:[&_blockquote]:px-4 [&_blockquote]:rounded-r-lg
    [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-3 sm:[&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:text-xs sm:[&_pre]:text-sm
    [&_code]:bg-slate-100 dark:[&_code]:bg-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-blue-600 dark:[&_code]:text-blue-400 [&_code]:text-xs [&_code]:font-mono
    [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit
    [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
    [&_li:has(input:checked)]:line-through [&_li:has(input:checked)]:opacity-60 [&_li:has(input:checked)]:text-slate-400
    [&_img]:rounded-xl [&_img]:shadow-md [&_img]:max-w-full [&_img]:my-4`;

  return (
    <div onClick={handleContainerClick} className="space-y-4">
      {segments.map((seg, idx) => {
        if (seg.type === 'html_preview') {
          return (
            <InlineSandbox
              key={`inline-sandbox-${idx}`}
              htmlCode={seg.html}
              title="인라인 인터랙티브 프로토타입"
            />
          );
        }

        const html = renderMarkdownHtml(seg.content, assets);
        return (
          <div
            key={`md-segment-${idx}`}
            className={proseClasses}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
};
