/**
 * @domain 기획 문서 작업
 * @feature 단락 본문 내 인라인 HTML 샌드박스
 * @phase 연산 (Compute)
 * @target 마크다운과 인라인 HTML 코드 블록 세그먼트 분할기
 * @desc 본문 마크다운에서 ```html:preview ... ``` 블록과 일반 텍스트를 순서대로 분리 가공
 * @next src/components/doc/MarkdownViewer.tsx
 */

export interface MarkdownTextSegment {
  type: 'markdown';
  content: string;
}

export interface InlineHtmlSegment {
  type: 'html_preview';
  html: string;
  rawCode: string;
}

export type ContentSegment = MarkdownTextSegment | InlineHtmlSegment;

/**
 * 인라인 HTML 샌드박스 코드 블록 정규식
 * 지원 문법: ```html:preview, ```html:interactive, ```html:sandbox
 */
const INLINE_SANDBOX_REGEX = /```(?:html:preview|html:interactive|html:sandbox)\s*([\s\S]*?)```/gi;

/**
 * 마크다운 본문을 일반 텍스트 세그먼트와 인라인 HTML 샌드박스 세그먼트로 순서대로 분할
 */
export function splitMarkdownIntoSegments(markdown: string): ContentSegment[] {
  if (!markdown) return [];

  const segments: ContentSegment[] = [];
  let lastIndex = 0;

  // Reset regex state
  INLINE_SANDBOX_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = INLINE_SANDBOX_REGEX.exec(markdown)) !== null) {
    const matchStart = match.index;
    const matchEnd = INLINE_SANDBOX_REGEX.lastIndex;

    // 1. 코드 블록 이전의 일반 마크다운 텍스트
    if (matchStart > lastIndex) {
      const textBefore = markdown.slice(lastIndex, matchStart);
      if (textBefore.trim()) {
        segments.push({
          type: 'markdown',
          content: textBefore,
        });
      }
    }

    // 2. 인라인 HTML 샌드박스 블록
    const htmlCode = match[1] ? match[1].trim() : '';
    segments.push({
      type: 'html_preview',
      html: htmlCode,
      rawCode: match[0],
    });

    lastIndex = matchEnd;
  }

  // 3. 마지막 코드 블록 이후의 나머지 마크다운 텍스트
  if (lastIndex < markdown.length) {
    const textAfter = markdown.slice(lastIndex);
    if (textAfter.trim()) {
      segments.push({
        type: 'markdown',
        content: textAfter,
      });
    }
  }

  // 인라인 블록이 하나도 없는 경우 원본 텍스트 1개 반환
  if (segments.length === 0 && markdown.trim()) {
    return [{ type: 'markdown', content: markdown }];
  }

  return segments;
}

/**
 * 기본 인라인 HTML 프로토타입 삽입용 템플릿
 */
export const DEFAULT_INLINE_HTML_TEMPLATE = `
\`\`\`html:preview
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; padding: 16px; background: #f8fafc; margin: 0; }
    .card { background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
    button { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; }
    button:hover { background: #2563eb; }
  </style>
</head>
<body>
  <div class="card">
    <p style="margin: 0 0 12px; font-weight: bold; color: #1e293b;">인라인 프로토타입</p>
    <button onclick="alert('인라인 샌드박스 동작 확인!')">테스트 버튼</button>
  </div>
</body>
</html>
\`\`\`
`;
