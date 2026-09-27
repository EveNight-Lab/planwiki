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
});
