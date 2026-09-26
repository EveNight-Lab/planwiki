/**
 * @domain 기획 문서 작업
 * @feature 단락 계층 구조 재배치
 * @phase 연산 (Compute)
 * @target 트리 계층 승격 및 강등 순수 함수
 * @desc 부모-자식 트리 노드를 불변 방식으로 안전하게 이동시키고 순서(order)를 재색인하는 비즈니스 연산 함수
 */

import type { DocNode } from '../types/workspace';

// Helper: Deep clone DocNode tree immutably
export function cloneTree(node: DocNode): DocNode {
  return {
    ...node,
    meta: { ...node.meta, tags: [...(node.meta.tags || [])] },
    assets: { ...(node.assets || {}) },
    children: node.children.map(cloneTree),
  };
}

// Helper: Find parent node in tree
export function findParentInTree(root: DocNode, targetId: string): DocNode | null {
  for (const child of root.children) {
    if (child.id === targetId) return root;
    const found = findParentInTree(child, targetId);
    if (found) return found;
  }
  return null;
}

/**
 * 하위 노드를 한 단계 상위 부모(조부모)의 자식으로 승격(Promote)
 * - 기존 부모의 children에서 안전하게 제거
 * - 조부모의 children에서 기존 부모 바로 뒤에 삽입
 * - order를 1부터 순차적으로 재색인
 */
export function promoteNodeInTree(
  root: DocNode,
  nodeId: string
): { root: DocNode; success: boolean; message?: string } {
  const cloned = cloneTree(root);
  const parent = findParentInTree(cloned, nodeId);
  if (!parent) {
    return { root, success: false, message: '대상의 부모 노드를 찾을 수 없습니다.' };
  }

  // 최상위 항목은 더 이상 승격 불가
  if (parent.id === cloned.id) {
    return { root, success: false, message: '이미 최상위 항목이므로 더 이상 상위로 승격할 수 없습니다.' };
  }

  const grandParent = findParentInTree(cloned, parent.id);
  if (!grandParent) {
    return { root, success: false, message: '상위 계층을 찾을 수 없습니다.' };
  }

  // 1. 현재 부모에서 target 추출 및 제거
  const targetIndex = parent.children.findIndex((c) => c.id === nodeId);
  if (targetIndex === -1) {
    return { root, success: false, message: '대상을 찾을 수 없습니다.' };
  }
  const [targetNode] = parent.children.splice(targetIndex, 1);

  // 부모의 나머지 자식들 order 재색인
  parent.children.forEach((c, idx) => {
    c.meta.order = idx + 1;
  });

  // 2. 조부모의 children에서 현재 parent 바로 뒤에 target 삽입
  const parentIndexInGrand = grandParent.children.findIndex((c) => c.id === parent.id);
  if (parentIndexInGrand === -1) {
    return { root, success: false, message: '조부모 계층에서 부모를 찾을 수 없습니다.' };
  }
  grandParent.children.splice(parentIndexInGrand + 1, 0, targetNode);

  // 조부모의 자식들 order 재색인
  grandParent.children.forEach((c, idx) => {
    c.meta.order = idx + 1;
  });

  return { root: cloned, success: true };
}

/**
 * 노드를 바로 앞선 형제 노드의 자식으로 강등(Demote)
 * - 부모의 children에서 대상 노드 제거
 * - 바로 앞선 형제의 children 맨 끝에 추가
 * - order를 1부터 순차적으로 재색인
 */
export function demoteNodeInTree(
  root: DocNode,
  nodeId: string
): { root: DocNode; success: boolean; message?: string } {
  const cloned = cloneTree(root);
  const parent = findParentInTree(cloned, nodeId);
  if (!parent) {
    return { root, success: false, message: '대상의 부모 노드를 찾을 수 없습니다.' };
  }

  const currentIndex = parent.children.findIndex((c) => c.id === nodeId);
  if (currentIndex <= 0) {
    return { root, success: false, message: '앞 항목이 없어서 하위로 편입할 수 없습니다.' };
  }

  const previousSibling = parent.children[currentIndex - 1];

  // 1. 부모에서 target 제거
  const [targetNode] = parent.children.splice(currentIndex, 1);
  parent.children.forEach((c, idx) => {
    c.meta.order = idx + 1;
  });

  // 2. 이전 형제의 children에 추가
  previousSibling.children.push(targetNode);
  previousSibling.children.forEach((c, idx) => {
    c.meta.order = idx + 1;
  });

  return { root: cloned, success: true };
}
