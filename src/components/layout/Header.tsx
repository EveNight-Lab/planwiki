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
  FolderOpen,
  FolderPlus,
  Download,
  Layers,
  Sparkles,
  CheckCircle2,
  Loader2,
  HardDrive,
  Home,
  FileText,
  MoreVertical,
  X,
} from 'lucide-react';
import type { DocNode } from '../../types/workspace';
import { ThemeToggle } from '../ThemeToggle';

interface Props {
  workspaceName: string;
  isLocal: boolean;
  saveStatus: 'saved' | 'saving' | 'error';
  allExpanded: boolean;
  onToggleExpandAll: () => void;
  onOpenDirectory: () => void;
  onAddTopSection: () => void;
  onExportZip: () => void;
  onExportPdf: () => void;
  onNavigateHome: () => void;
  rootNode?: DocNode;
}

export const Header: React.FC<Props> = ({
  workspaceName,
  isLocal,
  saveStatus,
  allExpanded,
  onToggleExpandAll,
  onOpenDirectory,
  onAddTopSection,
  onExportZip,
  onExportPdf,
  onNavigateHome,
}) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
              className="flex items-center gap-2 cursor-pointer shrink-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/20 tracking-tighter">
                PW
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    PlanWiki
                  </span>
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold px-1.5 py-0.2 rounded-md">
                    v1.0
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">플랜위키 기획 워크스페이스</p>
              </div>
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 hidden sm:block" />

            {/* Workspace Status Badge */}
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 max-w-[130px] sm:max-w-[200px] md:max-w-[240px]">
                {isLocal ? (
                  <HardDrive className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                  {workspaceName}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0 hidden xs:inline">
                  {isLocal ? '(로컬)' : '(데모)'}
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

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-1.5 md:gap-2 shrink-0">
            {/* Home Button */}
            <button
              type="button"
              onClick={onNavigateHome}
              title="프로젝트 선택 허브로 이동"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
            >
              <Home className="w-3.5 h-3.5 text-blue-500" />
              <span>홈</span>
            </button>

            {/* Toggle Expand/Collapse All */}
            <button
              type="button"
              onClick={onToggleExpandAll}
              title={allExpanded ? '모든 아코디언 접기' : '모든 아코디언 펼치기'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{allExpanded ? '모두 접기' : '모두 펼치기'}</span>
            </button>

            {/* Add Top Section */}
            <button
              type="button"
              onClick={onAddTopSection}
              title="새 최상위 기획 항목 추가 (1. 개요, 2. 기능 명세 등 대단원 추가)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition active:scale-95 shadow-sm whitespace-nowrap"
            >
              <FolderPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>+ 최상위 항목 추가</span>
            </button>

            {/* Mount Local Folder */}
            <button
              type="button"
              onClick={onOpenDirectory}
              title="로컬 파일 시스템 폴더 열기 (Chrome/Edge File System Access)"
              className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
            >
              <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden lg:inline">로컬 폴더 열기</span>
            </button>

            {/* Export PDF */}
            <button
              type="button"
              onClick={onExportPdf}
              title="전체 기획서를 깔끔한 A4 인쇄/PDF 양식으로 내보내기"
              className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
            >
              <FileText className="w-3.5 h-3.5 text-rose-500" />
              <span>PDF 기획서</span>
            </button>

            {/* Export for AI / Antigravity */}
            <button
              type="button"
              onClick={onExportZip}
              title="기획서, 이미지, HTML 프로토타입 일체를 Antigravity용 ZIP 파일로 패키징"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:opacity-95 text-white shadow-md shadow-blue-500/25 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>AI 패키지</span>
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle />
          </div>

          {/* Mobile Right Controls: Home + Theme + More (···) */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onNavigateHome}
              title="홈으로 이동"
              className="p-2 text-slate-700 dark:text-slate-200 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <Home className="w-4 h-4 text-blue-500" />
            </button>

            <ThemeToggle />

            <button
              type="button"
              onClick={() => setShowMobileMenu(true)}
              title="더보기 메뉴 열기"
              className="p-2 text-slate-700 dark:text-slate-200 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 transition"
            >
              <MoreVertical className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Actions Bottom Sheet / Drawer Modal */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex flex-col justify-end sm:hidden animate-fadeIn"
          onClick={() => setShowMobileMenu(false)}
        >
          <div
            className="w-full bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  작업 도구 및 내보내기
                </h3>
                <p className="text-xs text-slate-400">
                  {workspaceName} {isLocal ? '(로컬 폴더)' : '(데모 샘플)'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="space-y-2 pt-1">
              {/* Add Section */}
              <button
                type="button"
                onClick={() => {
                  setShowMobileMenu(false);
                  onAddTopSection();
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-sm border border-emerald-200 dark:border-emerald-800/60 active:scale-[0.98] transition"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold">새 최상위 기획 항목 추가</p>
                  <p className="text-xs opacity-75 font-normal">새로운 큰 기획 챕터와 세부 항목을 만듭니다</p>
                </div>
              </button>

              {/* Export PDF */}
              <button
                type="button"
                onClick={() => {
                  setShowMobileMenu(false);
                  onExportPdf();
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-sm border border-rose-200 dark:border-rose-800/60 active:scale-[0.98] transition"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold">PDF 기획서 출력 (A4 인쇄용)</p>
                  <p className="text-xs opacity-75 font-normal">모든 항목을 펼쳐 깔끔한 문서로 인쇄/저장</p>
                </div>
              </button>

              {/* Export ZIP */}
              <button
                type="button"
                onClick={() => {
                  setShowMobileMenu(false);
                  onExportZip();
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-sm border border-blue-200 dark:border-blue-800/60 active:scale-[0.98] transition"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold">AI 패키지(ZIP) 다운로드</p>
                  <p className="text-xs opacity-75 font-normal">Antigravity AI 전달용 마크다운/HTML/이미지 압축</p>
                </div>
              </button>

              {/* Open Directory */}
              <button
                type="button"
                onClick={() => {
                  setShowMobileMenu(false);
                  onOpenDirectory();
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-slate-700 active:scale-[0.98] transition"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-600 text-white flex items-center justify-center">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold">로컬 폴더 열기 / 연결</p>
                  <p className="text-xs text-slate-400 font-normal">내 스마트폰/컴퓨터의 작업 폴더 열기</p>
                </div>
              </button>

              {/* Toggle Expand All */}
              <button
                type="button"
                onClick={() => {
                  setShowMobileMenu(false);
                  onToggleExpandAll();
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-slate-700 active:scale-[0.98] transition"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-600 text-white flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold">{allExpanded ? '모든 아코디언 접기' : '모든 아코디언 펼치기'}</p>
                  <p className="text-xs text-slate-400 font-normal">문서 내 모든 섹션을 한 번에 열거나 닫습니다</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
