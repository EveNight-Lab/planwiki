import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { parseZipToDocNodeTree } from './importZip';

describe('parseZipToDocNodeTree', () => {
  it('correctly parses a hierarchical ZIP into a DocNode tree', async () => {
    const zip = new JSZip();
    const rootFolder = zip.folder('my-project')!;

    // Root files
    rootFolder.file('node.json', JSON.stringify({ title: '나의 멋진 기획서', order: 1, tags: ['핀테크'] }));
    rootFolder.file('content.md', '# 나의 멋진 기획서\n\n개요 설명입니다.');

    // Child 1
    const child1 = rootFolder.folder('01_회원가입')!;
    child1.file('node.json', JSON.stringify({ title: '회원가입 절차', order: 1 }));
    child1.file('content.md', '## 회원가입 상세');
    child1.file('preview.html', '<button>가입하기</button>');

    // Child 2
    const child2 = rootFolder.folder('02_결제연동')!;
    child2.file('node.json', JSON.stringify({ title: '결제 모듈', order: 2 }));
    child2.file('content.md', '## 결제 상세');

    const { projectName, rootNode } = await parseZipToDocNodeTree(zip);

    expect(projectName).toBe('my-project');
    expect(rootNode.meta.title).toBe('나의 멋진 기획서');
    expect(rootNode.content).toContain('개요 설명입니다');
    expect(rootNode.children.length).toBe(2);

    expect(rootNode.children[0].name).toBe('01_회원가입');
    expect(rootNode.children[0].meta.title).toBe('회원가입 절차');
    expect(rootNode.children[0].previewHtml).toBe('<button>가입하기</button>');

    expect(rootNode.children[1].name).toBe('02_결제연동');
    expect(rootNode.children[1].meta.title).toBe('결제 모듈');
  });

  it('handles flat structure when no single root directory exists', async () => {
    const zip = new JSZip();
    zip.file('node.json', JSON.stringify({ title: '단일 기획' }));
    zip.file('content.md', '# 단일 기획서');

    const { projectName, rootNode } = await parseZipToDocNodeTree(zip);
    expect(projectName).toBe('imported-project');
    expect(rootNode.meta.title).toBe('단일 기획');
    expect(rootNode.content).toBe('# 단일 기획서');
  });
});
