/**
 * @domain 로컬 폴더 관리
 * @feature 로컬 폴더 연결 & 자동 저장
 * @phase 저장소
 * @store 브라우저 내부 저장소 (handles: last_workspace_handle, projects: history)
 * @desc 마지막으로 열었던 폴더와 최근 프로젝트 목록을 브라우저에 기억해두어 다음 방문 시 바로 열어줌
 * @next src/pages/WorkspaceView.tsx, src/pages/ProjectHubPage.tsx
 */
const DB_NAME = 'plancraft_db';
const STORE_HANDLES = 'handles';
const STORE_PROJECTS = 'projects';
const ROOT_HANDLE_KEY = 'last_workspace_handle';

export interface ProjectRecord {
  id: string;
  name: string;
  title?: string;
  type: 'local' | 'demo';
  path?: string;
  lastOpened: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_HANDLES)) {
        db.createObjectStore(STORE_HANDLES);
      }
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
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

export async function saveProjectRecord(
  name: string,
  type: 'local' | 'demo',
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
    const tx = db.transaction(STORE_PROJECTS, 'readwrite');
    tx.objectStore(STORE_PROJECTS).delete(id);
  } catch {
    // Ignore error
  }
}
