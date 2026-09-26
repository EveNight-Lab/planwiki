/**
 * @domain 기획 문서 작업
 * @feature 마크다운 기획 작성 & 표/그림 보기
 * @phase 처리
 * @target 마크다운과 리치 텍스트 HTML 간 양방향 변환 모듈
 * @desc 블로그 스타일 위지윅 편집과 마크다운 표준 파일 규격 간의 양방향 변환 처리
 */
import { marked } from 'marked';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
});

turndownService.use(gfm);

// Custom rule for callout box (blockquote with icon)
turndownService.addRule('calloutBlock', {
  filter: (node) => {
    return node.nodeName === 'BLOCKQUOTE';
  },
  replacement: (content) => {
    const trimmed = content.trim();
    const lines = trimmed.split('\n').map((l) => `> ${l}`.trimEnd());
    return `\n\n${lines.join('\n')}\n\n`;
  },
});

// Custom rule for prototype embed widget
turndownService.addRule('prototypeWidget', {
  filter: (node) => {
    return node.nodeName === 'DIV' && (node as HTMLElement).classList.contains('prototype-embed-widget');
  },
  replacement: (_, node) => {
    const el = node as HTMLElement;
    const encoded = el.getAttribute('data-prototype-code') || '';
    const code = encoded ? decodeURIComponent(encoded) : '';
    return `\n\n\`\`\`html:preview\n${code.trim()}\n\`\`\`\n\n`;
  },
});

/**
 * 인라인 프로토타입 HTML 위젯 카드 문자열 생성
 */
export function createPrototypeWidgetHtml(rawHtmlCode: string): string {
  const encoded = encodeURIComponent(rawHtmlCode.trim());
  const safeSrcDoc = rawHtmlCode.trim().replace(/"/g, '&quot;');
  return `<div class="prototype-embed-widget my-5 border border-blue-200 dark:border-blue-900 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 select-none shadow-xs" contenteditable="false" data-prototype-code="${encoded}">
  <div class="flex items-center justify-between px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 select-none">
    <span class="flex items-center gap-1.5">✨ 인라인 인터랙티브 프로토타입</span>
    <div class="flex items-center gap-2">
      <button type="button" class="prototype-view-toggle px-2 py-0.5 rounded text-[11px] bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50">코드 보기</button>
      <button type="button" class="prototype-delete-btn text-slate-400 hover:text-red-500 font-bold px-1.5 py-0.5 rounded">삭제</button>
    </div>
  </div>
  <div class="p-3 bg-dot-pattern flex justify-center">
    <iframe srcdoc="${safeSrcDoc}" class="w-full h-64 border-none rounded-xl bg-white dark:bg-slate-950 shadow-inner pointer-events-auto" sandbox="allow-scripts allow-modals allow-forms"></iframe>
  </div>
  <div class="prototype-code-panel hidden p-3 bg-slate-950 text-slate-200 text-xs font-mono border-t border-slate-800">
    <textarea class="prototype-code-textarea w-full bg-slate-900 text-slate-100 p-2 rounded border border-slate-800 font-mono text-xs outline-none focus:border-blue-500 resize-y" rows="6">${rawHtmlCode.trim()}</textarea>
    <div class="flex justify-end mt-2">
      <button type="button" class="prototype-code-save-btn px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition">코드 적용</button>
    </div>
  </div>
</div><p><br></p>`;
}

/**
 * Convert Markdown string to HTML for Visual Rich Editor
 */
export function markdownToHtml(md: string, assets: Record<string, string> = {}): string {
  if (!md) return '<p><br></p>';
  let processed = md;
  for (const [filename, url] of Object.entries(assets)) {
    const regex = new RegExp(`assets/${filename}`, 'g');
    processed = processed.replace(regex, url);
  }

  // 1. 프로토타입 코드 블록(```html:preview ...)을 블로그 위젯 카드로 선행 치환
  const INLINE_SANDBOX_REGEX = /```(?:html:preview|html:interactive|html:sandbox)\s*([\s\S]*?)```/gi;
  processed = processed.replace(INLINE_SANDBOX_REGEX, (_, code) => {
    return createPrototypeWidgetHtml(code);
  });

  try {
    const rawHtml = marked.parse(processed, { gfm: true, breaks: true }) as string;
    let taskIdx = 0;
    return rawHtml.replace(/<input\s+([^>]*?)type=["']checkbox["']([^>]*?)>/gi, (match) => {
      const idx = taskIdx++;
      const cleaned = match
        .replace(/\s*disabled(?:=["'][^"']*["'])?/gi, '')
        .replace(/class=["'][^"']*["']/gi, '');
      return `<input type="checkbox" data-task-index="${idx}" class="task-checkbox cursor-pointer w-4 h-4 rounded accent-blue-600 align-middle mr-1.5 transition-transform active:scale-90" ${cleaned.slice(6)}`;
    });
  } catch (err) {
    console.error('Failed to parse markdown to html:', err);
    return `<p>${md}</p>`;
  }
}

/**
 * Convert HTML back to clean Markdown for saving to content.md
 */
export function htmlToMarkdown(html: string, assets: Record<string, string> = {}): string {
  if (!html) return '';
  let processedHtml = html;
  for (const [filename, url] of Object.entries(assets)) {
    processedHtml = processedHtml.replaceAll(url, `assets/${filename}`);
  }

  try {
    return turndownService.turndown(processedHtml).trim();
  } catch (err) {
    console.error('Failed to convert html to markdown:', err);
    return html;
  }
}
