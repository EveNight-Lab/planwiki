import { describe, it, expect } from 'vitest';
import type { DocNode } from '../types/workspace';
import { promoteNodeInTree, demoteNodeInTree } from './treeHierarchy';

function createMockTree(): DocNode {
  return {
    id: 'root',
    name: '루트',
    path: '',
    content: '루트 내용',
    meta: { order: 0, title: '루트' },
    assets: {},
    children: [
      {
        id: 'sec-1',
        name: '01_섹션1',
        path: '01_섹션1',
        content: '섹션 1 내용',
        meta: { order: 1, title: '섹션 1' },
        assets: {},
        children: [
          {
            id: 'sec-1-1',
            name: '01_서브1',
            path: '01_섹션1/01_서브1',
            content: '서브 1 내용',
            meta: { order: 1, title: '서브 1' },
            assets: {},
            children: [],
          },
          {
            id: 'sec-1-2',
            name: '02_서브2',
            path: '01_섹션1/02_서브2',
            content: '서브 2 내용',
            meta: { order: 2, title: '서브 2' },
            assets: {},
            children: [],
          },
        ],
      },
      {
        id: 'sec-2',
        name: '02_섹션2',
        path: '02_섹션2',
        content: '섹션 2 내용',
        meta: { order: 2, title: '섹션 2' },
        assets: {},
        children: [],
      },
    ],
  };
}

describe('treeHierarchy tests', () => {
  it('하위 항목 승격(promote) 시 기존 부모에서 제거되고 상위(루트)에 1개만 삽입되어야 한다 (복사 버그 방지)', () => {
    const tree = createMockTree();
    const result = promoteNodeInTree(tree, 'sec-1-1');

    expect(result.success).toBe(true);

    const newTree = result.root;
    // 1. 루트의 직속 자식이 3개가 되어야 함: sec-1, sec-1-1, sec-2
    expect(newTree.children.length).toBe(3);
    expect(newTree.children[0].id).toBe('sec-1');
    expect(newTree.children[1].id).toBe('sec-1-1');
    expect(newTree.children[2].id).toBe('sec-2');

    // 2. 각 자식의 order가 1, 2, 3으로 순차 배정되어야 함
    expect(newTree.children[0].meta.order).toBe(1);
    expect(newTree.children[1].meta.order).toBe(2);
    expect(newTree.children[2].meta.order).toBe(3);

    // 3. 기존 부모(sec-1)에는 더 이상 sec-1-1이 존재하지 않고 sec-1-2만 1개 남아있어야 함
    const parent = newTree.children[0];
    expect(parent.children.length).toBe(1);
    expect(parent.children[0].id).toBe('sec-1-2');
    expect(parent.children[0].meta.order).toBe(1);
  });

  it('이미 최상위 항목은 승격할 수 없어야 한다', () => {
    const tree = createMockTree();
    const result = promoteNodeInTree(tree, 'sec-1');

    expect(result.success).toBe(false);
    expect(result.message).toContain('최상위 항목');
  });

  it('앞선 형제의 하위로 편입(demote) 시 부모에서 제거되고 앞 형제의 children에 추가되어야 한다', () => {
    const tree = createMockTree();
    const result = demoteNodeInTree(tree, 'sec-2');

    expect(result.success).toBe(true);

    const newTree = result.root;
    // 루트의 직속 자식은 sec-1 1개만 남음
    expect(newTree.children.length).toBe(1);
    expect(newTree.children[0].id).toBe('sec-1');

    // sec-1의 children에 sec-2가 마지막 자식으로 추가되어야 함
    const sec1 = newTree.children[0];
    expect(sec1.children.length).toBe(3);
    expect(sec1.children[2].id).toBe('sec-2');
    expect(sec1.children[2].meta.order).toBe(3);
  });
});
