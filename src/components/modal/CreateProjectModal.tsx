// @cohesive-file
/**
 * @domain 프로젝트 관리
 * @feature 새 프로젝트 생성 모달
 * @phase 입력
 * @target 새 프로젝트 이름 및 생성 경로 설정 모달
 * @desc 사용자가 프로젝트 제목 및 폴더명을 입력하고 상위 저장 위치를 사전에 지정/캐시하여 하위 프로젝트 폴더를 생성
 * @store IndexedDB (handles: last_parent_directory_handle, last_parent_directory_name)
 * @next src/pages/ProjectHubPage.tsx
 */
import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Folder, Sparkles, FolderCheck, AlertCircle, RefreshCw, Database, Archive } from 'lucide-react';
import {
  openDirectoryPicker,
  createNewProjectWorkspaceDetailed,
  verifyPermission,
  supportsDirectoryPicker,
} from '../../lib/fileSystem/fsAccess';
import {
  getLastParentDirectory,
  saveLastParentDirectory,
  createVirtualProject,
} from '../../lib/fileSystem/idbStorage';

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
  const [projectTitle, setProjectTitle] = useState('');
  const [folderName, setFolderName] = useState('');
  const [isCustomFolder, setIsCustomFolder] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Browser support check
  const isFsSupported = supportsDirectoryPicker();
  const [storageMode, setStorageMode] = useState<'local' | 'virtual'>(isFsSupported ? 'local' : 'virtual');

  // Parent directory cache & state
  const [parentHandle, setParentHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [parentFolderName, setParentFolderName] = useState<string>('');
  const [isCachedLocation, setIsCachedLocation] = useState(false);
  const [isLoadingCache, setIsLoadingCache] = useState(false);

  // Error feedback state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mobileGuide, setMobileGuide] = useState<string | null>(null);

  // Restore cached parent directory on modal open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadCache = async () => {
      setIsLoadingCache(true);
      setErrorMessage(null);
      setMobileGuide(null);
      try {
        const cached = await getLastParentDirectory();
        if (isMounted && cached && cached.handle) {
          setParentHandle(cached.handle);
          setParentFolderName(cached.name);
          setIsCachedLocation(true);
        }
      } catch (err) {
        console.warn('Failed to load cached parent directory', err);
      } finally {
        if (isMounted) setIsLoadingCache(false);
      }
    };

    loadCache();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

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

  // Pick or change parent directory
  const handleSelectParentFolder = async () => {
    setErrorMessage(null);
    setMobileGuide(null);
    try {
      const handle = await openDirectoryPicker();
      if (!handle) return;

      // Immediately verify/request readwrite permission
      const hasPerm = await verifyPermission(handle, true);
      if (!hasPerm) {
        setErrorMessage('선택하신 폴더에 대한 쓰기 권한이 승인되지 않았습니다.');
        setMobileGuide('브라우저 권한 팝업에서 "허용"을 선택해주세요.');
        return;
      }

      const name = handle.name || '선택된 폴더';
      setParentHandle(handle);
      setParentFolderName(name);
      setIsCachedLocation(false);

      // Save to cache immediately
      await saveLastParentDirectory(handle, name);
    } catch (err) {
      console.error('Error selecting parent directory:', err);
      setErrorMessage('저장 위치 선택 중 오류가 발생했습니다.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setMobileGuide(null);

    if (!projectTitle.trim() || !folderName.trim()) {
      setErrorMessage('프로젝트 제목과 폴더 이름을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. If virtual storage mode (Samsung Internet, mobile, or user selected)
      if (storageMode === 'virtual' || !isFsSupported) {
        const virtualProj = await createVirtualProject(folderName.trim(), projectTitle.trim());
        onProjectCreated(null, folderName.trim(), projectTitle.trim(), virtualProj.id);
        onClose();
        return;
      }

      // 2. Local physical folder mode
      let activeParentHandle = parentHandle;

      // If no parent directory selected yet, open picker first
      if (!activeParentHandle) {
        activeParentHandle = await openDirectoryPicker();
        if (!activeParentHandle) {
          setIsSubmitting(false);
          return;
        }
        const name = activeParentHandle.name || '선택된 폴더';
        setParentHandle(activeParentHandle);
        setParentFolderName(name);
        await saveLastParentDirectory(activeParentHandle, name);
      }

      // Create project workspace subfolder inside parent
      const result = await createNewProjectWorkspaceDetailed(
        activeParentHandle,
        folderName.trim(),
        projectTitle.trim()
      );

      if (!result.success || !result.projectHandle) {
        setErrorMessage(result.errorMessage || '프로젝트 폴더 생성에 실패했습니다.');
        setMobileGuide(result.mobileGuide || null);
        setIsSubmitting(false);
        return;
      }

      // Save parent folder to cache for future usage
      await saveLastParentDirectory(activeParentHandle, parentFolderName || activeParentHandle.name);

      onProjectCreated(result.projectHandle, folderName.trim(), projectTitle.trim());
      onClose();
    } catch (err) {
      console.error('Error creating project:', err);
      setErrorMessage('프로젝트 생성 중 예상치 못한 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn select-none">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp">
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
                저장 위치 아래에 기획서 전용 프로젝트 폴더를 생성합니다.
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
          {/* 1. Project Title */}
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

          {/* 2. Storage Location (Placed directly below title as requested) */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300">저장 방식 및 위치</span>
                {storageMode === 'virtual' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    <span>안심 가상 저장소 (모바일/ZIP)</span>
                  </span>
                ) : isCachedLocation ? (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-medium">
                    최근 저장 위치
                  </span>
                ) : null}
              </div>

              {/* Mode switch if desktop browser supports FS */}
              {isFsSupported && (
                <div className="flex items-center gap-1 p-0.5 bg-slate-200 dark:bg-slate-700/60 rounded-lg text-[10px]">
                  <button
                    type="button"
                    onClick={() => setStorageMode('local')}
                    className={`px-2 py-0.5 rounded-md font-medium transition ${
                      storageMode === 'local'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    로컬 폴더
                  </button>
                  <button
                    type="button"
                    onClick={() => setStorageMode('virtual')}
                    className={`px-2 py-0.5 rounded-md font-medium transition ${
                      storageMode === 'virtual'
                        ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    안심 저장소
                  </button>
                </div>
              )}
            </div>

            {/* Content by mode */}
            {storageMode === 'virtual' || !isFsSupported ? (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Archive className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      브라우저 안심 저장소 (IndexedDB)
                    </p>
                    <p className="text-[10px] text-slate-400">
                      삼성 인터넷, Safari 및 모바일 100% 지원 &bull; 대용량 보관
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                  💡 <strong>작업 후 로컬 보관</strong>: 실시간 자동 저장되며, 메인 화면이나 워크스페이스 상단의 <strong>[ZIP 다운로드]</strong> 버튼으로 언제든 내 파일(스마트폰/PC)에 압축 파일로 보관 및 불러올 수 있습니다.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">내 컴퓨터 상위 저장 폴더</span>
                  <button
                    type="button"
                    onClick={handleSelectParentFolder}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{parentHandle ? '위치 변경' : '폴더 선택'}</span>
                  </button>
                </div>

                {isLoadingCache ? (
                  <div className="text-[11px] text-slate-400 py-1">이전 저장 위치 확인 중...</div>
                ) : parentHandle ? (
                  <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {parentFolderName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">기본 저장소</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSelectParentFolder}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                  >
                    <Folder className="w-4 h-4" />
                    <span>저장할 상위 폴더를 선택해주세요</span>
                  </button>
                )}

                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {parentHandle
                    ? `지정된 '${parentFolderName}' 폴더 아래에 새 프로젝트 폴더가 생성됩니다.`
                    : '한 번 지정한 위치는 브라우저에 자동 캐시되어 다음 생성 시 유지됩니다.'}
                </p>
              </>
            )}
          </div>

          {/* 3. Folder Name */}
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
              최종 생성 경로:{' '}
              <strong className="text-slate-600 dark:text-slate-300 font-mono">
                {parentFolderName ? `${parentFolderName}/` : ''}{folderName || '프로젝트폴더'}
              </strong>
            </p>
          </div>

          {/* 4. Error & Mobile Guidance Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 space-y-1">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div className="font-semibold text-xs">{errorMessage}</div>
              </div>
              {mobileGuide && (
                <div className="text-[11px] text-rose-600 dark:text-rose-300/90 pl-6 leading-relaxed bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl mt-1.5 border border-rose-200/60 dark:border-rose-800/40">
                  <span className="font-bold">📱 모바일 안내: </span>
                  {mobileGuide}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
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
              <span>{isSubmitting ? '프로젝트 생성 중...' : '프로젝트 생성'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Preview props for Inspector Board (5174)
// @ts-expect-error Inspector Board Preview Props
CreateProjectModal._previewProps = {
  isOpen: true,
  onClose: () => console.log('Close clicked'),
  onProjectCreated: (
    _handle: FileSystemDirectoryHandle | null,
    name: string,
    title: string,
    _virtualId?: string
  ) => console.log('Project created:', name, title),
};
