// @cohesive-file
/**
 * @domain 로컬 폴더 관리
 * @feature 로컬 폴더 연결 & 자동 저장
 * @phase API
 * @target 브라우저 파일 시스템 연동 기능
 * @desc 내 컴퓨터 폴더를 읽어오고 파일과 이미지를 실제로 저장하는 통로
 * @next src/lib/fileSystem/idbStorage.ts
 */
import type { DocNode, NodeMeta } from '../../types/workspace';

export async function verifyPermission(
  fileHandle: FileSystemHandle,
  readWrite = true
): Promise<boolean> {
  const options: Record<string, string> = {};
  if (readWrite) {
    options.mode = 'readwrite';
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handle = fileHandle as any;
  if (typeof handle.queryPermission === 'function' && (await handle.queryPermission(options)) === 'granted') {
    return true;
  }
  if (typeof handle.requestPermission === 'function' && (await handle.requestPermission(options)) === 'granted') {
    return true;
  }
  return false;
}

export function supportsDirectoryPicker(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof window !== 'undefined' && 'showDirectoryPicker' in (window as any);
}

export async function openDirectoryPicker(silent = false): Promise<FileSystemDirectoryHandle | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  if (!('showDirectoryPicker' in win)) {
    if (!silent) {
      alert('현재 브라우저가 File System Access API를 지원하지 않습니다. Chrome 또는 Edge 브라우저를 권장합니다.');
    }
    return null;
  }
  try {
    const handle = await win.showDirectoryPicker({
      mode: 'readwrite',
    });
    return handle as FileSystemDirectoryHandle;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return null;
    }
    console.error('Error opening directory picker:', err);
    return null;
  }
}

async function readFileAsText(dirHandle: FileSystemDirectoryHandle, fileName: string): Promise<string | null> {
  try {
    const fileHandle = await dirHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    return await file.text();
  } catch {
    return null;
  }
}

export async function writeTextFile(
  dirHandle: FileSystemDirectoryHandle,
  fileName: string,
  content: string
): Promise<boolean> {
  try {
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const writable = await (fileHandle as any).createWritable();
    await writable.write(content);
    await writable.close();
    return true;
  } catch (err) {
    console.error(`Failed to write file ${fileName}:`, err);
    return false;
  }
}

