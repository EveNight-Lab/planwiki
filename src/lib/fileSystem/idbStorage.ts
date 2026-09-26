/**
 * @domain 로컬 폴더 관리
 * @feature 로컬 폴더 연결 & 자동 저장
 * @phase 저장소
 * @store 브라우저 내부 저장소 (handles, projects, virtual_workspaces)
 * @desc 마지막으로 열었던 폴더, 최근 프로젝트 목록 및 모바일 호환 가상 워크스페이스를 브라우저에 저장
 * @next src/pages/WorkspaceView.tsx, src/pages/ProjectHubPage.tsx
 */
import type { DocNode } from '../../types/workspace';

const DB_NAME = 'plancraft_db';
const DB_VERSION = 3;
const STORE_HANDLES = 'handles';
const STORE_PROJECTS = 'projects';
const STORE_VIRTUAL = 'virtual_workspaces';
const ROOT_HANDLE_KEY = 'last_workspace_handle';

export interface ProjectRecord {
  id: string;
  name: string;
  title?: string;
  type: 'local' | 'demo' | 'virtual';
  path?: string;
  lastOpened: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_HANDLES)) {
        db.createObjectStore(STORE_HANDLES);
      }
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_VIRTUAL)) {
        db.createObjectStore(STORE_VIRTUAL, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLastDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_HANDLES, 'readwrite');
    const store = tx.objectStore(STORE_HANDLES);
    store.put(handle, ROOT_HANDLE_KEY);
  } catch (err) {
    console.warn('Failed to save directory handle in IndexedDB', err);
  }
}

export async function getLastDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_HANDLES, 'readonly');
    const store = tx.objectStore(STORE_HANDLES);
    return new Promise((resolve) => {
      const request = store.get(ROOT_HANDLE_KEY);
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function clearLastDirectoryHandle(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_HANDLES, 'readwrite');
    tx.objectStore(STORE_HANDLES).delete(ROOT_HANDLE_KEY);
  } catch {
    // Ignore error
  }
}

const PARENT_HANDLE_KEY = 'last_parent_directory_handle';
const PARENT_NAME_KEY = 'last_parent_directory_name';

export interface CachedParentDirectory {
  handle: FileSystemDirectoryHandle;
  name: string;
}

export async function saveLastParentDirectory(
  handle: FileSystemDirectoryHandle,
  name: string
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_HANDLES, 'readwrite');
    const store = tx.objectStore(STORE_HANDLES);
    store.put(handle, PARENT_HANDLE_KEY);
    store.put(name, PARENT_NAME_KEY);
  } catch (err) {
    console.warn('Failed to save parent directory handle in IndexedDB', err);
  }
}

export async function getLastParentDirectory(): Promise<CachedParentDirectory | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_HANDLES, 'readonly');
    const store = tx.objectStore(STORE_HANDLES);
    return new Promise((resolve) => {
      const handleReq = store.get(PARENT_HANDLE_KEY);
      handleReq.onsuccess = () => {
        const handle = handleReq.result as FileSystemDirectoryHandle | undefined;
        if (!handle) {
          resolve(null);
          return;
        }
        const nameReq = store.get(PARENT_NAME_KEY);
        nameReq.onsuccess = () => {
          resolve({
            handle,
            name: (nameReq.result as string) || handle.name || '선택된 폴더',
          });
        };
        nameReq.onerror = () => {
          resolve({ handle, name: handle.name || '선택된 폴더' });
        };
      };
      handleReq.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function saveProjectRecord(
  name: string,
  type: 'local' | 'demo' | 'virtual',
  title?: string
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_PROJECTS, 'readwrite');
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const record: ProjectRecord = {
      id: `${type}_${name}`,
      name,
      title: title || name,
      type,
      lastOpened: formattedDate,
    };
    tx.objectStore(STORE_PROJECTS).put(record);
  } catch (err) {
    console.warn('Failed to save project record', err);
  }
}

export async function getProjectRecords(): Promise<ProjectRecord[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_PROJECTS, 'readonly');
    const store = tx.objectStore(STORE_PROJECTS);
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const results: ProjectRecord[] = request.result || [];
        results.sort((a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime());
        resolve(results);
      };
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function removeProjectRecord(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction([STORE_PROJECTS, STORE_VIRTUAL], 'readwrite');
    tx.objectStore(STORE_PROJECTS).delete(id);
    tx.objectStore(STORE_VIRTUAL).delete(id);
  } catch {
    // Fallback if STORE_VIRTUAL transaction fails
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      tx.objectStore(STORE_PROJECTS).delete(id);
    } catch {
      // Ignore
    }
  }
}

export async function saveVirtualWorkspace(id: string, rootNode: DocNode): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_VIRTUAL, 'readwrite');
    const store = tx.objectStore(STORE_VIRTUAL);
    store.put({ id, rootNode, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('Failed to save virtual workspace', err);
  }
}

export async function getVirtualWorkspace(id: string): Promise<DocNode | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_VIRTUAL, 'readonly');
    const store = tx.objectStore(STORE_VIRTUAL);
    return new Promise((resolve) => {
      const request = store.get(id);
      request.onsuccess = () => {
        resolve(request.result?.rootNode || null);
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function createVirtualProject(
  projectName: string,
  projectTitle: string
): Promise<{ id: string; rootNode: DocNode }> {
  const cleanName = projectName.trim() || 'my-project';
  const cleanTitle = projectTitle.trim() || cleanName;
  const id = `virtual_${cleanName}`;

  const rootNode: DocNode = {
    id: cleanName,
    name: cleanName,
    path: '',
    meta: {
      title: cleanTitle,
      order: 1,
      tags: ['신규기획', '안심저장소'],
    },
    content: `# ${cleanTitle}\n\n이 프로젝트의 개요, 도입 배경 및 목표를 작성해주세요. (브라우저 안심 저장소에 자동 보관됩니다)`,
    assets: {},
    children: [
      {
        id: `${cleanName}/01_요구사항-정의`,
        name: '01_요구사항-정의',
        path: '01_요구사항-정의',
        meta: {
          title: '핵심 요구사항 및 유저 시나리오',
          order: 1,
          tags: ['기본'],
        },
        content: `## 1. 핵심 요구사항\n- 시스템의 주요 기능과 동작 요구사항을 정의합니다.\n\n## 2. 사용자 시나리오\n1. 사용자가 메인 페이지에 진입한다.\n2. 원하는 작업을 수행한다.`,
        assets: {},
        children: [],
      },
    ],
  };

  await saveVirtualWorkspace(id, rootNode);
  await saveProjectRecord(cleanName, 'virtual', cleanTitle);

  return { id, rootNode };
}
