// @cohesive-file
/**
 * @domain 프로토타입 & AI 전달
 * @feature 웹 화면 직접 테스트 (코드펜 대체)
 * @phase 출력
 * @target 독립된 화면 테스트 상자 & 콘솔 출력창
 * @desc AI가 짜준 단일 HTML 코드를 코드펜 없이 브라우저 안에서 즉시 실행하고 수정하는 화면
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Code,
  RefreshCw,
  ExternalLink,
  Terminal,
  Smartphone,
  Monitor,
  Check,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface Props {
  initialCode: string;
  onSaveCode: (code: string) => void;
  title?: string;
}

interface ConsoleLog {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  text: string;
  time: string;
}

export const LiveSandbox: React.FC<Props> = ({ initialCode, onSaveCode, title = 'HTML 프로토타입 샌드박스' }) => {
  const [code, setCode] = useState(initialCode);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [isSaved, setIsSaved] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ESC to exit full screen
  useEffect(() => {
    if (!isFullScreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  const handleCodeChange = (newVal: string) => {
    setCode(newVal);
    setIsSaved(false);
  };

  // Debounced auto-save code
  useEffect(() => {
    const timer = setTimeout(() => {
      onSaveCode(code);
      setIsSaved(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [code, onSaveCode]);

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

    if (code.includes('<head>')) {
      return code.replace('<head>', `<head>${interceptor}`);
    }
    return interceptor + code;
  }, [code]);

  const handleOpenExternal = () => {
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div
      className={`border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-900 shadow-xl transition-all ${
        isFullScreen
          ? 'fixed inset-0 z-50 m-0 rounded-none h-screen w-screen flex flex-col'
          : 'mt-4 rounded-2xl'
      }`}
    >
      {/* Sandbox Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-white">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold tracking-wide text-slate-200 truncate max-w-[120px] sm:max-w-none">
            {title}
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 sm:px-2 py-0.5 rounded-full font-mono shrink-0 hidden xs:inline">
            인라인 샌드박스
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Viewport size toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => setViewportMode('desktop')}
              title="데스크톱 뷰 (100%)"
              className={`p-1.5 rounded-md transition ${viewportMode === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('mobile')}
              title="모바일 뷰 (375px)"
              className={`p-1.5 rounded-md transition ${viewportMode === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Console toggle */}
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

          {/* Code Editor Toggle */}
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

          {/* Reload iframe */}
          <button
            type="button"
            onClick={() => {
              setReloadKey((k) => k + 1);
              setLogs([]);
            }}
            title="프로토타입 재실행"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* In-App Full Screen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? '전체화면 종료 (ESC)' : '앱 내 전체화면으로 넓게 테스트 (게임/가상 조이스틱 등)'}
            className={`p-1.5 rounded-lg border transition ${
              isFullScreen
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* External Window */}
          <button
            type="button"
            onClick={handleOpenExternal}
            title="새 브라우저 탭에서 단독 실행"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Code Editor Panel (Collapsible) */}
      {showCodeEditor && (
        <div className="border-b border-slate-800 bg-slate-950 p-3 sm:p-4 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">preview.html</span>
              <span className={`text-[10px] flex items-center gap-1 ${isSaved ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                {isSaved ? <Check className="w-3 h-3" /> : null}
                {isSaved ? '로컬 저장됨' : '저장 대기 중...'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              코드를 수정하면 샌드박스에 즉시 반영됩니다.
            </span>
          </div>
          <textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="w-full h-64 font-mono text-xs leading-relaxed p-3 bg-slate-900 text-blue-200 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
            spellCheck={false}
          />
        </div>
      )}

      {/* Sandbox Live Viewport */}
      <div
        className={`bg-slate-900/60 p-2.5 sm:p-4 flex justify-center overflow-hidden ${
          isFullScreen ? 'flex-1 w-full h-full min-h-0' : 'min-h-[340px] sm:min-h-[380px]'
        }`}
      >
        <div
          className={`transition-all duration-300 bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-700/50 max-w-full ${
            viewportMode === 'mobile'
              ? 'w-[375px] h-full max-h-[700px]'
              : isFullScreen
                ? 'w-full h-full'
                : 'w-full h-[360px] sm:h-[420px]'
          }`}
        >
          <iframe
            key={reloadKey}
            ref={iframeRef}
            srcDoc={sandboxHtml}
            title={title}
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            className="w-full h-full border-0"
          />
        </div>
      </div>

      {/* Mini Console Panel (Collapsible) */}
      {showConsole && (
        <div className="bg-slate-950 border-t border-slate-800 p-3 max-h-48 overflow-y-auto font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-500 text-[11px]">
            <span>인라인 콘솔 출력 (Console Logs)</span>
            <button
              onClick={() => setLogs([])}
              className="text-slate-400 hover:text-white transition text-[10px] underline"
            >
              지우기
            </button>
          </div>
          {logs.length === 0 ? (
            <div className="text-slate-600 italic py-2">아직 발생한 콘솔 로그가 없습니다.</div>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-2 py-0.5 ${
                    log.type === 'error'
                      ? 'text-red-400'
                      : log.type === 'warn'
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="text-slate-600 shrink-0 text-[10px]">{log.time}</span>
                  <span className="shrink-0 font-bold uppercase text-[10px] opacity-70">[{log.type}]</span>
                  <span className="break-all">{log.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
