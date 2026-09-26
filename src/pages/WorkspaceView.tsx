// @cohesive-file
/**
 * @domain 로컬 폴더 관리
 * @feature 로컬 폴더 연결 & 자동 저장
 * @phase 출력
 * @target 메인 기획서 작업 화면
 * @desc 폴더 안의 기획서 파일들을 화면에 한눈에 펼쳐 보여주는 전체 작업 공간
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import type { DocNode, WorkspaceState } from '../types/workspace';
import { SAMPLE_WORKSPACE } from '../lib/sampleWorkspace';
import {
  openDirectoryPicker,
  scanDirectoryNode,
  writeTextFile,
  writeAssetFile,
  createChildNode,
  deleteChildNode,
  verifyPermission,
} from '../lib/fileSystem/fsAccess';
import {
  saveLastDirectoryHandle,
  getLastDirectoryHandle,
  saveProjectRecord,
  getVirtualWorkspace,
  saveVirtualWorkspace,
} from '../lib/fileSystem/idbStorage';
import { exportWorkspaceAsZip } from '../lib/exportZip';
import { exportWorkspaceToPdf } from '../lib/exportPdf';
import { Header } from '../components/layout/Header';
import { TableOfContents } from '../components/toc/TableOfContents';
import { FloatingTocDrawer } from '../components/toc/FloatingTocDrawer';
import { AccordionSection } from '../components/doc/AccordionSection';
import { FocusBreadcrumb } from '../components/doc/FocusBreadcrumb';
import { NewSectionModal } from '../components/modal/NewSectionModal';
import { AiImportModal } from '../components/modal/AiImportModal';
import { MarkdownViewer } from '../components/doc/MarkdownViewer';
import { MarkdownEditor } from '../components/doc/MarkdownEditor';
import { Sparkles, Edit3, Plus, ArrowUp, ListTree, AlertCircle } from 'lucide-react';

// Pure helper: Find node in tree
function findNode(node: DocNode, id: string): DocNode | null {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

// Pure helper: Find parent node in tree
function findParentNode(current: DocNode, targetId: string): DocNode | null {
  for (const child of current.children) {
    if (child.id === targetId) return current;
    const found = findParentNode(child, targetId);
    if (found) return found;
  }
  return null;
}

// Pure helper: Mutate node in tree immutable
function updateNodeInTree(root: DocNode, targetId: string, updater: (n: DocNode) => DocNode): DocNode {
  if (root.id === targetId) {
    return updater(root);
  }
  return {
    ...root,
    children: root.children.map((child) => updateNodeInTree(child, targetId, updater)),
  };
}

export const WorkspaceView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSampleMode = searchParams.get('mode') === 'sample';
  const virtualId = searchParams.get('virtualId');

  const [state, setState] = useState<WorkspaceState>({
    name: SAMPLE_WORKSPACE.meta.title || SAMPLE_WORKSPACE.name,
    rootNode: SAMPLE_WORKSPACE,
    isLocal: false,
    saveStatus: 'saved',
    focusedNodeId: null,
  });

  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['01_PG사-연동-규격', '01_PG사-연동-규격/01_토스페이먼츠', '02_정산-계산-로직'])
  );

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    parentId: string | null;
    parentTitle: string;
    defaultOrder: number;
  }>({
    isOpen: false,
    parentId: null,
    parentTitle: '',
    defaultOrder: 1,
  });

  const [isEditingRoot, setIsEditingRoot] = useState(false);
  const [isAiImportOpen, setIsAiImportOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFloatingToc, setShowFloatingToc] = useState(false);

  // Scroll listener for floating scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [pendingPermissionHandle, setPendingPermissionHandle] = useState<FileSystemDirectoryHandle | null>(null);

  // Auto-sync virtual workspace to IndexedDB
  useEffect(() => {
    if (!virtualId || isSampleMode) return;
    const timer = setTimeout(() => {
      saveVirtualWorkspace(virtualId, state.rootNode);
    }, 300);
    return () => clearTimeout(timer);
  }, [virtualId, state.rootNode, isSampleMode]);

  // Restore directory handle on mount if not explicitly sample mode
  useEffect(() => {
    if (isSampleMode) return;

    // 1. If virtual workspace mode
    if (virtualId) {
      const activeVirtualId = virtualId;
      async function loadVirtual() {
        const root = await getVirtualWorkspace(activeVirtualId);
        if (root) {
          setState({
            name: root.meta.title || root.name,
            rootNode: root,
            isLocal: false,
            saveStatus: 'saved',
            focusedNodeId: null,
          });
          const initialOpen = new Set<string>();
          root.children.forEach((c) => {
            initialOpen.add(c.id);
            c.children.forEach((cc) => initialOpen.add(cc.id));
          });
          setOpenSections(initialOpen);
          await saveProjectRecord(root.name, 'virtual', root.meta.title || root.name);
        }
      }
      loadVirtual();
      return;
    }

    // 2. Physical directory handle mode
    async function restoreHandle() {
      const handle = await getLastDirectoryHandle();
      if (handle) {
        const hasPerm = await verifyPermission(handle, true);
        if (hasPerm) {
          try {
            const scanned = await scanDirectoryNode(handle, '', handle.name);
            setState({
              name: scanned.meta.title || scanned.name,
              rootNode: scanned,
              isLocal: true,
              dirHandle: handle,
              saveStatus: 'saved',
              focusedNodeId: null,
            });
            await saveProjectRecord(handle.name, 'local', scanned.meta.title || scanned.name);
          } catch (err) {
            console.warn('Could not restore last workspace directory', err);
          }
        } else {
          // Permission needed from user gesture
          setPendingPermissionHandle(handle);
        }
      }
    }
    restoreHandle();
  }, [isSampleMode, virtualId]);

  // Activate permission with user gesture
  const handleActivatePermission = async () => {
    if (!pendingPermissionHandle) return;
    const hasPerm = await verifyPermission(pendingPermissionHandle, true);
    if (hasPerm) {
      try {
        const scanned = await scanDirectoryNode(pendingPermissionHandle, '', pendingPermissionHandle.name);
        setState({
          name: scanned.meta.title || scanned.name,
          rootNode: scanned,
          isLocal: true,
          dirHandle: pendingPermissionHandle,
          saveStatus: 'saved',
          focusedNodeId: null,
        });
        await saveProjectRecord(pendingPermissionHandle.name, 'local', scanned.meta.title || scanned.name);
        setPendingPermissionHandle(null);
      } catch (err) {
        console.error('Failed to load directory after permission grant:', err);
        alert('폴더를 불러오는 중 오류가 발생했습니다.');
      }
    } else {
      alert('폴더 접근 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
    }
  };

  // Open directory picker
  const handleOpenDirectory = async () => {
    const handle = await openDirectoryPicker();
    if (!handle) return;

    setState((s) => ({ ...s, saveStatus: 'saving' }));
    try {
      const scanned = await scanDirectoryNode(handle, '', handle.name);
      await saveLastDirectoryHandle(handle);
      await saveProjectRecord(handle.name, 'local', scanned.meta.title || scanned.name);

      setState({
        name: scanned.meta.title || scanned.name,
        rootNode: scanned,
        isLocal: true,
        dirHandle: handle,
        saveStatus: 'saved',
        focusedNodeId: null,
      });

      // Automatically open all first level sections
      const initialOpen = new Set<string>();
      scanned.children.forEach((c) => {
        initialOpen.add(c.id);
        c.children.forEach((cc) => initialOpen.add(cc.id));
      });
      setOpenSections(initialOpen);
    } catch (err) {
      console.error('Failed to scan selected directory:', err);
      setState((s) => ({ ...s, saveStatus: 'error' }));
    }
  };

  // Toggle single section
  const handleToggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle expand/collapse all
  const allExpanded = useMemo(() => {
    function getAllIds(node: DocNode): string[] {
      let ids: string[] = [];
      for (const c of node.children) {
        ids.push(c.id);
        ids = ids.concat(getAllIds(c));
      }
      return ids;
    }
    const allIds = getAllIds(state.rootNode);
    return allIds.length > 0 && allIds.every((id) => openSections.has(id));
  }, [state.rootNode, openSections]);

  const handleToggleExpandAll = () => {
    function getAllIds(node: DocNode): string[] {
      let ids: string[] = [];
      for (const c of node.children) {
        ids.push(c.id);
        ids = ids.concat(getAllIds(c));
      }
      return ids;
    }
    const allIds = getAllIds(state.rootNode);
    if (allExpanded) {
      setOpenSections(new Set());
    } else {
      setOpenSections(new Set(allIds));
    }
  };

  // Select section from TOC
  const handleSelectSection = (id: string) => {
    // Ensure all ancestors are open
    function getAncestors(current: DocNode, targetId: string, path: string[] = []): string[] | null {
      if (current.id === targetId) return path;
      for (const c of current.children) {
        const res = getAncestors(c, targetId, [...path, current.id]);
        if (res) return res;
      }
      return null;
    }

    const ancestors = getAncestors(state.rootNode, id);
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (ancestors) {
        ancestors.forEach((aId) => next.add(aId));
      }
      next.add(id);
      return next;
    });

    setTimeout(() => {
      const el = document.getElementById(`section-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Update content.md
  const handleUpdateContent = async (nodeId: string, content: string) => {
    setState((s) => ({
      ...s,
      rootNode: updateNodeInTree(s.rootNode, nodeId, (n) => ({ ...n, content })),
      saveStatus: 'saving',
    }));

    if (state.isLocal) {
      const target = findNode(state.rootNode, nodeId);
      if (target && target.dirHandle) {
        await writeTextFile(target.dirHandle, 'content.md', content);
      }
    }

    setTimeout(() => {
      setState((s) => ({ ...s, saveStatus: 'saved' }));
    }, 500);
  };

  // Update preview.html
  const handleUpdatePreviewHtml = async (nodeId: string, html: string) => {
    setState((s) => ({
      ...s,
      rootNode: updateNodeInTree(s.rootNode, nodeId, (n) => ({
        ...n,
        previewHtml: html || undefined,
      })),
      saveStatus: 'saving',
    }));

    if (state.isLocal) {
      const target = findNode(state.rootNode, nodeId);
      if (target && target.dirHandle) {
        if (html) {
          await writeTextFile(target.dirHandle, 'preview.html', html);
        } else {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (target.dirHandle as any).removeEntry('preview.html');
          } catch {
            // Ignore
          }
        }
      }
    }

    setTimeout(() => {
      setState((s) => ({ ...s, saveStatus: 'saved' }));
    }, 500);
  };

  // Upload asset image
  const handleUploadAsset = async (nodeId: string, file: File): Promise<string | null> => {
    const target = findNode(state.rootNode, nodeId);
    if (!target) return null;

    let blobUrl = URL.createObjectURL(file);

    if (state.isLocal && target.dirHandle) {
      const writtenUrl = await writeAssetFile(target.dirHandle, file.name, file);
      if (writtenUrl) blobUrl = writtenUrl;
    }

    setState((s) => ({
      ...s,
      rootNode: updateNodeInTree(s.rootNode, nodeId, (n) => ({
        ...n,
        assets: { ...n.assets, [file.name]: blobUrl },
      })),
    }));

    return blobUrl;
  };

  // Open modal to add child node
  const handleOpenAddModal = (parentId: string | null) => {
    const parent = parentId ? findNode(state.rootNode, parentId) : state.rootNode;
    setModalState({
      isOpen: true,
      parentId,
      parentTitle: parent ? parent.meta.title || parent.name : '최상위',
      defaultOrder: parent ? parent.children.length + 1 : state.rootNode.children.length + 1,
    });
  };

  // Submit new section
  const handleCreateSection = async (data: {
    dirName: string;
    title: string;
    order: number;
    tags: string[];
    withPrototype: boolean;
  }) => {
    const parentId = modalState.parentId;
    const parent = parentId ? findNode(state.rootNode, parentId) : state.rootNode;
    if (!parent) return;

    const newPath = parent.path ? `${parent.path}/${data.dirName}` : data.dirName;
    const defaultPreview = data.withPrototype
      ? `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${data.title} 프로토타입</title>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #f8fafc; }
    .box { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  </style>
</head>
<body>
  <div class="box">
    <h3>${data.title} 프로토타입</h3>
    <p>AI가 생성한 단일 HTML 코드를 여기에 붙여넣어 즉시 테스트하세요.</p>
  </div>
</body>
</html>`
      : undefined;

    let childHandle: FileSystemDirectoryHandle | undefined;

    if (state.isLocal && parent.dirHandle) {
      const created = await createChildNode(
        parent.dirHandle,
        data.dirName,
        data.title,
        data.order
      );
      if (created) {
        childHandle = created;
        if (defaultPreview) {
          await writeTextFile(created, 'preview.html', defaultPreview);
        }
      }
    }

    const newNode: DocNode = {
      id: newPath,
      name: data.dirName,
      path: newPath,
      meta: {
        title: data.title,
        order: data.order,
        tags: data.tags,
      },
      content: `# ${data.title}\n\n세부 기획 및 요구사항을 작성하세요.`,
      previewHtml: defaultPreview,
      assets: {},
      children: [],
      dirHandle: childHandle,
    };

    setState((s) => ({
      ...s,
      rootNode: updateNodeInTree(s.rootNode, parent.id, (p) => ({
        ...p,
        children: [...p.children, newNode].sort((a, b) => a.meta.order - b.meta.order),
      })),
    }));

    setOpenSections((prev) => new Set(prev).add(newNode.id));
    setModalState((m) => ({ ...m, isOpen: false }));
  };

  // Import AI Generated Plan Nodes
  const handleImportAiPlan = async (importedNodes: DocNode[]) => {
    if (!importedNodes || importedNodes.length === 0) return;

    // 로컬 파일 시스템에 디렉토리 및 파일 자동 저장
    if (state.isLocal && state.rootNode.dirHandle) {
      async function saveImportedTree(parentHandle: FileSystemDirectoryHandle, node: DocNode) {
        try {
          const childHandle = await createChildNode(
            parentHandle,
            node.name,
            node.meta.title,
            node.meta.order
          );
          if (childHandle) {
            node.dirHandle = childHandle;
            await writeTextFile(childHandle, 'content.md', node.content);
            if (node.previewHtml) {
              await writeTextFile(childHandle, 'preview.html', node.previewHtml);
            }
            for (const sub of node.children) {
              await saveImportedTree(childHandle, sub);
            }
          }
        } catch (err) {
          console.error(`Failed to save imported node to disk: ${node.name}`, err);
        }
      }

      for (const node of importedNodes) {
        await saveImportedTree(state.rootNode.dirHandle, node);
      }
    }

    // 상태 업데이트: 기존 최상위 목록에 추가
    const newChildren = [...state.rootNode.children, ...importedNodes].sort(
      (a, b) => a.meta.order - b.meta.order
    );

    setState((s) => ({
      ...s,
      rootNode: {
        ...s.rootNode,
        children: newChildren,
      },
      saveStatus: 'saved',
    }));

    // 새로 가져온 노드들을 아코디언에서 펼쳐 보여줌
    setOpenSections((prev) => {
      const next = new Set(prev);
      importedNodes.forEach((n) => next.add(n.id));
      return next;
    });
  };

  // Delete section
  const handleDeleteNode = async (nodeId: string) => {
    const parent = findParentNode(state.rootNode, nodeId);
    const target = findNode(state.rootNode, nodeId);
    if (!parent || !target) return;

    if (state.isLocal && parent.dirHandle) {
      await deleteChildNode(parent.dirHandle, target.name);
    }

    setState((s) => ({
      ...s,
      rootNode: updateNodeInTree(s.rootNode, parent.id, (p) => ({
        ...p,
        children: p.children.filter((c) => c.id !== nodeId),
      })),
    }));

    setOpenSections((prev) => {
      const next = new Set(prev);
      next.delete(nodeId);
      return next;
    });
  };

  // Move node order (up/down) within same parent
  const handleMoveNodeOrder = (nodeId: string, direction: 'up' | 'down') => {
    const parent = findParentNode(state.rootNode, nodeId);
    if (!parent) return;

    const children = [...parent.children];
    const currentIndex = children.findIndex((c) => c.id === nodeId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= children.length) return;

    // Swap items
    const temp = children[currentIndex];
    children[currentIndex] = children[targetIndex];
    children[targetIndex] = temp;

    // Update orders
    children.forEach((c, idx) => {
      c.meta.order = idx + 1;
    });

    setState((s) => ({
      ...s,
      rootNode: updateNodeInTree(s.rootNode, parent.id, (p) => ({
        ...p,
        children,
      })),
    }));
  };

  // Promote (outdent / 상위로 승격) or Demote (indent / 하위로 편입)
  const handleShiftNodeHierarchy = (nodeId: string, action: 'promote' | 'demote') => {
    const parent = findParentNode(state.rootNode, nodeId);
    const target = findNode(state.rootNode, nodeId);
    if (!parent || !target) return;

    if (action === 'promote') {
      // Cannot promote top-level sections
      if (parent.id === state.rootNode.id) {
        alert('이미 최상위 항목이므로 더 이상 상위로 승격할 수 없습니다.');
        return;
      }
      const grandParent = findParentNode(state.rootNode, parent.id);
      if (!grandParent) return;

      // Remove from current parent
      const newParentChildren = parent.children.filter((c) => c.id !== nodeId);
      // Insert into grandparent after current parent
      const grandChildren = [...grandParent.children];
      const parentIndex = grandChildren.findIndex((c) => c.id === parent.id);
      grandChildren.splice(parentIndex + 1, 0, target);

      // Re-assign orders
      grandChildren.forEach((c, idx) => {
        c.meta.order = idx + 1;
      });

      setState((s) => {
        let updated = updateNodeInTree(s.rootNode, parent.id, (p) => ({ ...p, children: newParentChildren }));
        updated = updateNodeInTree(updated, grandParent.id, (gp) => ({ ...gp, children: grandChildren }));
        return { ...s, rootNode: updated };
      });
    } else {
      // Demote: Make target a child of its previous sibling
      const parentChildren = [...parent.children];
      const currentIndex = parentChildren.findIndex((c) => c.id === nodeId);
      if (currentIndex <= 0) {
        alert('이전 항목이 없어서 하위로 편입할 수 없습니다.');
        return;
      }
      const previousSibling = parentChildren[currentIndex - 1];

      // Remove from parent
      parentChildren.splice(currentIndex, 1);
      // Add to previous sibling
      const newSiblingChildren = [...previousSibling.children, target];
      newSiblingChildren.forEach((c, idx) => {
        c.meta.order = idx + 1;
      });

      setState((s) => {
        let updated = updateNodeInTree(s.rootNode, parent.id, (p) => ({ ...p, children: parentChildren }));
        updated = updateNodeInTree(updated, previousSibling.id, (ps) => ({ ...ps, children: newSiblingChildren }));
        return { ...s, rootNode: updated };
      });

      // Auto expand sibling
      setOpenSections((prev) => new Set(prev).add(previousSibling.id));
    }
  };

  // Export for Antigravity
  const handleExportZip = async () => {
    try {
      await exportWorkspaceAsZip(state.rootNode);
    } catch (err) {
      alert('ZIP 내보내기 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  // Current display node (either focused node or entire root)
  const displayNode = state.focusedNodeId
    ? findNode(state.rootNode, state.focusedNodeId) || state.rootNode
    : state.rootNode;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors pb-32">
      {/* Top Header */}
      <Header
        workspaceName={state.name}
        isLocal={state.isLocal}
        isVirtual={Boolean(virtualId)}
        saveStatus={state.saveStatus}
        allExpanded={allExpanded}
        onToggleExpandAll={handleToggleExpandAll}
        onOpenDirectory={handleOpenDirectory}
        onAddTopSection={() => handleOpenAddModal(null)}
        onExportZip={handleExportZip}
        onExportPdf={() => exportWorkspaceToPdf(handleToggleExpandAll)}
        onNavigateHome={() => navigate('/')}
        onOpenAiImport={() => setIsAiImportOpen(true)}
        rootNode={state.rootNode}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8">
        {/* Permission Request Banner for Saved Handle */}
        {pendingPermissionHandle && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-200">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-bold">로컬 작업 폴더 접근 권한 승인 필요</p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                  이전에 작업하던 <strong>&apos;{pendingPermissionHandle.name}&apos;</strong> 폴더를 계속 편집하려면 브라우저 권한을 승인해주세요.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setPendingPermissionHandle(null)}
                className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleActivatePermission}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs transition active:scale-95 shrink-0"
              >
                권한 허용 및 열기
              </button>
            </div>
          </div>
        )}

        {/* Focus Mode Breadcrumb */}
        {state.focusedNodeId && (
          <FocusBreadcrumb
            rootNode={state.rootNode}
            focusedNodeId={state.focusedNodeId}
            onClearFocus={() => setState((s) => ({ ...s, focusedNodeId: null }))}
            onSelectNode={(id) => setState((s) => ({ ...s, focusedNodeId: id }))}
          />
        )}

        {/* Root Node Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xs mb-6 transition-all">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="whitespace-nowrap shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 break-keep">
                  {state.isLocal ? '로컬 마운트' : virtualId ? '안심 가상 저장소 (모바일/ZIP)' : '시뮬레이션 데모'}
                </span>
                {displayNode.meta.tags?.map((t) => (
                  <span
                    key={t}
                    className="whitespace-nowrap shrink-0 inline-flex items-center text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full font-medium break-keep"
                  >
                    #{t}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-2 break-keep">
                {displayNode.meta.title || displayNode.name}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingRoot(!isEditingRoot)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                isEditingRoot
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingRoot ? '편집 완료' : '개요 편집'}</span>
            </button>
          </div>

          {/* Root Content */}
          <div className="pt-6">
            {isEditingRoot ? (
              <MarkdownEditor
                initialContent={displayNode.content}
                assets={displayNode.assets}
                onSave={(c) => handleUpdateContent(displayNode.id, c)}
                onUploadAsset={(f) => handleUploadAsset(displayNode.id, f)}
                onClose={() => setIsEditingRoot(false)}
              />
            ) : (
              <MarkdownViewer
                content={displayNode.content}
                assets={displayNode.assets}
                onUpdateContent={(c) => handleUpdateContent(displayNode.id, c)}
              />
            )}
          </div>
        </div>

        {/* NamuWiki Style Table of Contents (TOC) */}
        <div id="table-of-contents" className="scroll-mt-20">
          <TableOfContents
            rootNode={displayNode}
            onSelectSection={handleSelectSection}
          />
        </div>

        {/* Accordion Sections List */}
        <div className="mt-8 space-y-5">
          {displayNode.children.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
              <Sparkles className="w-10 h-10 text-blue-500 mx-auto mb-3 opacity-60" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">
                아직 하위 기획 항목이 없습니다
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                새 항목 추가 버튼을 눌러 폴더 기반의 기획 섹션과 인터랙티브 프로토타입을 추가해보세요.
              </p>
              <button
                type="button"
                onClick={() => handleOpenAddModal(displayNode.id)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>새 섹션 추가</span>
              </button>
            </div>
          ) : (
            <>
              {displayNode.children.map((child, idx) => (
                <AccordionSection
                  key={child.id}
                  node={child}
                  numbering={`${idx + 1}`}
                  depth={1}
                  openSections={openSections}
                  onToggleSection={handleToggleSection}
                  onUpdateContent={handleUpdateContent}
                  onUpdatePreviewHtml={handleUpdatePreviewHtml}
                  onUploadAsset={handleUploadAsset}
                  onAddChildNode={handleOpenAddModal}
                  onDeleteNode={handleDeleteNode}
                  onFocusNode={(id) => setState((s) => ({ ...s, focusedNodeId: id }))}
                  onMoveOrder={handleMoveNodeOrder}
                  onShiftHierarchy={handleShiftNodeHierarchy}
                />
              ))}

              {/* Bottom Add Section Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenAddModal(displayNode.id)}
                  className="w-full py-4 px-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 dark:border-slate-800 dark:hover:border-blue-500 bg-white/60 hover:bg-blue-50/60 dark:bg-slate-900/40 dark:hover:bg-blue-950/30 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm group active:scale-[0.99]"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span>+ 새 최상위 기획 항목 추가</span>
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Floating Quick Navigation (Scroll-to-top & TOC Jump) */}
      {showScrollTop && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 animate-fadeIn">
          <button
            type="button"
            onClick={() => setShowFloatingToc(true)}
            title="목차 퀵 점프 팝업 열기"
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-300/40 dark:shadow-slate-950/40 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <ListTree className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">목차</span>
          </button>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="맨 위로 이동"
            className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xl shadow-blue-500/30 transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="hidden sm:inline">맨 위로</span>
          </button>
        </div>
      )}

      {/* Floating Quick Jump TOC Drawer/Popup */}
      <FloatingTocDrawer
        isOpen={showFloatingToc}
        rootNode={displayNode}
        onClose={() => setShowFloatingToc(false)}
        onSelectSection={handleSelectSection}
      />

      {/* New Section Modal */}
      <NewSectionModal
        isOpen={modalState.isOpen}
        parentTitle={modalState.parentTitle}
        defaultOrder={modalState.defaultOrder}
        onClose={() => setModalState((m) => ({ ...m, isOpen: false }))}
        onSubmit={handleCreateSection}
      />

      {/* AI Plan Import Modal (외부 AI 기획 내용 가져오기 모달) */}
      <AiImportModal
        isOpen={isAiImportOpen}
        onClose={() => setIsAiImportOpen(false)}
        onImport={handleImportAiPlan}
        nextOrder={state.rootNode.children.length + 1}
      />
    </div>
  );
};
