/**
 * @domain 프로젝트 관리
 * @feature 새 프로젝트 생성 모달
 * @phase 입력
 * @target 새 프로젝트 이름 및 생성 경로 설정 모달
 * @desc 사용자가 프로젝트 제목 및 폴더명을 입력하고 상위 저장 위치를 지정하여 하위 프로젝트 폴더를 생성
 * @next src/pages/ProjectHubPage.tsx
 */
import React, { useState } from 'react';
import { X, FolderPlus, Folder, Sparkles } from 'lucide-react';
import { openDirectoryPicker, createNewProjectWorkspace } from '../../lib/fileSystem/fsAccess';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (handle: FileSystemDirectoryHandle, projectName: string, projectTitle: string) => void;
}

export const CreateProjectModal: React.FC<Props> = ({ isOpen, onClose, onProjectCreated }) => {
  const [projectTitle, setProjectTitle] = useState('');
  const [folderName, setFolderName] = useState('');
  const [isCustomFolder, setIsCustomFolder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setProjectTitle(val);
    if (!isCustomFolder) {
      // Auto suggest safe directory name from title
      const sanitized = val
        .trim()
        .replace(/[\\/:*?"<>|]/g, '')
        .replace(/\s+/g, '-');
      setFolderName(sanitized);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || !folderName.trim()) {
      alert('프로젝트 제목과 폴더 이름을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Pick parent destination folder
      alert(`[${folderName}] 프로젝트 폴더를 생성할 상위 저장 위치(예: 다운로드, 문서, 내 프로젝트 등)를 선택해주세요.`);
      const parentHandle = await openDirectoryPicker();
      if (!parentHandle) {
        setIsSubmitting(false);
        return;
      }

      // 2. Create subfolder inside chosen parent
      const projectHandle = await createNewProjectWorkspace(
        parentHandle,
        folderName.trim(),
        projectTitle.trim()
      );

      if (!projectHandle) {
        alert('프로젝트 폴더를 생성하지 못했습니다. 폴더 이름이나 권한을 확인해주세요.');
        setIsSubmitting(false);
        return;
      }

      onProjectCreated(projectHandle, folderName.trim(), projectTitle.trim());
      onClose();
    } catch (err) {
      console.error('Error creating project:', err);
      alert('프로젝트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn select-none">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                새 기획 프로젝트 만들기
              </h3>
              <p className="text-[11px] text-slate-400">
                원하는 저장 위치 아래에 새 프로젝트 폴더를 생성합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              기획서 프로젝트 제목 <span className="text-blue-600">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={projectTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="예: 보드네스트 (BoardNest), 넥스트페이 정산 시스템"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                생성될 실제 폴더명 <span className="text-blue-600">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomFolder(!isCustomFolder)}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
              >
                {isCustomFolder ? '제목과 자동 동기화' : '폴더명 직접 수정'}
              </button>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 font-mono text-xs text-slate-600 dark:text-slate-300">
              <Folder className="w-4 h-4 text-amber-500 shrink-0" />
              <input
                type="text"
                required
                readOnly={!isCustomFolder}
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="예: boardnest, smart-pay"
                className="w-full bg-transparent focus:outline-none text-slate-800 dark:text-slate-200"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              선택하신 저장 위치 폴더 바로 아래에 <strong>/{folderName || '프로젝트폴더'}</strong> 로 자동 생성됩니다.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 transition active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? '폴더 생성 중...' : '저장 위치 선택 및 생성'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
