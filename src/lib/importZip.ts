// @cohesive-file
/**
 * @domain 프로젝트 관리
 * @feature ZIP 프로젝트 불러오기
 * @phase 연산
 * @target ZIP 압축 해제 및 기획서 트리 복원기
 * @desc 사용자가 업로드한 ZIP 파일에서 마크다운, 목업, 이미지를 파싱하여 워크스페이스 노드 트리로 복원
 * @store IndexedDB (virtual_workspaces, projects)
 * @next src/lib/fileSystem/idbStorage.ts
 */
import JSZip from 'jszip';
import type { DocNode, NodeMeta } from '../types/workspace';
import { saveVirtualWorkspace, saveProjectRecord } from './fileSystem/idbStorage';

interface ParsedFile {
  name: string;
  path: string;
  isDir: boolean;
  async: (type: 'string' | 'blob') => Promise<string | Blob>;
}

export async function parseZipToDocNodeTree(zip: JSZip): Promise<{ projectName: string; rootNode: DocNode }> {
  // Collect all entries in a map
  const entries: Record<string, ParsedFile> = {};
  zip.forEach((relativePath, file) => {
    // Normalize path (strip trailing slashes for dirs)
    const normalized = relativePath.replace(/\/$/, '');
    entries[normalized] = {
      name: file.name.split('/').filter(Boolean).pop() || '',
      path: normalized,
      isDir: file.dir,
      async: (type) => (type === 'blob' ? file.async('blob') : file.async('string')),
    };
  });

  // Find root directory prefix if the zip wraps everything inside a single folder
  const topLevelPaths = new Set<string>();
  for (const path of Object.keys(entries)) {
    const topPart = path.split('/')[0];
    if (topPart) topLevelPaths.add(topPart);
  }

  let rootPrefix = '';
  if (topLevelPaths.size === 1) {
    rootPrefix = Array.from(topLevelPaths)[0];
  }

  const projectName = rootPrefix || 'imported-project';

  // Recursive builder function
  async function buildNode(currentPath: string, nodeName: string): Promise<DocNode> {
    const prefix = currentPath ? `${currentPath}/` : '';

    // 1. Read node.json if present
    let meta: NodeMeta = {
      title: nodeName,
      order: 1,
    };
    const nodeJsonEntry = entries[`${prefix}node.json`];
    if (nodeJsonEntry) {
      try {
        const text = (await nodeJsonEntry.async('string')) as string;
        meta = { ...meta, ...JSON.parse(text) };
      } catch (err) {
        console.warn(`Failed to parse node.json in ${currentPath}`, err);
      }
    }

    // 2. Read content.md
    let content = '';
    const contentEntry = entries[`${prefix}content.md`];
    if (contentEntry) {
      content = (await contentEntry.async('string')) as string;
    }

    // 3. Read preview.html
    let previewHtml: string | undefined;
    const previewEntry = entries[`${prefix}preview.html`];
    if (previewEntry) {
      previewHtml = (await previewEntry.async('string')) as string;
    }

    // 4. Read assets/ folder
    const assets: Record<string, string> = {};
    const assetsPrefix = `${prefix}assets/`;
    for (const [path, entry] of Object.entries(entries)) {
      if (path.startsWith(assetsPrefix) && !entry.isDir) {
        const fileName = path.slice(assetsPrefix.length);
        if (!fileName.includes('/')) {
          try {
            const blob = (await entry.async('blob')) as Blob;
            assets[fileName] = URL.createObjectURL(blob);
          } catch (err) {
            console.warn(`Failed to read asset ${fileName}`, err);
          }
        }
      }
    }

    // 5. Find child directories
    const childNames = new Set<string>();
    for (const path of Object.keys(entries)) {
      if (path.startsWith(prefix) && path !== currentPath) {
        const relative = path.slice(prefix.length);
        const parts = relative.split('/');
        const firstPart = parts[0];
        if (firstPart && firstPart !== 'assets' && !firstPart.startsWith('.') && firstPart !== 'AI_HANDOFF_SUMMARY.md') {
          // If it has children or is a directory
          if (parts.length > 1 || entries[path]?.isDir) {
            childNames.add(firstPart);
          }
        }
      }
    }

    const children: DocNode[] = [];
    for (const childName of Array.from(childNames)) {
      const childPath = currentPath ? `${currentPath}/${childName}` : childName;
      const childNode = await buildNode(childPath, childName);
      children.push(childNode);
    }

    // Sort children by order, then name
    children.sort((a, b) => {
      if (a.meta.order !== b.meta.order) return a.meta.order - b.meta.order;
      return a.name.localeCompare(b.name);
    });

    return {
      id: currentPath || nodeName,
      name: nodeName,
      path: currentPath,
      meta,
      content,
      previewHtml,
      assets,
      children,
    };
  }

  const rootNode = await buildNode(rootPrefix, projectName);
  return { projectName, rootNode };
}

export async function importWorkspaceFromZip(file: File | Blob): Promise<{
  projectId: string;
  projectName: string;
  projectTitle: string;
  rootNode: DocNode;
}> {
  const zip = await JSZip.loadAsync(file);
  const { projectName, rootNode } = await parseZipToDocNodeTree(zip);

  const projectTitle = rootNode.meta.title || projectName;
  const projectId = `virtual_${projectName}_${Date.now()}`;

  // Save to IndexedDB
  await saveVirtualWorkspace(projectId, rootNode);
  await saveProjectRecord(projectName, 'virtual', projectTitle);

  return {
    projectId,
    projectName,
    projectTitle,
    rootNode,
  };
}