export async function writeAssetFile(
  dirHandle: FileSystemDirectoryHandle,
  fileName: string,
  fileData: Blob
): Promise<string | null> {
  try {
    const assetsDir = await dirHandle.getDirectoryHandle('assets', { create: true });
    const fileHandle = await assetsDir.getFileHandle(fileName, { create: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const writable = await (fileHandle as any).createWritable();
    await writable.write(fileData);
    await writable.close();
    return URL.createObjectURL(fileData);
  } catch (err) {
    console.error(`Failed to write asset ${fileName}:`, err);
    return null;
  }
}

export async function scanDirectoryNode(
  dirHandle: FileSystemDirectoryHandle,
  path: string = '',
  name: string = ''
): Promise<DocNode> {
  const currentPath = path ? `${path}/${name}` : name;

  // 1. Read node.json
  let meta: NodeMeta = {
    title: name || dirHandle.name,
    order: 1,
  };
  const nodeJsonText = await readFileAsText(dirHandle, 'node.json');
  if (nodeJsonText) {
    try {
      meta = { ...meta, ...JSON.parse(nodeJsonText) };
    } catch {
      console.warn(`Failed to parse node.json in ${dirHandle.name}`);
    }
  }

  // 2. Read content.md
  const content = (await readFileAsText(dirHandle, 'content.md')) || '';

  // 3. Read preview.html
  const previewHtml = (await readFileAsText(dirHandle, 'preview.html')) || undefined;

  // 4. Read assets directory if present
  const assets: Record<string, string> = {};
  try {
    const assetsHandle = await dirHandle.getDirectoryHandle('assets');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const entry of (assetsHandle as any).values()) {
      if (entry.kind === 'file') {
        const file = await entry.getFile();
        if (file.type.startsWith('image/')) {
          assets[entry.name] = URL.createObjectURL(file);
        }
      }
    }
  } catch {
    // No assets folder, continue
  }

  // 5. Scan child directories
  const children: DocNode[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for await (const entry of (dirHandle as any).values()) {
    if (entry.kind === 'directory' && entry.name !== 'assets' && !entry.name.startsWith('.')) {
      const childNode = await scanDirectoryNode(entry, currentPath, entry.name);
      children.push(childNode);
    }
  }

  // Sort children by order, then name
  children.sort((a, b) => {
    if (a.meta.order !== b.meta.order) return a.meta.order - b.meta.order;
    return a.name.localeCompare(b.name);
  });

  return {
    id: currentPath || dirHandle.name,
    name: name || dirHandle.name,
    path: currentPath,
    meta,
    content,
    previewHtml,
    assets,
    children,
    dirHandle,
  };
}

export async function createChildNode(
  parentHandle: FileSystemDirectoryHandle,
  dirName: string,
  title: string,
  order: number
): Promise<FileSystemDirectoryHandle | null> {
  try {
    const childHandle = await parentHandle.getDirectoryHandle(dirName, { create: true });
    const meta: NodeMeta = { title, order };
    await writeTextFile(childHandle, 'node.json', JSON.stringify(meta, null, 2));
    await writeTextFile(childHandle, 'content.md', `# ${title}\n\n초기 기획 내용을 작성하세요.`);
    return childHandle;
  } catch (err) {
    console.error('Failed to create child directory:', err);
    return null;
  }
}

export interface CreateProjectDetailedResult {
  success: boolean;
  projectHandle?: FileSystemDirectoryHandle;
  errorReason?: 'PERMISSION_DENIED' | 'SECURITY_RESTRICTION' | 'NAME_INVALID' | 'UNKNOWN';
  errorMessage?: string;
  mobileGuide?: string;
}

export async function createNewProjectWorkspaceDetailed(
  parentHandle: FileSystemDirectoryHandle,
  projectName: string,
  projectTitle: string
): Promise<CreateProjectDetailedResult> {
  // 1. Explicitly check and request readwrite permission first
  try {
    const hasPermission = await verifyPermission(parentHandle, true);
    if (!hasPermission) {
      return {
        success: false,
        errorReason: 'PERMISSION_DENIED',
        errorMessage: '선택한 폴더에 쓰기 권한이 없습니다. 브라우저에서 권한 요청을 승인해주세요.',
        mobileGuide: '모바일 브라우저의 경우 시스템 팝업에서 "허용" 또는 "파일 수정 권한"을 선택해야 합니다.',
      };
    }
  } catch (permErr) {
    console.warn('Error checking directory permission:', permErr);
  }

  // 2. Try creating directory & files
  try {
    const cleanName = projectName.trim();
    if (!cleanName) {
      return {
        success: false,
        errorReason: 'NAME_INVALID',
        errorMessage: '유효한 폴더 이름을 입력해주세요.',
      };
    }

    const projectHandle = await parentHandle.getDirectoryHandle(cleanName, { create: true });
    
    const meta: NodeMeta = {
      title: projectTitle.trim() || cleanName,
      order: 1,
      tags: ['신규기획'],
    };
    
    const writeMetaOk = await writeTextFile(projectHandle, 'node.json', JSON.stringify(meta, null, 2));
    if (!writeMetaOk) {
      throw new Error('WRITE_FAILED');
    }

    await writeTextFile(
      projectHandle,
      'content.md',
      `# ${projectTitle.trim() || cleanName}\n\n이 프로젝트의 개요, 도입 배경 및 목표를 작성해주세요.`
    );
    await projectHandle.getDirectoryHandle('assets', { create: true });

    return {
      success: true,
      projectHandle,
    };
  } catch (err: unknown) {
    console.error('Failed to create project workspace directory:', err);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const domErr = err as any;
    const errName = domErr?.name || '';
    const errMsg = domErr?.message || '';

    // Android Storage Access Framework (SAF) security / not allowed restrictions
    if (errName === 'SecurityError') {
      return {
        success: false,
        errorReason: 'SECURITY_RESTRICTION',
        errorMessage: '시스템 보안 정책에 의해 해당 폴더에는 새 폴더를 생성할 수 없습니다.',
        mobileGuide: '안드로이드 환경에서는 "다운로드(Downloads)" 최상위 폴더나 시스템 폴더에 직접 쓰기가 제한됩니다. "문서(Documents)" 폴더나 별도의 하위 폴더를 저장 위치로 선택해주세요.',
      };
    }

    if (errName === 'NotAllowedError') {
      return {
        success: false,
        errorReason: 'PERMISSION_DENIED',
        errorMessage: '폴더 쓰기 권한이 거부되었거나 만료되었습니다.',
        mobileGuide: '모바일 OS는 보안상 특정 폴더(다운로드 루트 등)의 쓰기를 차단합니다. 다른 폴더(예: 내 파일 > 문서)를 선택하거나 새 폴더를 만들어 지정해주세요.',
      };
    }

    if (errName === 'InvalidModificationError' || errName === 'TypeMismatchError') {
      return {
        success: false,
        errorReason: 'NAME_INVALID',
        errorMessage: '동일한 이름의 파일이나 유효하지 않은 폴더명이 이미 존재합니다. 다른 이름을 사용해주세요.',
      };
    }

    return {
      success: false,
      errorReason: 'UNKNOWN',
      errorMessage: errMsg || '프로젝트 폴더 생성 중 오류가 발생했습니다. 권한이나 폴더명을 확인해주세요.',
      mobileGuide: '모바일 브라우저의 경우 다운로드 루트 대신 별도 하위 폴더를 지정하면 정상 작동할 수 있습니다.',
    };
  }
}

export async function createNewProjectWorkspace(
  parentHandle: FileSystemDirectoryHandle,
  projectName: string,
  projectTitle: string
): Promise<FileSystemDirectoryHandle | null> {
  const result = await createNewProjectWorkspaceDetailed(parentHandle, projectName, projectTitle);
  return result.projectHandle || null;
}

export async function deleteChildNode(
  parentHandle: FileSystemDirectoryHandle,
  dirName: string
): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (parentHandle as any).removeEntry(dirName, { recursive: true });
    return true;
  } catch (err) {
    console.error('Failed to delete directory:', err);
    return false;
  }
}
