import { describe, it, expect } from 'vitest';
import { markdownToHtml, htmlToMarkdown } from './markdownConvert';

describe('markdownConvert 인라인 프로토타입 위젯 변환 테스트', () => {
  it('단일 단락 내에 프로토타입이 2개 삽입되어 있어도 각각 위젯 카드로 변환되고 다시 마크다운으로 무손실 복원된다', () => {
    const inputMd = `### 첫 번째 설명
첫 번째 설명 본문입니다.

\`\`\`html:preview
<div class="test-1"><button>버튼 1</button></div>
\`\`\`

### 두 번째 설명
중간에 작성된 텍스트입니다.

\`\`\`html:preview
<div class="test-2"><button>버튼 2</button></div>
\`\`\`

### 결론
마지막 결론 텍스트입니다.`;

    // 1. Markdown -> HTML (위젯 카드 포함)
    const html = markdownToHtml(inputMd);
    expect(html).toContain('prototype-embed-widget');
    // 위젯 카드가 2개 생성되었는지 확인
    const widgetCount = (html.match(/prototype-embed-widget/g) || []).length;
    expect(widgetCount).toBe(2);

    // 2. HTML -> Markdown (다시 표준 마크다운으로 복원)
    const restoredMd = htmlToMarkdown(html);
    expect(restoredMd).toContain('### 첫 번째 설명');
    expect(restoredMd).toContain('버튼 1');
    expect(restoredMd).toContain('### 두 번째 설명');
    expect(restoredMd).toContain('버튼 2');
    expect(restoredMd).toContain('### 결론');

    // 마크다운 블록이 2개 복원되었는지 확인
    const blockCount = (restoredMd.match(/```html:preview/g) || []).length;
    expect(blockCount).toBe(2);
  });

  it('빈 줄과 <style> button {...} </style> 태그가 포함되어 있어도 마크다운 파서가 깨뜨리지 않고 위젯으로 안전 격리된다', () => {
    const dangerousMd = `### 위험 태그 격리 검증

\`\`\`html:preview
<!DOCTYPE html>
<html>
<head>
  <style>
    button { background: #3b82f6; color: white; border: none; padding: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <button>테스트 버튼</button>
  </div>
</body>
</html>
\`\`\`
`;

    const html = markdownToHtml(dangerousMd);
    expect(html).toContain('prototype-embed-widget');
    // 위젯의 7가지 핵심 액션 요소들이 온전히 포함되어 있는지 확인
    expect(html).toContain('prototype-viewport-desktop');
    expect(html).toContain('prototype-viewport-mobile');
    expect(html).toContain('prototype-code-toggle');
    expect(html).toContain('prototype-reload-btn');
    expect(html).toContain('prototype-fullscreen-btn');
    expect(html).toContain('prototype-external-btn');
    expect(html).toContain('prototype-delete-btn');

    // 마크다운 복원 시에도 무손실 보존
    const restored = htmlToMarkdown(html);
    expect(restored).toContain('button { background: #3b82f6;');
    expect(restored).toContain('```html:preview');
  });

  it('마크다운에 이미지가 있을 때 HTML 변환 후 다시 htmlToMarkdown 저장 시 assets/상대경로로 안전하게 복원된다', () => {
    const assets = {
      'sample image (1).png': 'blob:http://localhost:5173/abcdef-1234',
      'logo.png': 'blob:http://localhost:5173/logo-5678',
    };

    const inputMd = `### 스크린샷 안내\n\n![샘플 이미지](assets/sample%20image%20(1).png)\n\n![로고](assets/logo.png)`;

    // 1. Markdown -> HTML
    const html = markdownToHtml(inputMd, assets);
    expect(html).toContain('blob:http://localhost:5173/abcdef-1234');
    expect(html).toContain('blob:http://localhost:5173/logo-5678');

    // 2. HTML -> Markdown (저장 시점)
    const restoredMd = htmlToMarkdown(html, assets);
    expect(restoredMd).not.toContain('blob:');
    expect(restoredMd).toContain('assets/sample image (1).png');
    expect(restoredMd).toContain('assets/logo.png');
  });

  it('에디터에서 data-asset-name을 가진 img 태그 또는 alt 기반 img 태그도 htmlToMarkdown 시 assets/파일명으로 복원된다', () => {
    const assets = {
      'chart.png': 'blob:http://localhost:5173/chart-9999',
    };

    // 에디터가 새로 삽입한 이미지 태그 형태 (브라우저 DOM)
    const editorHtml = `<p><img src="blob:http://localhost:5173/chart-9999" data-asset-name="chart.png" alt="chart.png" class="rounded-xl" /></p>`;

    const restoredMd = htmlToMarkdown(editorHtml, assets);
    expect(restoredMd).not.toContain('blob:');
    expect(restoredMd).toContain('![chart.png](assets/chart.png)');
  });
});

