/**
 * @domain 기획 문서 작업
 * @feature 단락 본문 내 인라인 HTML 샌드박스
 * @phase 출력 (Render)
 * @target 단락 본문 인라인 대화형 샌드박스
 * @desc 마크다운 본문 중간에 삽입되어 실시간으로 동작하는 독립 iframe 프로토타입 화면
 */

import React, { useState } from 'react';
import { Sparkles, RefreshCw, Code, Smartphone, Monitor, Trash2, Check, X } from 'lucide-react';

interface Props {
  htmlCode: string;
  title?: string;
  onUpdateHtmlCode?: (newHtml: string) => void;
  onDelete?: () => void;
}

export const InlineSandbox: React.FC<Props> = ({
  htmlCode,
  title = '인라인 프로토타입',
  onUpdateHtmlCode,
  onDelete,
}) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [showSource, setShowSource] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [editableCode, setEditableCode] = useState(htmlCode);

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
  };

  const handleApplyCode = () => {
    if (onUpdateHtmlCode) {
      onUpdateHtmlCode(editableCode);
    }
    handleReload();
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
            onClick={() => {
              if (!showSource) {
                setEditableCode(htmlCode);
              }
              setShowSource(!showSource);
            }}
            title={showSource ? '코드 패널 닫기' : '코드 보기 / 편집'}
            className={`flex items-center gap-1 px-1.5 py-1 rounded transition text-xs font-semibold ${
              showSource
                ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400'
                : 'hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span className="text-[11px]">{onUpdateHtmlCode ? '코드 편집' : '코드'}</span>
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

          {/* Delete prototype if onDelete provided */}
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm('이 프로토타입 블록을 삭제하시겠습니까?')) {
                  onDelete();
                }
              }}
              title="프로토타입 블록 삭제"
              className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Source Code View / Inline Editor */}
      {showSource && (
        <div className="bg-slate-950 text-slate-200 border-b border-slate-800 text-xs font-mono">
          {onUpdateHtmlCode ? (
            <div className="p-3">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                <span>HTML/CSS/JS 코드 직접 편집</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyCode}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold text-xs transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>적용</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditableCode(htmlCode);
                      setShowSource(false);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <textarea
                value={editableCode}
                onChange={(e) => setEditableCode(e.target.value)}
                rows={10}
                className="w-full bg-slate-900 text-slate-100 font-mono text-xs p-2.5 rounded-lg border border-slate-800 outline-none focus:border-blue-500 resize-y"
                placeholder="<!DOCTYPE html>..."
              />
            </div>
          ) : (
            <div className="p-3 overflow-x-auto max-h-60 scrollbar-thin">
              <pre className="m-0 leading-relaxed">{htmlCode}</pre>
            </div>
          )}
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
