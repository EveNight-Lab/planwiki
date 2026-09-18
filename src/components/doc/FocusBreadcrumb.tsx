/**
 * @domain 기획 문서 작업
 * @feature 목차 탐색 & 접이식 본문
 * @phase 판단
 * @target 단독 집중 보기 여부 확인 및 상위 경로 추적
 * @desc 특정 항목만 집중해서 보고 있는지 확인하고 상위 폴더 경로를 안내
 * @next src/components/doc/AccordionSection.tsx
 */
import React from 'react';
import { Home, ChevronRight, ArrowLeft } from 'lucide-react';
import type { DocNode } from '../../types/workspace';

interface Props {
  rootNode: DocNode;
  focusedNodeId: string;
  onClearFocus: () => void;
  onSelectNode: (id: string) => void;
}

export const FocusBreadcrumb: React.FC<Props> = ({
  rootNode,
  focusedNodeId,
  onClearFocus,
  onSelectNode,
}) => {
  // Find path from root to focused node
  const pathNodes: DocNode[] = [];

  function findPath(current: DocNode, targetId: string): boolean {
    pathNodes.push(current);
    if (current.id === targetId) return true;
    for (const child of current.children) {
      if (findPath(child, targetId)) return true;
    }
    pathNodes.pop();
    return false;
  }

  findPath(rootNode, focusedNodeId);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl px-4 py-3 mb-6">
      <div className="flex items-center gap-2 flex-wrap text-sm">
        <button
          type="button"
          onClick={onClearFocus}
          className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
        >
          <Home className="w-4 h-4" />
          <span>전체 기획서</span>
        </button>

        {pathNodes.map((node, index) => {
          const isLast = index === pathNodes.length - 1;
          if (index === 0) return null; // Root already displayed as '전체 기획서'

          return (
            <React.Fragment key={node.id}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              {isLast ? (
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {node.meta.title || node.name}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectNode(node.id)}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {node.meta.title || node.name}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onClearFocus}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition shadow-sm"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>전체 뷰로 복귀</span>
      </button>
    </div>
  );
};
