/**
 * @domain 기획 문서 작업
 * @feature 프로토타입 문법 이중 격리
 * @phase 연산 (Compute)
 * @target 마크다운 HTML 살균 및 전역 스타일 격리기
 * @desc 일반 마크다운 영역에 유입된 <style> 태그, 전역 touch-action/overflow 오염, 화면 전체를 덮는 fixed 요소를 정제
 * @next src/components/doc/MarkdownViewer.tsx
 */

/**
 * 일반 마크다운 본문에 유출된 잠재적 위험 요소(전역 스타일, 터치 차단, 화면 덮개)를 살균 정제
 */
export function sanitizeMarkdownHtml(rawHtml: string): string {
  if (!rawHtml) return '';

  let sanitized = rawHtml;

  // 1. <style> 태그 전역 오염 원천 차단
  // 프로토타입 외 일반 마크다운에 <style>이 들어오면 메인 웹앱의 html, body, * 등에 치명적 영향을 줌
  sanitized = sanitized.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, () => {
    return `<!-- [PlanCraft 격리 보호: 외부 유출된 스타일 태그가 무력화되었습니다] -->`;
  });

  // 2. <script> 태그 원천 차단
  sanitized = sanitized.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, () => {
    return `<!-- [PlanCraft 격리 보호: 외부 유출된 스크립트 태그가 무력화되었습니다] -->`;
  });

  // 3. 인라인 스타일에서 화면 전체를 가리거나 터치를 차단하는 위험 속성 무력화
  // 예: position: fixed; inset: 0; touch-action: none; overflow: hidden;
  sanitized = sanitized.replace(/style\s*=\s*(["'])([\s\S]*?)\1/gi, (_, quote, styleContent) => {
    let cleanStyle = styleContent;

    // touch-action: none 차단
    cleanStyle = cleanStyle.replace(/touch-action\s*:\s*none\s*;?/gi, '');

    // position: fixed가 포함되어 있는 경우 메인 뷰포트를 가리는 것을 방지하기 위해 relative로 안전 치환
    if (/position\s*:\s*fixed/i.test(cleanStyle)) {
      cleanStyle = cleanStyle.replace(/position\s*:\s*fixed\s*;?/gi, 'position: relative;');
    }

    return `style=${quote}${cleanStyle.trim()}${quote}`;
  });

  // 4. 인라인 이벤트 핸들러(ontouchstart, ontouchmove, onclick 등 전역 차단 우회 스크립트) 일체 제거
  sanitized = sanitized.replace(/\s+on[a-z]+\s*=\s*(["'])[\s\S]*?\1/gi, '');

  return sanitized;
}
