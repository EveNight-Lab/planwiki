/**
 * @domain 기획 문서 작업
 * @feature 목차 탐색 & 접이식 본문
 * @phase 입력
 * @trigger 사용자가 상단 목차 번호(1., 1.1.) 클릭
 * @target 목차 항목 선택 기능
 * @desc 원하는 목차를 누르면 해당 위치로 스크롤되고 접혀있던 본문이 자동으로 펼쳐짐
 * @next src/components/doc/FocusBreadcrumb.tsx
 */
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ListTree, Sparkles } from 'lucide-react';
import type { DocNode } from '../../types/workspace';

interface Props {
  rootNode: DocNode;
  onSelectSection: (id: string) => void;
}

interface TocItem {
  id: string;
  title: string;
  numbering: string;
  depth: number;
  hasPreview: boolean;
}

export const TableOfContents: React.FC<Props> = ({ rootNode, onSelectSection }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Flatten tree into numbered TOC items
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

  if (tocItems.length === 0) return null;

  return (
    <div className="my-4 sm:my-6 border border-slate-300 dark:border-slate-700/80 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 p-3.5 sm:p-4 w-full max-w-2xl shadow-sm transition-all">
      {/* Wiki TOC Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ListTree className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-800 dark:text-slate-200">
            목차 (Table of Contents)
          </span>
          <span className="text-[11px] sm:text-xs bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
            {tocItems.length}개
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium p-1 rounded-lg active:bg-blue-50 dark:active:bg-blue-950/40"
        >
          {isCollapsed ? (
            <>
              <span>[펼치기]</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>[접기]</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* TOC Items List */}
      {!isCollapsed && (
        <ul className="mt-2.5 space-y-0.5 sm:space-y-1 text-xs sm:text-sm font-sans">
          {tocItems.map((item) => (
            <li
              key={item.id}
              style={{ paddingLeft: `${(item.depth - 1) * 14}px` }}
              className="group flex items-center gap-1.5 sm:gap-2 py-1 sm:py-0.5 min-h-[32px] sm:min-h-[28px]"
            >
              <button
                type="button"
                onClick={() => onSelectSection(item.id)}
                className="text-left text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline flex items-center gap-1.5 transition-colors active:opacity-70 flex-1 min-w-0"
              >
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0">
                  {item.numbering}.
                </span>
                <span className="font-medium truncate">{item.title}</span>
              </button>

              {item.hasPreview && (
                <span
                  title="검증된 HTML 프로토타입 포함"
                  className="shrink-0 inline-flex items-center gap-0.5 text-[10px] bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-medium border border-amber-300/40"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>샌드박스</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
