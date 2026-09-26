// @cohesive-file
/**
 * @domain 로컬 폴더 관리
 * @feature 로컬 폴더 연결 & 자동 저장
 * @phase 출력
 * @trigger 사용자의 프로젝트 허브 방문 및 프로젝트 카드 선택
 * @target 프로젝트 선택 및 편집 화면 전환
 * @desc 최근 작업한 프로젝트 목록을 한 화면에 보여주고 검색 및 빠른 열기를 제공하는 대시보드
 * @next src/pages/WorkspaceView.tsx
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Sparkles,
  Clock,
  ArrowRight,
  Trash2,
  Search,
  FolderPlus,
  FolderOpen,
  HardDrive,
  Archive,
  Layers,
  LayoutGrid,
  List,
  HelpCircle,
} from 'lucide-react';
import {
  saveLastDirectoryHandle,
  saveProjectRecord,
  getProjectRecords,
  removeProjectRecord,
  getVirtualWorkspace,
  type ProjectRecord,
} from '../lib/fileSystem/idbStorage';
import { exportWorkspaceAsZip } from '../lib/exportZip';
import { ThemeToggle } from '../components/ThemeToggle';
import { CreateProjectModal } from '../components/modal/CreateProjectModal';
import { HelpGuideModal } from '../components/modal/HelpGuideModal';
import { Logo } from '../components/common/Logo';

type ViewMode = 'grid' | 'list';

export const ProjectHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getProjectRecords()
      .then((records) => {
        if (isMounted) {
          setProjects(records);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('프로젝트 기록 불러오기 오류:', err);
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Created New Project Workspace (Local or Virtual)
  const handleProjectCreated = async (
    handle: FileSystemDirectoryHandle | null,
    projectName: string,
    projectTitle: string,
    virtualId?: string
  ) => {
    if (handle) {
      await saveLastDirectoryHandle(handle);
      await saveProjectRecord(projectName, 'local', projectTitle);
      navigate('/workspace');
    } else if (virtualId) {
      navigate(`/workspace?virtualId=${encodeURIComponent(virtualId)}`);
    }
  };

  // 2. Open Project by Record
  const handleOpenProject = (proj: ProjectRecord) => {
    if (proj.type === 'demo') {
      navigate('/workspace?mode=sample');
    } else if (proj.type === 'virtual') {
      navigate(`/workspace?virtualId=virtual_${encodeURIComponent(proj.name)}`);
    } else {
      navigate('/workspace');
    }
  };

  // 3. Toggle View Mode (grid <-> list)
  const handleToggleViewMode = () => {
    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
  };

  // 6. Direct ZIP Download for Virtual Projects from Card
  const handleDownloadProjectZip = async (e: React.MouseEvent, proj: ProjectRecord) => {
    e.stopPropagation();
    try {
      if (proj.type === 'virtual') {
        const rootNode = await getVirtualWorkspace(`virtual_${proj.name}`);
        if (rootNode) {
          await exportWorkspaceAsZip(rootNode);
          return;
        }
      }
      alert('해당 프로젝트는 로컬 폴더 직접 마운트 상태입니다. 워크스페이스에 진입한 후 상단 ZIP 내보내기를 이용해주세요.');
    } catch (err) {
      console.error('ZIP 내보내기 실패:', err);
      alert('ZIP 파일 생성 중 오류가 발생했습니다.');
    }
  };

  // 7. Remove from History
  const handleDeleteRecord = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const isVirtual = id.startsWith('virtual_');
    const message = isVirtual
      ? '이 프로젝트를 브라우저 저장소에서 완전히 삭제하시겠습니까?\n(삭제 전 ZIP 다운로드로 백업하실 수 있습니다)'
      : '최근 프로젝트 목록에서 삭제하시겠습니까? (실제 컴퓨터의 폴더는 삭제되지 않습니다)';
    if (!confirm(message)) return;
    await removeProjectRecord(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Filtered projects by search
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.name && p.name.toLowerCase().includes(query))
    );
  }, [projects, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 dark:from-indigo-400 dark:via-indigo-300 dark:to-violet-400 bg-clip-text text-transparent">
                PlanWiki
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
                | 플랜위키 프로젝트 허브
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsHelpModalOpen(true)}
              title="플랜위키 사용법 및 가이드 보기"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area: Compact & Direct Dashboard */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* Top Dashboard Action Block (3-Row Clean Hierarchy) */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
          {/* Row 1: Title (Left) & Single View Mode Toggle (Far Right) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                내 기획 프로젝트
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                {projects.length}
              </span>
            </div>

            {/* 2-Way View Mode Toggle Button (Grid <-> List) */}
            <button
              type="button"
              onClick={handleToggleViewMode}
              title={viewMode === 'grid' ? '심플 리스트 형태로 전환' : '카드 그리드 형태로 전환'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition active:scale-95 text-xs font-semibold"
            >
              {viewMode === 'grid' ? (
                <>
                  <List className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="hidden sm:inline">목록으로 보기</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="hidden sm:inline">카드로 보기</span>
                </>
              )}
            </button>
          </div>

          {/* Row 2: Full-width Comfortable Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="프로젝트 제목 또는 폴더명 검색..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          {/* Row 3: Indigo Folder+ Button (Right-aligned, Compact & Clear) */}
          <div className="flex items-center justify-end pt-0.5">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              title="새 기획 프로젝트 생성 또는 ZIP 불러오기"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition active:scale-95 whitespace-nowrap"
            >
              <FolderPlus className="w-4 h-4 shrink-0" />
              <span>새 프로젝트</span>
            </button>
          </div>
        </div>

        {/* Project List / Grid (Directly visible without huge banners) */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              프로젝트 기록을 불러오는 중...
            </div>
          ) : projects.length === 0 ? (
            /* Empty State */
            <div className="py-16 px-4 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  아직 작업 중인 프로젝트가 없습니다
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  <strong>'새 프로젝트'</strong> 버튼을 눌러 기획서를 새로 작성하거나, <strong>'체험용 샘플 열기'</strong>로 먼저 둘러보세요!
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition active:scale-95"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>새 프로젝트 만들기</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/workspace?mode=sample')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>체험용 샘플 열기</span>
                </button>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              '{searchQuery}' 검색어와 일치하는 프로젝트가 없습니다.
            </div>
          ) : viewMode === 'list' ? (
            /* 1. Simple 1-Line List View (간단히 제목과 날짜만 보는 모드) */
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-sm">
              {filteredProjects.map((proj) => {
                const isLocal = proj.type === 'local';
                const isVirtual = proj.type === 'virtual';
                return (
                  <div
                    key={proj.id}
                    onClick={() => handleOpenProject(proj)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 group-hover:text-indigo-600 transition">
                        {isLocal ? (
                          <HardDrive className="w-4 h-4" />
                        ) : isVirtual ? (
                          <Archive className="w-4 h-4 text-violet-500" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-indigo-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                            {proj.title || proj.name}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400 truncate hidden sm:inline">
                            ({proj.name})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[11px] text-slate-400 hidden md:inline">
                        {new Date(proj.lastOpened).toLocaleDateString()}
                      </span>
                      {isVirtual && (
                        <button
                          type="button"
                          onClick={(e) => handleDownloadProjectZip(e, proj)}
                          title="ZIP 압축 파일 다운로드"
                          className="p-1.5 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/30 transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100 active:scale-90"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteRecord(e, proj.id)}
                        title="기록에서 삭제"
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100 active:scale-90"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition -translate-x-1 group-hover:translate-x-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 2. Responsive Card Grid (모바일 1열, 태블릿 2열, 데스크톱 3열 자동 최적화) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredProjects.map((proj) => {
                const isLocal = proj.type === 'local';
                const isVirtual = proj.type === 'virtual';
                return (
                  <div
                    key={proj.id}
                    onClick={() => handleOpenProject(proj)}
                    className="group relative cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-4 shadow-sm hover:shadow-md hover:shadow-indigo-500/10 transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            isLocal
                              ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60'
                              : isVirtual
                                ? 'bg-violet-50 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {isLocal ? (
                            <>
                              <HardDrive className="w-3 h-3" />
                              로컬 폴더
                            </>
                          ) : isVirtual ? (
                            <>
                              <Archive className="w-3 h-3" />
                              안심 저장소 (ZIP)
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              체험 샘플
                            </>
                          )}
                        </span>

                        <div className="flex items-center gap-1">
                          {isVirtual && (
                            <button
                              type="button"
                              onClick={(e) => handleDownloadProjectZip(e, proj)}
                              title="ZIP 압축 파일 다운로드"
                              className="p-1.5 text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/30 transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100 active:scale-90"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteRecord(e, proj.id)}
                            title="목록에서 제거"
                            className="p-1.5 text-slate-400 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100 active:scale-90"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors break-keep">
                          {proj.title || proj.name}
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate font-mono mt-0.5">
                          {isVirtual ? '가상 스토리지' : `폴더: ${proj.name}`}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(proj.lastOpened).toLocaleDateString()}
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        열기 <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* New Project Creation Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Help & Guide Modal */}
      <HelpGuideModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};
