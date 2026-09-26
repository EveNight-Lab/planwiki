// @cohesive-file
/**
 * @domain 프로젝트 관리
 * @feature 새 프로젝트 생성 및 ZIP 불러오기 모달
 * @phase 입력
 * @target 프로젝트 생성 및 ZIP 복원 통합 모달
 * @desc 브라우저 안심 가상 저장소(IndexedDB) 기반 신규 프로젝트 생성 및 기획서 ZIP 파일 복원을 단일 모달에서 제공
 * @store IndexedDB (virtual_workspaces, projects)
 * @next src/pages/ProjectHubPage.tsx
 */
import React, { useState, useRef } from 'react';
import { X, FolderPlus, Sparkles, Archive, UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { createVirtualProject } from '../../lib/fileSystem/idbStorage';
import { importWorkspaceFromZip } from '../../lib/importZip';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (
    handle: FileSystemDirectoryHandle | null,
    projectName: string,
    projectTitle: string,
    virtualId?: string
  ) => void;
}

export const CreateProjectModal: React.FC<Props> = ({ isOpen, onClose, onProjectCreated }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'zip'>('new');
  const [projectTitle, setProjectTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ZIP import state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Create New Virtual Project
  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedTitle = projectTitle.trim();
    if (!trimmedTitle) {
      setErrorMessage('프로젝트 제목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const sanitizedName = trimmedTitle
        .replace(/[\\/:*?"<>|]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      const virtualProj = await createVirtualProject(sanitizedName || '새_기획서', trimmedTitle);
      
      onProjectCreated(null, sanitizedName, trimmedTitle, virtualProj.id);
      onClose();
    } catch (err) {
      console.error('프로젝트 생성 실패:', err);
      setErrorMessage('프로젝트 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Process ZIP File
  const handleProcessZip = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setErrorMessage('ZIP 압축 파일만 업로드할 수 있습니다.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await importWorkspaceFromZip(file);
      const title = res.rootNode.meta.title || res.rootNode.name;
      onProjectCreated(null, res.rootNode.name, title, res.projectId);
      onClose();
    } catch (err) {
      console.error('ZIP 불러오기 실패:', err);
      setErrorMessage('ZIP 파일을 해석하지 못했습니다. 올바른 기획서 백업 파일인지 확인해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessZip(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessZip(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                기획 프로젝트 시작하기
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                브라우저 안심 저장소에 새 기획서를 만들거나 ZIP 파일을 복원합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-4 sm:p-6 pb-0">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setActiveTab('new');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'new'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>새로 만들기</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('zip');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'zip'
                  ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>ZIP 파일 불러오기</span>
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-2.5 text-xs text-red-700 dark:text-red-300 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <p className="leading-snug">{errorMessage}</p>
          </div>
        )}

        {/* Tab 1: Create New */}
        {activeTab === 'new' && (
          <form onSubmit={handleCreateNew} className="p-4 sm:p-6 space-y-4">
            <div>
              <label htmlFor="project-title" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                기획서 제목
              </label>
              <input
                id="project-title"
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="예: 넥스트페이 결제 정산 시스템 기획서"
                autoFocus
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>

            {/* Storage Info Card */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-bold text-indigo-700 dark:text-indigo-300">브라우저 안심 가상 저장소 (IndexedDB)</span>에 즉시 안전하게 보관됩니다. 스마트폰/PC 어디서나 권한 오류 없이 즉시 작성 가능하며, 언제든 상단에서 ZIP 파일로 백업할 수 있습니다.
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !projectTitle.trim()}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>생성 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>프로젝트 생성</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Import ZIP */}
        {activeTab === 'zip' && (
          <div className="p-4 sm:p-6 space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept=".zip"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-7 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-950/50'
              }`}
            >
              {isSubmitting ? (
                <div className="py-4 flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    ZIP 파일에서 기획서 구조를 복원하는 중...
                  </p>
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    클릭하여 기획서 ZIP 파일 선택
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    또는 이곳으로 ZIP 파일을 드래그하여 놓으세요.
                  </p>
                </>
              )}
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
              💡 PlanWiki에서 다운로드한 <strong>.zip 백업 파일</strong>을 선택하면, 폴더 트리 구조와 마크다운 본문이 브라우저 저장소로 즉시 복원됩니다.
            </div>

            <div className="pt-1 flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Preview props for component inspector
// @ts-expect-error Inspector preview metadata
CreateProjectModal._previewProps = {
  isOpen: true,
  onClose: () => {},
  onProjectCreated: () => {},
};
