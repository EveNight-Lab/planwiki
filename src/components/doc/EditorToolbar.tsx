// @cohesive-file
/**
 * @domain 기획 문서 작업
 * @feature 마크다운 기획 작성 & 표/그림 보기
 * @phase 입력
 * @target 기획서 에디터 상단 서식 툴바
 * @desc 블로그(비주얼) 편집 모드 및 마크다운 원본 모드용 상단 서식 및 도구 제어 툴바
 * @next src/components/doc/MarkdownEditor.tsx
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Table,
  Image,
  CheckSquare,
  Eye,
  Save,
  Bold,
  Italic,
  Lightbulb,
  FileText,
  Code2,
  ChevronDown,
  Heading1,
  Heading2,
  Type,
  Rows,
  Columns,
} from 'lucide-react';

interface Props {
  mode: 'visual' | 'markdown';
  onToggleMode: (mode: 'visual' | 'markdown') => void;
  onFormatHeading: (tag: 'h1' | 'h2' | 'p') => void;
  onFormatInline: (cmd: 'bold' | 'italic') => void;
  onInsertCallout: () => void;
  onOpenTableModal: () => void;
  onAddTableRow: () => void;
  onAddTableCol: () => void;
  onInsertChecklist: () => void;
  onInsertInlineSandbox?: () => void;
  onTriggerImageUpload: () => void;
  isSaved: boolean;
  showPreview: boolean;
  onTogglePreview: () => void;
  onManualSave: () => void;
  onClose: () => void;
}

export const EditorToolbar: React.FC<Props> = ({
  mode,
  onToggleMode,
  onFormatHeading,
  onFormatInline,
  onInsertCallout,
  onOpenTableModal,
  onAddTableRow,
  onAddTableCol,
  onInsertChecklist,
  onInsertInlineSandbox,
  onTriggerImageUpload,
  isSaved,
  showPreview,
  onTogglePreview,
  onManualSave,
  onClose,
}) => {
  // Dropdown states
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);

  const styleMenuRef = useRef<HTMLDivElement>(null);
  const tableMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (styleMenuRef.current && !styleMenuRef.current.contains(e.target as Node)) {
        setShowStyleMenu(false);
      }
      if (tableMenuRef.current && !tableMenuRef.current.contains(e.target as Node)) {
        setShowTableMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 select-none">
      {/* Left Toolbar Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
        {/* Mode Switcher Tabs */}
        <div className="flex items-center p-0.5 bg-slate-200/70 dark:bg-slate-700/70 rounded-xl mr-1 sm:mr-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onToggleMode('visual')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap shrink-0 ${
              mode === 'visual'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">블로그형</span>
            <span className="sm:hidden">편집</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleMode('markdown')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition whitespace-nowrap shrink-0 ${
              mode === 'markdown'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">마크다운</span>
            <span className="sm:hidden">MD</span>
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 hidden sm:block shrink-0" />

        {/* 1. Paragraph Style Dropdown */}
        <div className="relative shrink-0" ref={styleMenuRef}>
          <button
            type="button"
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-sm transition active:scale-95 whitespace-nowrap"
          >
            <Type className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>스타일</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-0.5" />
          </button>

          {showStyleMenu && (
            <div className="absolute top-full left-0 mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-fadeIn">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onFormatHeading('h1');
                  setShowStyleMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
              >
                <Heading1 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>큰제목 (H1)</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onFormatHeading('h2');
                  setShowStyleMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
              >
                <Heading2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>소제목 (H2)</span>
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onFormatHeading('p');
                  setShowStyleMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                <Type className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>일반 본문</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Inline Text Formats (B, I) */}
        <div className="flex items-center gap-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-0.5 shadow-sm shrink-0">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onFormatInline('bold')}
            title="굵게 (드래그 텍스트)"
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition active:scale-95"
          >
            <Bold className="w-3.5 h-3.5 shrink-0" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onFormatInline('italic')}
            title="기울임"
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition active:scale-95"
          >
            <Italic className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>

        {/* 3. Table Dropdown Menu */}
        <div className="relative shrink-0" ref={tableMenuRef}>
          <button
            type="button"
            onClick={() => setShowTableMenu(!showTableMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-sm transition active:scale-95 whitespace-nowrap"
          >
            <Table className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>표</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-0.5" />
          </button>

          {showTableMenu && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-fadeIn">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onOpenTableModal();
                  setShowTableMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
              >
                <Table className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>새 표 삽입...</span>
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onAddTableRow();
                  setShowTableMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                <Rows className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>아래에 줄(+행) 추가</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onAddTableCol();
                  setShowTableMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                <Columns className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>오른쪽에 칸(+열) 추가</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. Checklist, Callout, Image (Direct Essential Actions) */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onInsertChecklist}
          title="할 일 체크리스트 추가"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-sm transition active:scale-95 whitespace-nowrap shrink-0"
        >
          <CheckSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="hidden sm:inline">체크리스트</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onInsertCallout}
          title="강조 박스 삽입"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-700 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-sm transition active:scale-95 whitespace-nowrap shrink-0"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="hidden sm:inline">강조박스</span>
        </button>

        {onInsertInlineSandbox && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onInsertInlineSandbox}
            title="본문 중간에 인라인 인터랙티브 HTML 프로토타입 삽입"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 shadow-xs transition active:scale-95 whitespace-nowrap shrink-0"
          >
            <Code2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="hidden sm:inline">+ 프로토타입</span>
          </button>
        )}

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onTriggerImageUpload}
          title="이미지 파일 첨부 (assets/ 보관)"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-sm transition active:scale-95 whitespace-nowrap shrink-0"
        >
          <Image className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>이미지</span>
        </button>
      </div>

      {/* Right Controls: Auto-save status, Quick Save, Close */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        <span
          className={`text-[11px] font-medium flex items-center gap-1 whitespace-nowrap shrink-0 ${
            isSaved ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500 animate-pulse'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSaved ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          <span className="hidden md:inline whitespace-nowrap">{isSaved ? '자동 저장됨' : '저장 중...'}</span>
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {mode === 'markdown' && (
            <button
              type="button"
              onClick={onTogglePreview}
              className={`flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition whitespace-nowrap shrink-0 ${
                showPreview
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'
              }`}
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">미리보기</span>
            </button>
          )}

          <button
            type="button"
            onClick={onManualSave}
            title="편집창을 닫지 않고 즉시 파일에 씁니다 (중간 저장)"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition active:scale-95 whitespace-nowrap shrink-0"
          >
            <Save className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">즉시 저장</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition whitespace-nowrap shrink-0"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
