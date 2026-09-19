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
  FolderOpen,
  Sparkles,
  Clock,
  ArrowRight,
  Trash2,
  HardDrive,
  Search,
  FolderPlus,
  Layers,
  LayoutGrid,
  Columns2,
  List,
  HelpCircle,
} from 'lucide-react';
import { openDirectoryPicker, scanDirectoryNode } from '../lib/fileSystem/fsAccess';
import {
  saveLastDirectoryHandle,
  saveProjectRecord,
  getProjectRecords,
  removeProjectRecord,
  type ProjectRecord,
} from '../lib/fileSystem/idbStorage';
import { ThemeToggle } from '../components/ThemeToggle';
import { CreateProjectModal } from '../components/modal/CreateProjectModal';
import { HelpGuideModal } from '../components/modal/HelpGuideModal';
import { Logo } from '../components/common/Logo';

type ViewMode = 'grid' | 'double' | 'compact';

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

  // 1. Open Local Folder
  const handleOpenFolder = async () => {
    try {
      const handle = await openDirectoryPicker();
      if (!handle) return;

      const scanned = await scanDirectoryNode(handle, '', handle.name);
      await saveLastDirectoryHandle(handle);
      await saveProjectRecord(handle.name, 'local', scanned.meta.title || handle.name);

      navigate('/workspace');
    } catch (err) {
      console.error('폴더 열기 중 오류:', err);
      alert('폴더를 열지 못했습니다. 브라우저 권한을 확인해주세요.');
    }
  };

  // 2. Created New Project Workspace
  const handleProjectCreated = async (
    handle: FileSystemDirectoryHandle,
    projectName: string,
    projectTitle: string
  ) => {
    await saveLastDirectoryHandle(handle);
    await saveProjectRecord(projectName, 'local', projectTitle);
    navigate('/workspace');
  };

  // 2. Open Sample Workspace
  const handleOpenSample = async () => {
    await saveProjectRecord('sample_workspace', 'demo', '넥스트페이 차세대 결제 정산 시스템');
    navigate('/workspace?mode=sample');
  };

  // 3. Remove from History
  const handleDeleteRecord = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('최근 프로젝트 목록에서 삭제하시겠습니까? (실제 컴퓨터의 폴더는 삭제되지 않습니다)')) return;
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
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
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
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area: Compact & Direct Dashboard */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* Top Action & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          {/* Left: Project title & Quick Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
            <div className="flex items-center gap-2 shrink-0">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                내 기획 프로젝트
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                {projects.length}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="프로젝트 또는 폴더명 검색..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Right: View Mode Switcher & Project Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="카드 그리드 뷰 (3열)"
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('double')}
                title="와이드 2열 뷰"
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'double'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Columns2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                title="심플 1줄 리스트 뷰"
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'compact'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={handleOpenSample}
              title="결제 정산 기획서 샘플을 즉시 둘러봅니다"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="hidden sm:inline">샘플 둘러보기</span>
            </button>

            <button
              type="button"
              onClick={handleOpenFolder}
              title="이미 컴퓨터에 존재하는 기획서 폴더를 선택하여 엽니다"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition active:scale-95 whitespace-nowrap"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 shrink-0" />
              <span>기존 폴더 열기</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              title="새 프로젝트 폴더를 생성하고 시작합니다"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition active:scale-95 whitespace-nowrap"
            >
              <FolderPlus className="w-4 h-4 shrink-0" />
              <span>새 프로젝트 만들기</span>
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
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  아직 작업 중인 프로젝트가 없습니다
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  상단의 <strong>'새 폴더 열기 / 만들기'</strong> 버튼을 눌러 내 컴퓨터의 기획 폴더를 선택하거나, <strong>'샘플 둘러보기'</strong>로 시작해보세요!
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleOpenFolder}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>내 컴퓨터 폴더 열기</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenSample}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
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
          ) : viewMode === 'compact' ? (
            /* 1. Compact Simple 1-Line List View (간단히 제목과 날짜만 보는 모드) */
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-sm">
              {filteredProjects.map((proj) => {
                const isLocal = proj.type === 'local';
                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      if (isLocal) navigate('/workspace');
                      else navigate('/workspace?mode=sample');
                    }}
                    className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 group-hover:bg-blue-50 dark:group-hover:bg-blue-950 group-hover:text-blue-600 transition">
                        {isLocal ? <HardDrive className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-indigo-500" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                            {proj.title || proj.name}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400 truncate hidden sm:inline">
                            ({proj.name})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-[11px] text-slate-400 hidden md:inline">
                        {new Date(proj.lastOpened).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteRecord(e, proj.id)}
                        title="기록에서 삭제"
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition -translate-x-1 group-hover:translate-x-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 2. Grid (3열) & Double (2열) Layouts */
            <div
              className={`grid gap-3.5 ${
                viewMode === 'double'
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {filteredProjects.map((proj) => {
                const isLocal = proj.type === 'local';
                return (
                  <div
                    key={proj.id}
                    onClick={() => {
                      if (isLocal) {
                        navigate('/workspace');
                      } else {
                        navigate('/workspace?mode=sample');
                      }
                    }}
                    className="group relative cursor-pointer bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-4 shadow-sm hover:shadow-md hover:shadow-blue-500/5 transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            isLocal
                              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                              : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60'
                          }`}
                        >
                          {isLocal ? (
                            <>
                              <HardDrive className="w-3 h-3" />
                              로컬 폴더
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              체험 샘플
                            </>
                          )}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteRecord(e, proj.id)}
                          title="목록에서 제거 (실제 폴더는 보존)"
                          className="p-1 text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {proj.title || proj.name}
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate font-mono mt-0.5">
                          폴더: {proj.name}
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
