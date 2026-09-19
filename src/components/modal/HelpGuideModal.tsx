/**
 * @domain 시스템 안내 & 가이드
 * @feature 사용법 도움말 팝업 모달
 * @phase 출력
 * @target 사용자 도움말 및 워크스페이스 조작법 안내
 * @desc 로컬 폴더 동기화, WBS 계층 트리 작성, 인라인 프로토타입 샌드박스, AI 번들러 내보내기 조작법을 시각적 카드로 안내
 */
import React, { useState, useEffect } from 'react';
import {
  X,
  HelpCircle,
  HardDrive,
  FolderTree,
  PlaySquare,
  Sparkles,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { Logo } from '../common/Logo';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'local' | 'wbs' | 'mockup' | 'ai'>('all');

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const guideSections = [
    {
      id: 'local',
      icon: HardDrive,
      iconColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      tag: 'Local-First',
      title: '1. 내 컴퓨터 폴더 1:1 직접 동기화',
      desc: '브라우저 보안 파일 시스템 API(File System Access API)를 사용하여 내 컴퓨터의 지정된 폴더를 직접 엽니다.',
      bullets: [
        '서버나 외부 클라우드 전송 없이 모든 데이터가 내 로컬 디스크에 안전하게 보관됩니다.',
        '내용 변경 시 자동으로 로컬 파일(`content.md`, `node.json`, `preview.html`)에 실시간 저장됩니다.',
        '폴더 연결 권한만 허용하면 오프라인 상태에서도 완벽하게 작동합니다.',
      ],
    },
    {
      id: 'wbs',
      icon: FolderTree,
      iconColor: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
      tag: 'WBS Architecture',
      title: '2. WBS 번호 자동 부여 & 단락 계층 조작',
      desc: '위키 백과사전 형태의 1.0, 1.1, 1.2 아코디언 단락 구조를 자동으로 계산하여 매핑합니다.',
      bullets: [
        '단락 헤더 우측의 `[ ⇅ 위치/순서 ]` 버튼으로 위/아래 이동 및 상위/하위 계층(승격/들여쓰기)을 자유롭게 재구성합니다.',
        '단락을 접고 펼쳐 방대한 분량의 기획서도 한눈에 체계적으로 조망할 수 있습니다.',
        '좌측 TOC(목차) 사이드바에서 원하는 단락을 클릭하면 즉시 해당 위치로 부드럽게 스크롤됩니다.',
      ],
    },
    {
      id: 'mockup',
      icon: PlaySquare,
      iconColor: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
      tag: 'Live Sandbox',
      title: '3. 인라인 인터랙티브 프로토타입 샌드박스',
      desc: '기획서 텍스트 설명에 그치지 않고, 브라우저에서 동작하는 실시간 UI 인터랙션 목업을 직접 구현합니다.',
      bullets: [
        '단락 편집기에서 [인라인 목업 탭]을 열어 HTML/CSS/JS 코드를 작성하면 우측 프리뷰에 즉시 반영됩니다.',
        '완전 격리된 iframe 샌드박스 환경에서 동작하여 안전하며 실제 사용자의 조작 플로우를 사전에 검증할 수 있습니다.',
        '모바일/태블릿/데스크톱 화면 크기 전환 시뮬레이터를 기본 제공합니다.',
      ],
    },
    {
      id: 'ai',
      icon: Sparkles,
      iconColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      tag: 'AI Handoff',
      title: '4. AI 코딩 에이전트(Antigravity 등) 연동 번들링',
      desc: '작성된 기획서와 프로토타입 코드를 AI 에이전트가 즉각 개발에 투입될 수 있도록 단일 패키지로 내보냅니다.',
      bullets: [
        '우측 상단의 [내보내기] 버튼을 누르면 기획 명세서와 인라인 목업이 포함된 `.zip` 패키지가 즉시 생성됩니다.',
        'AI 코딩 에이전트가 단번에 기획 의도와 기술 스택, 시맨틱 구조를 파악할 수 있는 최적화된 마크다운 구조가 포함됩니다.',
      ],
    },
  ];

  const filteredSections =
    activeTab === 'all'
      ? guideSections
      : guideSections.filter((item) => item.id === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden z-10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  PlanWiki 빠른 사용 가이드
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                  매뉴얼
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                로컬 우선 기획서 작성부터 AI 에이전트 연동까지의 핵심 가이드
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="닫기 (ESC)"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            전체 보기
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeTab === 'local'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            📁 로컬 폴더 연동
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wbs')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeTab === 'wbs'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            📑 WBS 단락 계층
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mockup')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeTab === 'mockup'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            ⚡ 인터랙티브 목업
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeTab === 'ai'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            🤖 AI 에이전트 번들러
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {filteredSections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${sec.iconColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {sec.title}
                      </h3>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {sec.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2.5 leading-relaxed">
                      {sec.desc}
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      {sec.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Tip Box */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong className="text-blue-700 dark:text-blue-300 font-semibold block mb-0.5">
                💡 빠른 팁:
              </strong>
              로컬 폴더가 준비되지 않았을 때는 허브의{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                [샘플 워크스페이스 열기]
              </span>
              를 눌러 모든 기능을 가상 환경에서 즉시 체험해 보실 수 있습니다.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>상단 네비게이션의 물음표(?) 아이콘으로 언제든 다시 열람할 수 있습니다.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};
