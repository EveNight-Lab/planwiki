/**
 * @domain 기획 문서 작업
 * @feature 목차 탐색 & 접이식 본문
 * @phase 출력
 * @target 플로팅 목차 팝업 (퀵 점프 모달)
 * @desc 스크롤 도중 플로팅 [목차] 버튼 클릭 시 화면 이동 없이 팝업으로 전체 목차 트리를 띄워 즉시 이동
 * @next src/pages/WorkspaceView.tsx
 */
import React, { useEffect, useRef } from 'react';
import { X, ListTree } from 'lucide-react';
import type { DocNode } from '../../types/workspace';

interface Props {
  isOpen: boolean;
  rootNode: DocNode;
  onClose: () => void;
  onSelectSection: (id: string) => void;
}

interface TocItem {
  id: string;
  title: string;
  numbering: string;
  depth: number;
  hasPreview: boolean;
}

export const FloatingTocDrawer: React.FC<Props> = ({
  isOpen,
  rootNode,
  onClose,
  onSelectSection,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Flatten tree
  const tocItems: TocItem[] = [];
  function traverse(node: DocNode, prefix: string, depth: number) {
    node.children.forEach((child, index) => {
      const num = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
      tocItems.push({
        id: child.id,
        title: child.meta.title || child.name,
        numbering: num,
        depth,
        hasPreview: !!child.previewHtml,
      });
      if (child.children && child.children.length > 0) {
        traverse(child, num, depth + 1);
      }
    });
  }

  traverse(rootNode, '', 1);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-fadeIn select-none">
      <div
        ref={popupRef}
        className="w-full sm:max-w-md max-h-[80vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slideUp"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80">
          <div className="flex items-center gap-2">
            <ListTree className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
              목차 퀵 점프
            </span>
            <span className="text-[11px] bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">
              {tocItems.length}개 항목
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body List */}
        <div className="overflow-y-auto p-3 sm:p-4 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60">
          {tocItems.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">목차 항목이 없습니다.</p>
          ) : (
            tocItems.map((item) => (
              <div
                key={item.id}
                style={{ paddingLeft: `${(item.depth - 1) * 16}px` }}
                className="pt-1 first:pt-0"
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectSection(item.id);
                    onClose();
                  }}
                  className="w-full text-left py-2 px-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-between gap-2 transition group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                      {item.numbering}.
                    </span>
                    <span className="text-xs sm:text-sm font-medium break-keep leading-snug group-hover:underline">
                      {item.title}
                    </span>
                  </div>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400">
            항목을 클릭하면 해당 위치로 스크롤 점프하고 섹션이 자동 전개됩니다.
          </span>
        </div>
      </div>
    </div>
  );
};
