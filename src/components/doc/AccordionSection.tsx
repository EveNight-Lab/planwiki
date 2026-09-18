// @cohesive-file
/**
 * @domain 기획 문서 작업
 * @feature 목차 탐색 & 접이식 본문
 * @phase 출력
 * @target 접이식 기획 섹션 상자
 * @desc 번호가 매겨진 제목, 접고 펼치는 상자, 기획서 본문과 테스트 화면을 화면에 표시
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Edit3,
  Focus,
  Plus,
  Trash2,
  Code,
  Tag,
  Sparkles,
  Check,
  ArrowUp,
  ArrowDown,
  CornerLeftUp,
  CornerRightDown,
  ArrowUpDown,
} from 'lucide-react';
import type { DocNode } from '../../types/workspace';
import { MarkdownViewer } from './MarkdownViewer';
import { MarkdownEditor } from './MarkdownEditor';
import { LiveSandbox } from '../sandbox/LiveSandbox';

interface Props {
  node: DocNode;
  numbering: string;
  depth: number;
  openSections: Set<string>;
  onToggleSection: (id: string) => void;
  onUpdateContent: (nodeId: string, content: string) => void;
  onUpdatePreviewHtml: (nodeId: string, html: string) => void;
  onUploadAsset: (nodeId: string, file: File) => Promise<string | null>;
  onAddChildNode: (parentId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onFocusNode: (nodeId: string) => void;
  onMoveOrder?: (nodeId: string, direction: 'up' | 'down') => void;
  onShiftHierarchy?: (nodeId: string, action: 'promote' | 'demote') => void;
}

export const AccordionSection: React.FC<Props> = ({
  node,
  numbering,
  depth,
  openSections,
  onToggleSection,
  onUpdateContent,
  onUpdatePreviewHtml,
  onUploadAsset,
  onAddChildNode,
  onDeleteNode,
  onFocusNode,
  onMoveOrder,
  onShiftHierarchy,
}) => {
  const isOpen = openSections.has(node.id);
  const [isEditing, setIsEditing] = useState(false);
  const [showStructureMenu, setShowStructureMenu] = useState(false);
  const structureMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (structureMenuRef.current && !structureMenuRef.current.contains(e.target as Node)) {
        setShowStructureMenu(false);
      }
    };
    if (showStructureMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStructureMenu]);

  // Depth styling
  const headerFontSize = depth === 1 ? 'text-xl font-bold' : depth === 2 ? 'text-lg font-semibold' : 'text-base font-semibold';
  const borderColor = depth === 1 ? 'border-slate-300 dark:border-slate-700' : 'border-slate-200 dark:border-slate-800';

  const handleCreatePrototype = () => {
    const defaultProto = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${node.meta.title || node.name} 프로토타입</title>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #f8fafc; text-align: center; }
    .box { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); max-width: 400px; margin: 0 auto; }
    button { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
    button:hover { background: #2563eb; }
  </style>
</head>
<body>
  <div class="box">
    <h3>${node.meta.title || node.name}</h3>
    <p style="color: #64748b; margin: 12px 0;">인터랙션/로직을 검증할 코드를 작성하세요.</p>
    <button onclick="alert('동작 확인!')">테스트 실행</button>
  </div>
</body>
</html>`;
    onUpdatePreviewHtml(node.id, defaultProto);
    if (!isOpen) onToggleSection(node.id);
  };

  return (
    <section
      id={`section-${node.id}`}
      className={`my-4 border rounded-2xl overflow-hidden transition-all bg-white dark:bg-slate-900/90 shadow-sm ${borderColor}`}
    >
      {/* Accordion Header */}
      <div
        className={`flex items-center justify-between gap-2 px-3.5 sm:px-5 py-3 transition-colors cursor-pointer select-none ${
          isOpen
            ? 'bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800'
            : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30'
        }`}
        onClick={() => onToggleSection(node.id)}
      >
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 min-w-0">
          <button
            type="button"
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition shrink-0"
            aria-label={isOpen ? '섹션 접기' : '섹션 펼치기'}
          >
            {isOpen ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" /> : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-base shrink-0">
            {numbering}.
          </span>

          <h3 className={`${headerFontSize} text-slate-800 dark:text-slate-100 truncate`}>
            {node.meta.title || node.name}
          </h3>

          {/* Tags */}
          {node.meta.tags && node.meta.tags.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              {node.meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700"
                >
                  <Tag className="w-2.5 h-2.5 opacity-60" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Prototype Badge */}
          {node.previewHtml && (
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium border border-amber-300/40 shrink-0">
              <Sparkles className="w-3 h-3" />
              <span>프로토타입</span>
            </span>
          )}
        </div>

        {/* Header Action Buttons (Stop propagation so they don't toggle accordion) */}
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {isEditing ? (
            <div className="flex items-center gap-2">
              {/* Structure Control Dropdown Menu (순서 및 계층 변경 드롭다운) */}
              <div className="relative shrink-0" ref={structureMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowStructureMenu(!showStructureMenu)}
                  title="목차 순서 및 계층 위치 변경"
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-xs transition active:scale-95 whitespace-nowrap"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>위치/순서</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-0.5" />
                </button>

                {showStructureMenu && (
                  <div className="absolute top-full right-0 mt-1 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-fadeIn">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      순서 이동
                    </div>
                    {onMoveOrder && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            onMoveOrder(node.id, 'up');
                            setShowStructureMenu(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
                        >
                          <ArrowUp className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>위로 이동</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onMoveOrder(node.id, 'down');
                            setShowStructureMenu(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>아래로 이동</span>
                        </button>
                      </>
                    )}

                    <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      계층 변경
                    </div>
                    {onShiftHierarchy && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            onShiftHierarchy(node.id, 'promote');
                            setShowStructureMenu(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center gap-2"
                        >
                          <CornerLeftUp className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>상위 항목으로 승격</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onShiftHierarchy(node.id, 'demote');
                            setShowStructureMenu(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center gap-2"
                        >
                          <CornerRightDown className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>앞 항목의 하위로 편입</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                편집 중
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>완료</span>
              </button>
            </div>
          ) : (
            <>
              {/* Focus Mode Button */}
              <button
                type="button"
                onClick={() => onFocusNode(node.id)}
                title="이 섹션을 단독 페이지 뷰로 포커스"
                className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                <Focus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="hidden md:inline">포커스</span>
              </button>

              {/* Edit Markdown Toggle (NamuWiki style [편집]) */}
              <button
                type="button"
                onClick={() => {
                  if (!isOpen) onToggleSection(node.id);
                  setIsEditing(true);
                }}
                title="이 문단 편집하기"
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-800/60 transition shadow-xs"
              >
                <Edit3 className="w-3 h-3" />
                <span>편집</span>
              </button>

              {/* Add Prototype if not exists */}
              {!node.previewHtml && (
                <button
                  type="button"
                  onClick={handleCreatePrototype}
                  title="검증용 단일 HTML 프로토타입 추가"
                  className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 transition"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">+ 프로토타입</span>
                </button>
              )}

              {/* Add Child Node */}
              <button
                type="button"
                onClick={() => onAddChildNode(node.id)}
                title="하위 세부 항목(폴더) 추가"
                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Delete Node */}
              <button
                type="button"
                onClick={() => {
                  if (confirm(`'${node.meta.title || node.name}' 항목과 모든 하위 내용을 삭제하시겠습니까?`)) {
                    onDeleteNode(node.id);
                  }
                }}
                title="섹션 삭제"
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Accordion Content Body */}
      {isOpen && (
        <div className="p-3.5 sm:p-7 space-y-6">
          {/* Markdown Content (Viewer or Editor) */}
          {isEditing ? (
            <MarkdownEditor
              initialContent={node.content}
              assets={node.assets}
              onSave={(content) => onUpdateContent(node.id, content)}
              onUploadAsset={(file) => onUploadAsset(node.id, file)}
              onClose={() => setIsEditing(false)}
            />
          ) : (
            <div className="bg-slate-50/40 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
              <MarkdownViewer
                content={node.content}
                assets={node.assets}
                onUpdateContent={(newContent) => onUpdateContent(node.id, newContent)}
              />
            </div>
          )}

          {/* Live Sandbox (If previewHtml exists) */}
          {node.previewHtml !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  실행 프로토타입 (HTML Sandbox)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('프로토타입 코드를 제거하시겠습니까?')) {
                      onUpdatePreviewHtml(node.id, '');
                    }
                  }}
                  className="text-[11px] text-slate-400 hover:text-red-500 transition"
                >
                  제거
                </button>
              </div>
              <LiveSandbox
                title={`${node.meta.title || node.name} 시뮬레이터`}
                initialCode={node.previewHtml}
                onSaveCode={(code) => onUpdatePreviewHtml(node.id, code)}
              />
            </div>
          )}

          {/* Child Nodes (Recursive) */}
          {node.children && node.children.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                하위 세부 항목 ({node.children.length})
              </div>
              <div className="space-y-4 pl-0 sm:pl-3 border-l-2 border-slate-200 dark:border-slate-800">
                {node.children.map((child, idx) => (
                  <AccordionSection
                    key={child.id}
                    node={child}
                    numbering={`${numbering}.${idx + 1}`}
                    depth={depth + 1}
                    openSections={openSections}
                    onToggleSection={onToggleSection}
                    onUpdateContent={onUpdateContent}
                    onUpdatePreviewHtml={onUpdatePreviewHtml}
                    onUploadAsset={onUploadAsset}
                    onAddChildNode={onAddChildNode}
                    onDeleteNode={onDeleteNode}
                    onFocusNode={onFocusNode}
                    onMoveOrder={onMoveOrder}
                    onShiftHierarchy={onShiftHierarchy}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
