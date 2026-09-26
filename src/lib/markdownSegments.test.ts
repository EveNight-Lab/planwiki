import { describe, it, expect } from 'vitest';
import { splitMarkdownIntoSegments, joinSegmentsToMarkdown } from './markdownSegments';

describe('markdownSegments 단위 테스트', () => {
  it('인라인 블록이 없는 일반 마크다운은 단일 markdown 세그먼트를 반환한다', () => {
    const md = '### 제목\n\n일반 마크다운 본문입니다.';
    const segments = splitMarkdownIntoSegments(md);
    expect(segments.length).toBe(1);
    expect(segments[0].type).toBe('markdown');
    if (segments[0].type === 'markdown') {
      expect(segments[0].content).toBe(md);
    }
  });

  it('마크다운 본문 중간에 위치한 html:preview 블록을 순서대로 분할한다', () => {
    const md = `### 상단 설명
글이 시작됩니다.

\`\`\`html:preview
<div class="box">버튼</div>
\`\`\`

### 하단 설명
이어서 작성된 글입니다.`;

    const segments = splitMarkdownIntoSegments(md);
    expect(segments.length).toBe(3);

    expect(segments[0].type).toBe('markdown');
    if (segments[0].type === 'markdown') {
      expect(segments[0].content).toContain('상단 설명');
    }

    expect(segments[1].type).toBe('html_preview');
    if (segments[1].type === 'html_preview') {
      expect(segments[1].html).toBe('<div class="box">버튼</div>');
    }

    expect(segments[2].type).toBe('markdown');
    if (segments[2].type === 'markdown') {
      expect(segments[2].content).toContain('하단 설명');
    }
  });

  it('복수 개의 인라인 html 블록도 순서대로 분할한다', () => {
    const md = `
\`\`\`html:preview
<div>첫번째</div>
\`\`\`
중간 텍스트
\`\`\`html:sandbox
<div>두번째</div>
\`\`\`
끝 텍스트`;

    const segments = splitMarkdownIntoSegments(md);
    expect(segments.length).toBe(4);
    expect(segments[0].type).toBe('html_preview');
    expect(segments[1].type).toBe('markdown');
    expect(segments[2].type).toBe('html_preview');
    expect(segments[3].type).toBe('markdown');
  });

  it('분할된 세그먼트를 joinSegmentsToMarkdown으로 결합 시 원래 블록 형태로 온전히 보존된다', () => {
    const md = `### 상단 설명

\`\`\`html:preview
<div class="box">버튼</div>
\`\`\`

하단 설명`;

    const segments = splitMarkdownIntoSegments(md);
    const joined = joinSegmentsToMarkdown(segments);

    expect(joined).toContain('### 상단 설명');
    expect(joined).toContain('```html:preview\n<div class="box">버튼</div>\n```');
    expect(joined).toContain('하단 설명');
  });
});
