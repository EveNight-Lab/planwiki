// @cohesive-file
/**
 * @domain 기획 문서 작업
 * @feature 스마트 플로팅 도구함
 * @phase 입력 (Trigger)
 * @target 모바일 최적화 인라인 선택 서식 바 및 퀵 생성 FAB
 * @trigger 텍스트 드래그 선택 또는 우측 하단 '+' FAB 탭
 * @desc 텍스트 선택 시 OS 복사 메뉴와 겹치지 않게 글자 아래쪽에 정밀 클램핑 서식 바를 띄우고, 우측 하단 FAB로 스크롤 없이 요소를 빠르게 삽입하는 스마트 툴바
 * @next src/components/doc/MarkdownEditor.tsx
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Code,
  Highlighter,
  Plus,
  Image,
  Table,
  CheckSquare,
  Lightbulb,
  Sparkles,
} from 'lucide-react';

interface Props {
  editorRef: React.RefObject<HTMLDivElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  mode: 'visual' | 'markdown';
  onFormatInline: (cmd: 'bold' | 'italic') => void;
  onFormatHeading: (tag: 'h1' | 'h2' | 'p') => void;
  onOpenTableModal: () => void;
  onInsertChecklist: () => void;
  onInsertCallout: () => void;
  onInsertInlineSandbox?: () => void;
  onTriggerImageUpload: () => void;
}

export const SmartFloatingToolbar: React.FC<Props> = ({
  editorRef,
  textareaRef,
  mode,
  onFormatInline,
  onFormatHeading,
  onOpenTableModal,
  onInsertChecklist,
  onInsertCallout,
  onInsertInlineSandbox,
  onTriggerImageUpload,
}) => {
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleCoords, setBubbleCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isFabOpen, setIsFabOpen] = useState(false);

  const bubbleRef = useRef<HTMLDivElement>(null);
  const fabMenuRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  // 셀렉션 체크: 단순 콕 찍기(커서만 있음)는 무시하고, 텍스트가 실제로 선택되었을 때만 글자 아래에 컴팩트 서식 툴바 표시
  const checkSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setShowBubble(false);
      return;
    }

    const selectedText = sel.toString().trim();
    if (!selectedText) {
      setShowBubble(false);
      return;
    }

    const range = sel.getRangeAt(0);

    // 에디터 컨테이너 내부 선택인지 확인
    const container = mode === 'visual' ? editorRef.current : textareaRef.current;
    if (!container || !container.contains(range.commonAncestorContainer)) {
      setShowBubble(false);
      return;
    }

    savedRangeRef.current = range.cloneRange();
    const rect = range.getBoundingClientRect();

    // 툴바 크기 추정 (서식 전용 컴팩트 사이즈 약 215px)
    const bubbleWidth = bubbleRef.current ? bubbleRef.current.offsetWidth : 215;
    const bubbleHeight = bubbleRef.current ? bubbleRef.current.offsetHeight : 38;

    // 1) 수평(Left) 정밀 클램프: 화면 우측/좌측 8px 안전 마진 보장
    const targetCenterX = rect.left + rect.width / 2;
    const idealLeft = targetCenterX - bubbleWidth / 2;
    const safePadding = 8;
    const minLeft = safePadding;
    const maxLeft = Math.max(safePadding, window.innerWidth - bubbleWidth - safePadding);
    const clampedLeft = Math.max(minLeft, Math.min(maxLeft, idealLeft));

    // 2) 수직(Top): OS 복사 메뉴가 글자 '위'에 뜨므로 툴바는 글자 '아래'에 배치하여 충돌 0%
    let targetTop = rect.bottom + 10;
    // 만약 화면 맨 아래라 공간이 부족하면 글자 위로 배치
    if (targetTop + bubbleHeight > window.innerHeight - 10) {
      targetTop = Math.max(10, rect.top - bubbleHeight - 10);
    }
    const clampedTop = Math.max(8, Math.min(window.innerHeight - bubbleHeight - 8, targetTop));

    setBubbleCoords({ top: clampedTop, left: clampedLeft });
    setShowBubble(true);
  }, [editorRef, textareaRef, mode]);

  // 마우스업 / 터치엔드 / selectionchange 감지
  useEffect(() => {
    const handleSelectionChange = () => {
      // 미세 디바운스로 안정적인 좌표 측정
      setTimeout(checkSelection, 60);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [checkSelection]);

  // 외부 클릭 시 FAB 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fabMenuRef.current && !fabMenuRef.current.contains(e.target as Node)) {
        setIsFabOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 서식 실행 시 저장된 셀렉션 복원 후 실행
  const restoreAndExec = (action: () => void) => {
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
    action();
    // 실행 후 다시 셀렉션 체크
    setTimeout(checkSelection, 50);
  };

  // 인라인 코드 적용
  const handleFormatCode = () => {
    restoreAndExec(() => {
      if (mode === 'visual') {
        const sel = window.getSelection();
        if (sel && sel.toString()) {
          const codeHtml = `<code class="bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-1 py-0.5 rounded font-mono text-xs">${sel.toString()}</code>`;
          document.execCommand('insertHTML', false, codeHtml);
        }
      }
    });
  };

  // 형광펜 강조 적용
  const handleHighlight = () => {
    restoreAndExec(() => {
      if (mode === 'visual') {
        const sel = window.getSelection();
        if (sel && sel.toString()) {
          const markHtml = `<mark class="bg-yellow-200 dark:bg-yellow-900/60 text-inherit px-1 py-0.5 rounded">${sel.toString()}</mark>`;
          document.execCommand('insertHTML', false, markHtml);
        }
      }
    });
  };

  return (
    <>
      {/* 1. 선택 글자 아래 플로팅 서식 바 (OS 복사 메뉴와 겹침 0%, 컴팩트 서식 전용) */}
      {showBubble && (
        <div
          ref={bubbleRef}
          style={{ top: `${bubbleCoords.top}px`, left: `${bubbleCoords.left}px` }}
          className="fixed z-50 bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-1 border border-slate-700/80 shadow-2xl select-none animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center gap-0.5 px-0.5 py-0.5">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                restoreAndExec(() => onFormatInline('bold'));
              }}
              title="굵게 (Bold)"
              className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-xl flex items-center justify-center font-bold text-xs hover:bg-slate-800 active:bg-blue-600 transition"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                restoreAndExec(() => onFormatInline('italic'));
              }}
              title="기울임 (Italic)"
              className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-xl flex items-center justify-center italic text-xs hover:bg-slate-800 active:bg-blue-600 transition"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                restoreAndExec(() => document.execCommand('strikeThrough', false));
              }}
              title="취소선"
              className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-xl flex items-center justify-center text-xs hover:bg-slate-800 active:bg-blue-600 transition"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                restoreAndExec(() => onFormatHeading('h2'));
              }}
              title="소제목 (H2)"
              className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-xl flex items-center justify-center font-bold text-xs hover:bg-slate-800 active:bg-blue-600 transition"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleFormatCode();
              }}
              title="인라인 코드"
              className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-xl flex items-center justify-center text-xs hover:bg-slate-800 active:bg-blue-600 transition"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleHighlight();
              }}
              title="형광펜 강조"
              className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-xl flex items-center justify-center text-xs hover:bg-slate-800 active:bg-blue-600 transition text-amber-300"
            >
              <Highlighter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. 우측 하단 미니 '+' 플로팅 액션 버튼 (FAB) & 퀵 생성 도구함 - 목차/맨위로 버튼과 크기/간격을 일체형으로 정돈 */}
      <div ref={fabMenuRef} className="fixed bottom-32 right-6 z-40 flex flex-col items-end">
        {/* 펼쳐지는 생성 메뉴 */}
        {isFabOpen && (
          <div className="mb-2.5 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-2 border border-slate-700/80 shadow-2xl flex flex-col gap-1 w-44 animate-in fade-in slide-in-from-bottom-3 duration-150">
            <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700/60 mb-1">
              빠른 콘텐츠 삽입
            </div>
            <button
              type="button"
              onClick={() => {
                setIsFabOpen(false);
                onTriggerImageUpload();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-xs text-left transition"
            >
              <Image className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">이미지 첨부</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFabOpen(false);
                onOpenTableModal();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-xs text-left transition"
            >
              <Table className="w-4 h-4 text-blue-400" />
              <span className="font-medium">기획 표 생성</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFabOpen(false);
                onInsertChecklist();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-xs text-left transition"
            >
              <CheckSquare className="w-4 h-4 text-cyan-400" />
              <span className="font-medium">할 일 체크박스</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFabOpen(false);
                onInsertCallout();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-xs text-left transition"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="font-medium">노트 / 콜아웃</span>
            </button>
            {onInsertInlineSandbox && (
              <button
                type="button"
                onClick={() => {
                  setIsFabOpen(false);
                  onInsertInlineSandbox();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 border border-purple-800/40 text-xs text-left transition"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-semibold">프로토타입 블록</span>
              </button>
            )}
          </div>
        )}

        {/* 목차/맨위로 버튼과 동일한 크기 및 룩앤필의 컴팩트 액션 버튼 */}
        <button
          type="button"
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`p-2.5 rounded-2xl active:scale-95 shadow-lg transition-all flex items-center gap-1.5 text-xs font-bold border ${
            isFabOpen
              ? 'bg-slate-800 text-white border-slate-700 shadow-slate-900/40'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500/40 shadow-indigo-500/30'
          }`}
          title="새 요소 빠른 삽입"
        >
          <Plus className={`w-4 h-4 transition-transform duration-200 ${isFabOpen ? 'rotate-45' : ''}`} />
          <span className="hidden sm:inline">빠른 삽입</span>
        </button>
      </div>
    </>
  );
};
