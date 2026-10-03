// @cohesive-file
/**
 * @domain 기획 문서 작업
 * @feature 단락 본문 내 인라인 HTML 샌드박스
 * @phase 출력 (Render)
 * @target 본문 인라인 완성형 다크 프로토타입 샌드박스
 * @desc 본문 글 중간에 배치되어 반응형 뷰포트, 실시간 콘솔, 자체 코드 편집을 지원하는 독립 샌드박스
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  RefreshCw,
  Code,
  Smartphone,
  Monitor,
  Trash2,
  X,
  Terminal,
  ExternalLink,
  Maximize2,
  Minimize2,
  Play,
  Lock,
} from 'lucide-react';

interface Props {
  htmlCode: string;
  title?: string;
  onUpdateHtmlCode?: (newHtml: string) => void;
  onDelete?: () => void;
}

interface ConsoleLog {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  text: string;
  time: string;
}

export const InlineSandbox: React.FC<Props> = ({
  htmlCode,
  title = '인라인 프로토타입',
  onUpdateHtmlCode,
  onDelete,
}) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [editableCode, setEditableCode] = useState(htmlCode);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync external code update
  useEffect(() => {
    setEditableCode(htmlCode);
  }, [htmlCode]);

  // ESC to exit full screen
  useEffect(() => {
    if (!isFullScreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  // Listen to iframe console messages
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.__plancraft_console) {
        const { type, args } = e.data;
        const text = args.map((arg: unknown) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ');
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        setLogs((prev) => [...prev.slice(-30), {
          id: Math.random().toString(),
          type: type || 'log',
          text,
          time: timeStr,
        }]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
    setLogs([]);
  };

  // Auto-sync code changes to parent markdown (debounced 300ms)
  useEffect(() => {
    if (!onUpdateHtmlCode || editableCode === htmlCode) return;
    const timer = setTimeout(() => {
      onUpdateHtmlCode(editableCode);
    }, 300);
    return () => clearTimeout(timer);
  }, [editableCode, htmlCode, onUpdateHtmlCode]);

  const handleClearCode = () => {
    setEditableCode('');
    if (onUpdateHtmlCode) {
      onUpdateHtmlCode('');
    }
    handleReload();
  };

  // Inject console interceptor script into html
  const sandboxHtml = useMemo(() => {
    const interceptor = `
      <script>
        (function() {
          const originalLog = console.log;
          const originalWarn = console.warn;
          const originalError = console.error;
          function send(type, args) {
            try {
              window.parent.postMessage({
                __plancraft_console: true,
                type: type,
                args: Array.from(args)
              }, '*');
            } catch(e) {}
          }
          console.log = function() { send('log', arguments); originalLog.apply(console, arguments); };
          console.warn = function() { send('warn', arguments); originalWarn.apply(console, arguments); };
          console.error = function() { send('error', arguments); originalError.apply(console, arguments); };
          window.onerror = function(msg, url, line) {
            send('error', ['[Uncaught]', msg, 'line ' + line]);
          };
        })();
      </script>
    `;

    const codeToInject = editableCode || htmlCode;
    const viewportMeta = codeToInject.includes('name="viewport"') || codeToInject.includes("name='viewport'")
    const isolationStyles = `
      <style>
        /* PlanCraft 이중 격리 기본 스타일: 연쇄 스크롤 방지 및 독립 뷰포트 확보 */
        html, body {
          overscroll-behavior: contain;
        }
      </style>
    `;

    const injection = `${viewportMeta}${interceptor}${isolationStyles}`;
    if (codeToInject.includes('<head>')) {
      return codeToInject.replace('<head>', `<head>${injection}`);
    }
    return injection + codeToInject;
  }, [editableCode, htmlCode]);

  const handleOpenExternal = () => {
    const blob = new Blob([editableCode || htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div
      className={`border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-900 shadow-xl transition-all ${
        isFullScreen
          ? 'fixed inset-0 z-50 m-0 rounded-none h-screen w-screen flex flex-col'
          : 'my-6 rounded-2xl'
      }`}
    >
      {/* 1. Sandbox Dark Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-white select-none">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold tracking-wide text-slate-200 truncate max-w-[140px] sm:max-w-none">
            {title}
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 sm:px-2 py-0.5 rounded-full font-mono shrink-0 hidden xs:inline">
            인라인 샌드박스
          </span>
        </div>

        {/* Header Right Action Buttons (7 Essential Actions) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* 1) Viewport size toggle (가로 모드: 데스크톱 비율 / 세로 모드: 모바일 비율) */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => setViewportMode('desktop')}
              title="가로 모드 (데스크톱 와이드 비율)"
              className={`p-1.5 rounded-md transition ${viewportMode === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('mobile')}
              title="세로 모드 (모바일 스마트폰 비율 375px)"
              className={`p-1.5 rounded-md transition ${viewportMode === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 터치 스크롤 보호 / 프로토타입 조작 모드 토글 */}
          {!isFullScreen && (
            <button
              type="button"
              onClick={() => setIsInteracting(!isInteracting)}
              title={isInteracting ? '스크롤 보호 모드로 전환 (문서 스크롤 우선)' : '프로토타입 조작 모드 활성화'}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition ${
                isInteracting
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {isInteracting ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">조작 중</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">스크롤 보호</span>
                </>
              )}
            </button>
          )}

          {/* 2) Console toggle */}
          <button
            type="button"
            onClick={() => setShowConsole(!showConsole)}
            title="콘솔 로그 창 토글"
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-medium rounded-lg border transition ${
              showConsole
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span><span className="hidden sm:inline">콘솔 </span>{logs.length > 0 && `(${logs.length})`}</span>
          </button>

          {/* 3) Code Editor Toggle */}
          <button
            type="button"
            onClick={() => setShowCodeEditor(!showCodeEditor)}
            title="HTML/JS 코드 편집기 토글"
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition ${
              showCodeEditor
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-slate-800 text-blue-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">코드 편집</span>
          </button>

          {/* 4) Reload iframe */}
          <button
            type="button"
            onClick={handleReload}
            title="프로토타입 재실행"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* 5) In-App Full Screen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? '전체화면 종료 (ESC)' : '앱 내 전체화면으로 넓게 테스트'}
            className={`p-1.5 rounded-lg border transition ${
              isFullScreen
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* 6) External Window */}
          <button
            type="button"
            onClick={handleOpenExternal}
            title="새 브라우저 탭에서 단독 실행"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* 7) Delete prototype if onDelete provided */}
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm('이 프로토타입 블록을 삭제하시겠습니까?')) {
                  onDelete();
                }
              }}
              title="프로토타입 블록 삭제"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Collapsible Code Editor Panel */}
      {showCodeEditor && (
        <div className="border-b border-slate-800 bg-slate-950 p-3 sm:p-4 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">인라인 HTML/CSS/JS 코드 (입력 시 자동 반영)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearCode}
                title="코드 전체 지우기"
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800 rounded-lg text-xs font-semibold transition shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>코드 지우기</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCodeEditor(false)}
                className="p-1 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <textarea
            value={editableCode}
            onChange={(e) => setEditableCode(e.target.value)}
            rows={10}
            className="w-full bg-slate-900 text-slate-100 font-mono text-xs p-3 rounded-xl border border-slate-800 outline-none focus:border-blue-500 resize-y"
            placeholder="<!DOCTYPE html>..."
            spellCheck={false}
          />
        </div>
      )}

      {/* 3. Collapsible Console Panel */}
      {showConsole && (
        <div className="bg-slate-950 border-b border-slate-800 p-3 max-h-48 overflow-y-auto font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">실행 콘솔 로그</span>
            <button
              type="button"
              onClick={() => setLogs([])}
              className="text-[10px] text-slate-400 hover:text-white transition"
            >
              로그 비우기
            </button>
          </div>
          {logs.length === 0 ? (
            <div className="text-slate-600 italic py-2 text-center text-xs">기록된 콘솔 출력이 없습니다.</div>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-2 py-0.5 ${
                    log.type === 'error'
                      ? 'text-red-400 bg-red-950/20 px-1 rounded'
                      : log.type === 'warn'
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="text-slate-600 shrink-0 text-[10px]">{log.time}</span>
                  <span className="break-all">{log.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Interactive iframe Container */}
      <div
        className={`p-3 sm:p-5 flex justify-center bg-dot-pattern ${
          isFullScreen ? 'flex-1 items-center overflow-auto' : ''
        }`}
      >
        <div
          className={`relative w-full transition-all duration-300 bg-white dark:bg-slate-950 overflow-hidden ${
            viewportMode === 'mobile'
              ? 'max-w-[375px] rounded-[36px] border-[6px] border-slate-800 shadow-2xl ring-1 ring-slate-700/50'
              : 'max-w-full rounded-xl border border-slate-800 shadow-inner'
          } ${isFullScreen ? 'h-full flex flex-col rounded-none border-none' : ''}`}
        >
          {/* 모바일 스마트폰 상단 노치/스피커 바 */}
          {viewportMode === 'mobile' && !isFullScreen && (
            <div className="bg-slate-800 py-1.5 flex justify-center items-center gap-1.5 select-none shrink-0 border-b border-slate-700/50">
              <div className="w-12 h-1 bg-slate-600 rounded-full" />
              <div className="w-2 h-2 rounded-full bg-slate-700" />
            </div>
          )}

          {/* 터치 스크롤 보호 가드 오버레이 (조작 비활성화 상태) */}
          {!isInteracting && !isFullScreen && (
            <div
              onClick={() => setIsInteracting(true)}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/25 backdrop-blur-[1px] hover:bg-slate-950/15 transition-all cursor-pointer select-none group"
              title="탭하여 프로토타입 조작 활성화 (터치 스크롤 방해 방지)"
            >
              <div className="px-4 py-2 rounded-full bg-slate-900/90 text-white text-xs font-semibold shadow-xl border border-slate-700/80 flex items-center gap-2 group-hover:scale-105 group-hover:bg-blue-600 transition-all">
                <Play className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                <span>터치하여 조작 시작</span>
              </div>
              <span className="text-[11px] text-slate-300 mt-2 font-medium drop-shadow hidden xs:inline">
                스크롤할 때는 그냥 지나치셔도 됩니다
              </span>
            </div>
          )}

          <iframe
            key={reloadKey}
            ref={iframeRef}
            title={title}
            srcDoc={sandboxHtml}
            sandbox="allow-scripts allow-modals allow-forms"
            className={`w-full border-none block transition-all duration-300 ${
              isFullScreen ? 'flex-1 pointer-events-auto' : viewportMode === 'mobile' ? 'h-[580px]' : 'h-80'
            } ${!isInteracting && !isFullScreen ? 'pointer-events-none' : 'pointer-events-auto'}`}
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
