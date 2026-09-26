// @cohesive-file
/**
 * @domain 로컬 폴더 관리
 * @feature 로컬 폴더 연결 & 자동 저장
 * @phase 입력
 * @trigger '로컬 폴더 열기' 버튼 클릭 또는 저장 시간 경과
 * @target 폴더 선택기 및 파일 저장기
 * @desc 내 컴퓨터의 작업 폴더를 선택하고 변경 사항을 자동으로 저장하도록 요청
 * @next src/lib/fileSystem/fsAccess.ts
 */
import React, { useState } from 'react';
import {
  Download,
  HelpCircle,
  HardDrive,
  Archive,
  Sparkles,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Scroll,
  WrapText,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { HelpGuideModal } from '../modal/HelpGuideModal';
import { ExportModal } from '../modal/ExportModal';
import type { DocNode } from '../../types/workspace';
import { ThemeToggle } from '../ThemeToggle';

interface Props {
  workspaceName: string;
  isLocal: boolean;
  isVirtual?: boolean;
  saveStatus: 'saved' | 'saving' | 'error';
  onExportZip: () => void;
  onExportPdf: () => void;
  onNavigateHome: () => void;
  onOpenAiImport?: () => void;
  rootNode?: DocNode;
  tableViewMode?: 'wrap' | 'scroll';
  onToggleTableViewMode?: () => void;
}

export const Header: React.FC<Props> = ({
  workspaceName,
  isLocal,
  isVirtual = false,
  saveStatus,
  onExportZip,
  onExportPdf,
  onNavigateHome,
  onOpenAiImport,
  tableViewMode,
  onToggleTableViewMode,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand & Workspace Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div
              onClick={onNavigateHome}
              role="button"
              tabIndex={0}
              title="홈으로 이동"
              className="flex items-center gap-2.5 cursor-pointer shrink-0 group"
            >
              <Logo size={34} />
              <div className="hidden md:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent group-hover:opacity-85 transition-opacity">
                    PlanWiki
                  </span>
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold px-1.5 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/60">
                    v1.0
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">플랜위키 기획 워크스페이스</p>
              </div>
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 hidden sm:block" />

            {/* Workspace Status Badge */}
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                {isLocal ? (
                  <HardDrive className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                ) : isVirtual ? (
                  <Archive className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 break-keep leading-tight">
                  {workspaceName}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0 hidden xs:inline">
                  {isLocal ? '(로컬)' : isVirtual ? '(안심저장소)' : '(데모)'}
                </span>
              </div>

              {/* Save Status */}
              <div className="hidden md:flex items-center gap-1 text-[11px] font-medium">
                {saveStatus === 'saving' ? (
                  <span className="flex items-center gap-1 text-amber-500">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>저장 중...</span>
                  </span>
                ) : saveStatus === 'saved' ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>저장됨</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right Controls: Desktop & Mobile Unified (Export, Help, Theme) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Unified Export Button */}
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              title="기획서 내보내기 (ZIP, PDF) 및 AI 연동 창구 열기"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/20 active:scale-95 transition whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>내보내기</span>
              <ChevronDown className="w-3 h-3 opacity-70 hidden sm:inline shrink-0" />
            </button>

            {/* Help / Guide Button */}
            <button
              type="button"
              onClick={() => setIsHelpModalOpen(true)}
              title="플랜위키 사용법 및 가이드 보기"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Document Table View Mode Toggle Button (Only visible in workspace) */}
            {tableViewMode && onToggleTableViewMode && (
              <button
                type="button"
                onClick={onToggleTableViewMode}
                title={
                  tableViewMode === 'wrap'
                    ? '표 가로 스크롤 모드로 전환'
                    : '표 자동 줄바꿈 모드로 전환'
                }
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition active:scale-95 text-xs font-semibold shrink-0"
              >
                {tableViewMode === 'wrap' ? (
                  <>
                    <Scroll className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="hidden md:inline">가로 스크롤</span>
                  </>
                ) : (
                  <>
                    <WrapText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="hidden md:inline">자동 줄바꿈</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Unified Export & AI Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        workspaceName={workspaceName}
        onExportZip={onExportZip}
        onExportPdf={onExportPdf}
        onOpenAiImport={onOpenAiImport}
      />

      {/* Help & Guide Modal */}
      <HelpGuideModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </>
  );
};
