// @cohesive-file
/**
 * @domain 기획 문서 작업
 * @feature 마크다운 기획 작성 & 표/그림 보기
 * @phase 입력
 * @target 기획서 에디터 상단 서식 툴바
 * @desc 블로그(비주얼) 편집 모드 및 마크다운 원본 모드용 상단 서식 및 도구 제어 툴바
 * @next src/components/doc/MarkdownEditor.tsx
 */
import React from 'react';
import {
  Eye,
  Save,
  FileText,
  Code2,
} from 'lucide-react';

interface Props {
  mode: 'visual' | 'markdown';
  onToggleMode: (mode: 'visual' | 'markdown') => void;
  isSaved: boolean;
  showPreview: boolean;
  onTogglePreview: () => void;
  onManualSave: () => void;
  onClose: () => void;
}

export const EditorToolbar: React.FC<Props> = ({
  mode,
  onToggleMode,
  isSaved,
  showPreview,
  onTogglePreview,
  onManualSave,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80 select-none">
      {/* Left Toolbar Controls: Mode Switcher */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        <div className="flex items-center p-0.5 bg-slate-200/70 dark:bg-slate-700/70 rounded-xl shrink-0">
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
