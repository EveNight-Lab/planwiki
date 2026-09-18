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
