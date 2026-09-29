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
import { replaceAssetUrls, restoreAssetUrls } from './assetHelper';

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

// Module-level context for assets map during Turndown serialization
let currentAssetsMap: Record<string, string> = {};

// Custom rule for image assets restoration (Turndown의 제멋대로 이스케이프 방지 및 독립 블록 줄바꿈 보장)
turndownService.addRule('imageAsset', {
  filter: 'img',
  replacement: (_, node) => {
    const el = node as HTMLElement;
    const src = el.getAttribute('src') || '';
    const alt = el.getAttribute('alt') || '';
    const dataAssetName = el.getAttribute('data-asset-name');

    let finalPath = '';

    // 1. data-asset-name 속성이 있으면 최우선으로 원본 파일명 보존
    if (dataAssetName) {
      finalPath = `assets/${dataAssetName}`;
    } else {
      // 2. 현재 전달된 assets 맵에서 src (Blob URL, Data URL 등)와 일치하는 filename 역조회
      for (const [filename, url] of Object.entries(currentAssetsMap)) {
        if (!filename || !url) continue;
        if (src === url || src.endsWith(url)) {
          finalPath = `assets/${filename}`;
          break;
        }
      }

      // 3. src에 이미 assets/ 가 포함된 경우 (예: assets/my-image.png 또는 http://.../assets/my-image.png)
      if (!finalPath && src.includes('assets/')) {
        const match = src.match(/(?:^|\/)assets\/(.+)$/);
        if (match) {
          let cleanName = match[1];
          cleanName = cleanName.replace(/^[<]+|[>]+$/g, '');
          try {
            cleanName = decodeURIComponent(cleanName);
          } catch {
            // ignore
          }
          finalPath = `assets/${cleanName}`;
        }
      }

      // 4. assets 맵에서 alt 텍스트와 일치하는 키가 있는 경우
      if (!finalPath && alt && currentAssetsMap[alt]) {
        finalPath = `assets/${alt}`;
      }

      // 5. 일반 외부 URL 이미지
      if (!finalPath) {
        finalPath = src;
      }
    }

    if (!finalPath) return '';
    // 반드시 앞뒤 2줄 바꿈(\n\n)을 보장하여 표나 문단과 절대 겹치지 않게 완벽 격리
    return `\n\n![${alt}](${finalPath})\n\n`;
  },
});

// Custom rule for table block: 표 앞뒤에 빈 줄을 엄격히 보장하여 파서 오작동 방지
turndownService.addRule('tableIsolation', {
  filter: 'table',
  replacement: (content) => {
    return `\n\n${content.trim()}\n\n`;
  },
});

function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * 인라인 프로토타입 HTML 위젯 카드 문자열 생성 (완성형 다크 테마 일원화)
 */
export function createPrototypeWidgetHtml(rawHtmlCode: string): string {
  const encoded = encodeURIComponent(rawHtmlCode.trim());
  const safeSrcDoc = escapeHtmlAttr(rawHtmlCode.trim());
  const escapedTextareaCode = escapeHtmlAttr(rawHtmlCode.trim());

  return `<div class="prototype-embed-widget my-6 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-xl select-none" contenteditable="false" data-prototype-code="${encoded}">
  <div class="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-white select-none">
    <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
      <span class="flex h-2.5 w-2.5 relative shrink-0">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
      </span>
      <span class="text-xs font-semibold tracking-wide text-slate-200 truncate max-w-[140px] sm:max-w-none">
        인라인 프로토타입
      </span>
      <span class="text-[10px] bg-slate-800 text-slate-400 px-1.5 sm:px-2 py-0.5 rounded-full font-mono shrink-0 hidden xs:inline">
        인라인 샌드박스
      </span>
    </div>

    <div class="flex items-center gap-1 sm:gap-1.5 shrink-0">
      <div class="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
        <button type="button" class="prototype-viewport-desktop p-1.5 rounded-md text-white bg-slate-700 transition" title="가로 모드 (데스크톱 와이드 비율)">
          <svg class="w-3.5 h-3.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
        </button>
        <button type="button" class="prototype-viewport-mobile p-1.5 rounded-md text-slate-400 hover:text-white transition" title="세로 모드 (모바일 스마트폰 비율 375px)">
          <svg class="w-3.5 h-3.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/></svg>
        </button>
      </div>

      <button type="button" class="prototype-code-toggle flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-semibold rounded-lg border bg-slate-800 text-blue-400 border-slate-700 hover:bg-slate-700 transition" title="HTML/JS 코드 편집기 열기">
        <svg class="w-3.5 h-3.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        <span class="hidden sm:inline pointer-events-none">코드 편집</span>
      </button>

      <button type="button" class="prototype-reload-btn p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition" title="프로토타입 재실행">
        <svg class="w-3.5 h-3.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
      </button>

      <button type="button" class="prototype-fullscreen-btn p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition" title="앱 내 전체화면 토글">
        <svg class="w-3.5 h-3.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
      </button>

      <button type="button" class="prototype-external-btn p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition" title="새 브라우저 탭에서 단독 실행">
        <svg class="w-3.5 h-3.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
      </button>

      <button type="button" class="prototype-delete-btn p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800 transition" title="프로토타입 블록 삭제">
        <svg class="w-3.5 h-3.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
      </button>
    </div>
  </div>

  <div class="prototype-code-panel hidden border-b border-slate-800 bg-slate-950 p-3 sm:p-4 transition-all">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-mono text-slate-400">인라인 HTML/CSS/JS 코드 (입력 시 자동 반영)</span>
      <div class="flex items-center gap-2">
        <button type="button" class="prototype-code-clear-btn flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800 rounded-lg text-xs font-semibold transition shadow-xs" title="코드 전체 지우기">
          <span>코드 지우기</span>
        </button>
        <button type="button" class="prototype-code-close-btn p-1 text-slate-400 hover:text-white transition">
          ✕
        </button>
      </div>
    </div>
    <textarea class="prototype-code-textarea w-full bg-slate-900 text-slate-100 font-mono text-xs p-3 rounded-xl border border-slate-800 outline-none focus:border-blue-500 resize-y" rows="8" spellcheck="false">${escapedTextareaCode}</textarea>
  </div>

  <div class="p-3 sm:p-5 flex justify-center bg-dot-pattern">
    <div class="prototype-iframe-container w-full transition-all duration-300 bg-white dark:bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-800 max-w-full">
      <iframe srcdoc="${safeSrcDoc}" class="w-full h-72 border-none block pointer-events-auto" sandbox="allow-scripts allow-modals allow-forms"></iframe>
    </div>
  </div>
</div><p><br></p>`;
}

