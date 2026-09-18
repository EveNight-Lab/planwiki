/**
 * @domain 프로토타입 & AI 전달
 * @feature AI 전달용 압축 다운로드
 * @phase 저장소
 * @target 기획 문서 정보 형식 정의
 * @desc 기획 항목의 제목, 순서, 본문, 테스트 코드가 담기는 데이터 모양 정의
 */
export interface NodeMeta {
  title: string;
  order: number;
  icon?: string;
  tags?: string[];
  description?: string;
}

export interface DocNode {
  id: string; // Unique identifier or relative path
  name: string; // Directory name (e.g. "01_PG사-연동-규격")
  path: string; // Relative path from root
  meta: NodeMeta;
  content: string; // Markdown text (content.md)
  previewHtml?: string; // HTML prototype code (preview.html)
  assets: Record<string, string>; // filename -> blob/data url
  children: DocNode[];
  dirHandle?: FileSystemDirectoryHandle;
}

export interface WorkspaceState {
  name: string;
  rootNode: DocNode;
  isLocal: boolean;
  dirHandle?: FileSystemDirectoryHandle;
  saveStatus: 'saved' | 'saving' | 'error';
  focusedNodeId: string | null;
}
