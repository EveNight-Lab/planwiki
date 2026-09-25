/**
 * @domain 기획 문서 작업
 * @feature 단락 본문 내 인라인 HTML 샌드박스
 * @phase 출력 (Render)
 * @target 단락 본문 인라인 대화형 샌드박스
 * @desc 마크다운 본문 중간에 삽입되어 실시간으로 동작하는 독립 iframe 프로토타입 화면
 */

import React, { useState } from 'react';
import { Sparkles, RefreshCw, Code, Smartphone, Monitor } from 'lucide-react';

interface Props {
  htmlCode: string;
  title?: string;
}

export const InlineSandbox: React.FC<Props> = ({
  htmlCode,
  title = '인라인 프로토타입',
}) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [showSource, setShowSource] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div className="my-6 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/60 dark:bg-slate-900/60 shadow-xs transition-all">
      {/* Sandbox Mini Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs select-none">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{title}</span>
          </span>
          <span className="hidden sm:inline text-[10px] text-slate-400 font-medium">
            (대화형 HTML)
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
          {/* Mobile/Desktop toggle */}
          <button
            type="button"
            onClick={() => setViewportMode(viewportMode === 'desktop' ? 'mobile' : 'desktop')}
            title={viewportMode === 'desktop' ? '모바일 뷰 (375px)' : '전체 너비 뷰'}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {viewportMode === 'desktop' ? (
              <Smartphone className="w-3.5 h-3.5" />
            ) : (
              <Monitor className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Source code toggle */}
          <button
            type="button"
            onClick={() => setShowSource(!showSource)}
            title={showSource ? '소스 코드 숨기기' : '소스 코드 보기'}
            className={`p-1 rounded transition ${
              showSource
                ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400'
                : 'hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          {/* Reload iframe */}
          <button
            type="button"
            onClick={handleReload}
            title="화면 새로고침"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Source Code View (Optional collapse) */}
      {showSource && (
        <div className="p-3 bg-slate-950 text-slate-200 border-b border-slate-800 text-xs font-mono overflow-x-auto max-h-60 scrollbar-thin">
          <pre className="m-0 leading-relaxed">{htmlCode}</pre>
        </div>
      )}

      {/* Interactive iframe Container */}
      <div className="p-3 sm:p-5 flex justify-center bg-dot-pattern">
        <div
          className={`w-full transition-all duration-300 bg-white dark:bg-slate-950 rounded-xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-800 ${
            viewportMode === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
          }`}
        >
          <iframe
            key={reloadKey}
            title={title}
            srcDoc={htmlCode}
            sandbox="allow-scripts allow-modals allow-forms"
            className="w-full h-72 border-none block"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

// Zero-config live preview for Inspector Board (Port 5174)
// @ts-expect-error Inspector preview metadata
InlineSandbox._previewProps = {
  title: '간편 결제 모달 시뮬레이터',
  htmlCode: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; padding: 20px; background: #f8fafc; text-align: center; }
    .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); max-width: 320px; margin: 0 auto; }
    button { background: #3b82f6; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: bold; cursor: pointer; }
    button:hover { background: #2563eb; }
  </style>
</head>
<body>
  <div class="card">
    <h3 style="margin: 0 0 10px; color: #1e293b;">원클릭 결제</h3>
    <p style="color: #64748b; font-size: 14px; margin-bottom: 16px;">결제 수단을 확인하세요.</p>
    <button onclick="alert('결제 승인 완료!')">29,000원 결제</button>
  </div>
</body>
</html>`,
};
