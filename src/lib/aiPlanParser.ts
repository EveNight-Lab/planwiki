/**
 * @domain 외부 AI 연동
 * @feature 외부 AI 기획 텍스트 문서 임포트
 * @phase 연산 (Compute)
 * @target AI 기획 텍스트 파서 및 DocNode 정규화기
 * @desc 외부 AI 대화방에서 출력된 JSON/마크다운 텍스트를 검증하고 PlanWiki의 DocNode 계층 구조로 변환
 * @next src/components/modal/AiImportModal.tsx
 */

import type { DocNode } from '../types/workspace';

export interface RawAiPlanNode {
  title: string;
  description?: string;
  tags?: string[];
  content?: string;
  previewHtml?: string;
  children?: RawAiPlanNode[];
}

export interface ParseResult {
  success: boolean;
  nodes: DocNode[];
  error?: string;
  totalNodeCount: number;
}

/**
 * 텍스트에서 JSON 블록을 안전하게 추출하는 순수 함수
 */
export function extractJsonFromText(rawText: string): string {
  if (!rawText || !rawText.trim()) return '';

  // 1. ```json ... ``` 코드블록 탐색
  const jsonBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonBlockMatch && jsonBlockMatch[1]) {
    return jsonBlockMatch[1].trim();
  }

  // 2. [ ... ] 또는 { ... } 탐색
  const bracketStart = rawText.indexOf('[');
  const braceStart = rawText.indexOf('{');

  let startIndex = -1;
  let endIndex = -1;

  if (bracketStart !== -1 && (braceStart === -1 || bracketStart < braceStart)) {
    startIndex = bracketStart;
    endIndex = rawText.lastIndexOf(']');
  } else if (braceStart !== -1) {
    startIndex = braceStart;
    endIndex = rawText.lastIndexOf('}');
  }

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    return rawText.slice(startIndex, endIndex + 1).trim();
  }

  return rawText.trim();
}

/**
 * 파일시스템/URL 친화적인 디렉토리명 슬러그 생성
 */
function sanitizeNodeName(title: string, index: number): string {
  const safeTitle = title
    .replace(/[\\/:*?"<>|]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const prefix = String(index).padStart(2, '0');
  return safeTitle ? `${prefix}_${safeTitle}` : `${prefix}_단락`;
}

/**
 * Raw JSON 노드를 표준 DocNode 트리로 재귀 변환
 */
function convertToDocNodes(
  rawList: RawAiPlanNode[],
  parentPath: string = '',
  startOrder: number = 1
): DocNode[] {
  return rawList.map((item, idx) => {
    const order = startOrder + idx;
    const title = item.title || `기획 항목 ${order}`;
    const name = sanitizeNodeName(title, order);
    const nodePath = parentPath ? `${parentPath}/${name}` : name;
    const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${order}`;

    const children = item.children && Array.isArray(item.children)
      ? convertToDocNodes(item.children, nodePath, 1)
      : [];

    return {
      id,
      name,
      path: nodePath,
      meta: {
        title,
        order,
        description: item.description || '',
        tags: Array.isArray(item.tags) ? item.tags : [],
      },
      content: item.content || `### ${title}\n\n내용을 작성하세요.`,
      previewHtml: item.previewHtml || undefined,
      assets: {},
      children,
    };
  });
}

/**
 * 총 노드 개수(자식 포함) 계산
 */
function countTotalNodes(nodes: DocNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countTotalNodes(n.children), 0);
}

/**
 * AI 기획 텍스트를 검증하고 DocNode 목록으로 변환하는 메인 파서
 */
export function parseAiPlanToNodes(rawInput: string, startOrder: number = 1): ParseResult {
  if (!rawInput || !rawInput.trim()) {
    return {
      success: false,
      nodes: [],
      error: '입력된 내용이 없습니다. AI 대화 결과를 붙여넣어 주세요.',
      totalNodeCount: 0,
    };
  }

  const jsonStr = extractJsonFromText(rawInput);
  if (!jsonStr) {
    return {
      success: false,
      nodes: [],
      error: '유효한 JSON 또는 코드 블록을 찾을 수 없습니다.',
      totalNodeCount: 0,
    };
  }

  let parsedData: unknown;
  try {
    parsedData = JSON.parse(jsonStr);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      nodes: [],
      error: `JSON 문법 오류: ${errorMsg}`,
      totalNodeCount: 0,
    };
  }

  let rawList: RawAiPlanNode[] = [];
  if (Array.isArray(parsedData)) {
    rawList = parsedData as RawAiPlanNode[];
  } else if (parsedData && typeof parsedData === 'object') {
    // 단일 객체이거나 { nodes: [...] }, { items: [...] } 형태인 경우
    const obj = parsedData as Record<string, unknown>;
    if (Array.isArray(obj.nodes)) {
      rawList = obj.nodes as RawAiPlanNode[];
    } else if (Array.isArray(obj.items)) {
      rawList = obj.items as RawAiPlanNode[];
    } else if (typeof obj.title === 'string') {
      rawList = [obj as unknown as RawAiPlanNode];
    } else {
      return {
        success: false,
        nodes: [],
        error: 'JSON 데이터에 유효한 기획 항목(title)이 포함되어 있지 않습니다.',
        totalNodeCount: 0,
      };
    }
  }

  if (rawList.length === 0) {
    return {
      success: false,
      nodes: [],
      error: '변환할 수 있는 기획 항목이 비어 있습니다.',
      totalNodeCount: 0,
    };
  }

  try {
    const docNodes = convertToDocNodes(rawList, '', startOrder);
    const totalNodeCount = countTotalNodes(docNodes);

    return {
      success: true,
      nodes: docNodes,
      totalNodeCount,
    };
  } catch (convErr) {
    return {
      success: false,
      nodes: [],
      error: `노드 변환 실패: ${convErr instanceof Error ? convErr.message : String(convErr)}`,
      totalNodeCount: 0,
    };
  }
}
