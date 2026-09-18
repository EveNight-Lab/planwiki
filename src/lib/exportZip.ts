/**
 * @domain 프로토타입 & AI 전달
 * @feature AI 전달용 압축 다운로드
 * @phase 연산
 * @target 전체 기획서 압축기
 * @desc 기획서 글, 그림, 테스트 코드와 AI 설명서를 한 덩어리 ZIP 파일로 묶어줌
 * @next src/types/workspace.ts
 */
import JSZip from 'jszip';
import type { DocNode } from '../types/workspace';

function buildSummaryMarkdown(root: DocNode): string {
  let text = `# 🚀 ${root.meta.title || root.name} - AI 개발 핸드오프 패키지\n\n`;
  text += `> 본 패키지는 PlanWiki에서 작성된 기획서와 인라인 HTML/JS 프로토타입을 AI 코딩 에이전트(Antigravity 등)에 전달하기 위해 생성되었습니다.\n\n`;
  text += `## 1. 프로젝트 개요\n${root.content}\n\n`;
  text += `## 2. 전체 디렉터리 및 목차 구조\n`;

  function appendToc(node: DocNode, prefix: string) {
    text += `${prefix}- **${node.meta.title || node.name}** (\`${node.path || '.'}\`)\n`;
    if (node.previewHtml) {
      text += `${prefix}  - 💡 *[프로토타입 코드 포함: preview.html]*\n`;
    }
    node.children.forEach((child) => {
      appendToc(child, prefix + '  ');
    });
  }
  appendToc(root, '');

  text += `\n## 3. AI 에이전트(Antigravity)를 위한 지침\n`;
  text += `1. **기획서 우선 확인**: 각 하위 폴더의 \`content.md\`에 정의된 요구사항 매트릭스 및 API 규격을 기반으로 구현을 진행하세요.\n`;
  text += `2. **프로토타입 참조**: \`preview.html\`이 포함된 항목은 기획자가 직접 인터랙션 및 로직을 검증한 단일 파일 코드입니다. 이 코드의 UI 레이아웃, 상태 관리 방식, 계산 공식을 충실히 컴포넌트화하여 실제 프로젝트 코드에 녹여내세요.\n`;
  text += `3. **모듈 분리 원칙**: 각 폴더의 역할 분리를 프로젝트 아키텍처(컴포넌트/훅/유틸)에 1:1로 매핑하여 일관된 코드베이스를 구축하세요.\n`;

  return text;
}

async function addNodeToZip(node: DocNode, currentZipFolder: JSZip) {
  // 1. Write node.json
  currentZipFolder.file('node.json', JSON.stringify(node.meta, null, 2));

  // 2. Write content.md
  currentZipFolder.file('content.md', node.content || '');

  // 3. Write preview.html if exists
  if (node.previewHtml) {
    currentZipFolder.file('preview.html', node.previewHtml);
  }

  // 4. Write assets
  if (Object.keys(node.assets).length > 0) {
    const assetsFolder = currentZipFolder.folder('assets');
    if (assetsFolder) {
      for (const [filename, url] of Object.entries(node.assets)) {
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          assetsFolder.file(filename, blob);
        } catch (err) {
          console.warn(`Could not include asset ${filename} in zip`, err);
        }
      }
    }
  }

  // 5. Recursively add children
  for (const child of node.children) {
    const childFolder = currentZipFolder.folder(child.name);
    if (childFolder) {
      await addNodeToZip(child, childFolder);
    }
  }
}

export async function exportWorkspaceAsZip(rootNode: DocNode): Promise<void> {
  const zip = new JSZip();
  const rootFolderName = rootNode.name || 'plancraft-workspace';
  const mainFolder = zip.folder(rootFolderName) || zip;

  // Add summary markdown for AI
  mainFolder.file('AI_HANDOFF_SUMMARY.md', buildSummaryMarkdown(rootNode));

  // Add all files recursively
  await addNodeToZip(rootNode, mainFolder);

  // Generate zip and trigger download
  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${rootFolderName}-antigravity-pack.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