/**
 * Convert Markdown string to HTML for Visual Rich Editor
 */
export function markdownToHtml(md: string, assets: Record<string, string> = {}): string {
  if (!md) return '<p><br></p>';
  let processed = replaceAssetUrls(md, assets);

  // 1. 프로토타입 코드 블록(```html:preview ...)을 임시 토큰으로 분리 치환 (marked.parse 태그 훼손 원천 차단)
  const INLINE_SANDBOX_REGEX = /```(?:html:preview|html:interactive|html:sandbox)\s*([\s\S]*?)```/gi;
  const prototypeWidgets: string[] = [];
  processed = processed.replace(INLINE_SANDBOX_REGEX, (_, code) => {
    const token = `<!--PLANCRAFT_SANDBOX_TOKEN_${prototypeWidgets.length}-->`;
    prototypeWidgets.push(createPrototypeWidgetHtml(code));
    return `\n\n${token}\n\n`;
  });

  try {
    let rawHtml = marked.parse(processed, { gfm: true, breaks: true }) as string;

    // 2. 마크다운 파싱 완료 후 안전한 완성형 위젯 HTML로 정밀 복원
    prototypeWidgets.forEach((widgetHtml, idx) => {
      const tokenRegex = new RegExp(`(<p>\\s*)?<!--PLANCRAFT_SANDBOX_TOKEN_${idx}-->(\\s*<\\/p>)?`, 'g');
      rawHtml = rawHtml.replace(tokenRegex, widgetHtml);
    });

    let taskIdx = 0;
    rawHtml = rawHtml.replace(/<input\s+([^>]*?)type=["']checkbox["']([^>]*?)>/gi, (match) => {
      const idx = taskIdx++;
      const cleaned = match
        .replace(/\s*disabled(?:=["'][^"']*["'])?/gi, '')
        .replace(/class=["'][^"']*["']/gi, '');
      return `<input type="checkbox" data-task-index="${idx}" class="task-checkbox cursor-pointer w-4 h-4 rounded accent-blue-600 align-middle mr-1.5 transition-transform active:scale-90" ${cleaned.slice(6)}`;
    });

    // 3. 에셋 매핑된 이미지들에 data-asset-name 속성 안전 부여 (대용량 URL 정규식 컴파일 원천 배제)
    rawHtml = rawHtml.replace(/<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi, (m, before, srcVal, after) => {
      if (m.includes('data-asset-name=')) return m;
      let matchedFilename = '';
      for (const [filename, url] of Object.entries(assets)) {
        if (!filename || !url) continue;
        if (srcVal === url || srcVal.endsWith(url)) {
          matchedFilename = filename;
          break;
        }
      }
      if (matchedFilename) {
        return `<img ${before}src="${srcVal}" data-asset-name="${matchedFilename}"${after}>`;
      }
      return m;
    });

    return rawHtml;
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
  currentAssetsMap = assets || {};
  const processedHtml = restoreAssetUrls(html, assets);

  try {
    const md = turndownService.turndown(processedHtml).trim();
    currentAssetsMap = {};
    return md;
  } catch (err) {
    currentAssetsMap = {};
    console.error('Failed to convert html to markdown:', err);
    return html;
  }
}
