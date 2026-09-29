/**
 * @domain 에셋 관리 & 뷰어
 * @feature 마크다운 이미지 렌더링
 * @phase 연산
 * @target 마크다운 내 이미지 에셋 상대경로 치환 유틸
 * @trigger 마크다운 파싱 및 저장 시 호출
 * @desc 특수문자 안전 이스케이프 및 다양한 상대경로(assets/, ./assets/, ../assets/, 파일명 단독 등)를 실제 Blob/Data URL로 정밀 치환
 * @next src/components/doc/MarkdownViewer.tsx
 */

/**
 * 정규식 특수문자를 안전하게 이스케이프
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 마크다운 본문 내의 이미지 경로를 실제 assets 맵(Blob URL 또는 Data URL)으로 치환
 * 지원 패턴:
 * - assets/파일명, ./assets/파일명, ../assets/파일명
 * - URL 인코딩된 파일명 (예: assets/스크린샷%20(1).png)
 * - 단독 파일명 (예: 파일명.png)
 */
export function replaceAssetUrls(
  mdText: string,
  assets: Record<string, string> = {}
): string {
  if (!mdText) return '';
  const assetEntries = Object.entries(assets);
  if (assetEntries.length === 0) return mdText;

  let processed = mdText;

  for (const [filename, url] of assetEntries) {
    if (!filename || !url) continue;

    const rawEscaped = escapeRegExp(filename);
    const encodedEscaped = escapeRegExp(encodeURIComponent(filename));
    // Turndown이나 마크다운 파서가 괄호 앞에 백슬래시(\(, \))를 붙인 경우도 지원
    const backslashEscaped = escapeRegExp(filename.replace(/\(/g, '\\(').replace(/\)/g, '\\)'));

    // 1. assets/ 경로 패턴 매칭 (./assets/, ../assets/, assets/, /assets/ 및 <assets/...>)
    // 공백 및 괄호, 인코딩된 파일명, 백슬래시 이스케이프 파일명 모두 지원
    const pattern = `<?(?:\\.{1,2}\\/|\\/)?assets\\/(?:${rawEscaped}|${encodedEscaped}|${backslashEscaped})>?`;
    const assetsRegex = new RegExp(pattern, 'g');
    processed = processed.replace(assetsRegex, () => url);

    // 2. 마크다운 이미지 구문 ![alt](filename) 형태에서 assets/ 없이 단독 파일명으로 쓰인 경우 지원
    const standalonePattern = `(!\\[[^\\]]*\\]\\()\\s*<?(?:${rawEscaped}|${encodedEscaped}|${backslashEscaped})>?\\s*(\\))`;
    const standaloneRegex = new RegExp(standalonePattern, 'g');
    processed = processed.replace(standaloneRegex, (_, p1, p2) => `${p1}${url}${p2}`);

    // 3. HTML img 태그 src="filename" 형태에서 단독 파일명 지원
    const htmlImgPattern = `(<img[^>]+src=["'])(?:${rawEscaped}|${encodedEscaped}|${backslashEscaped})(["'][^>]*>)`;
    const htmlImgRegex = new RegExp(htmlImgPattern, 'gi');
    processed = processed.replace(htmlImgRegex, (_, p1, p2) => `${p1}${url}${p2}`);
  }

  return processed;
}

/**
 * HTML이나 마크다운 내의 Blob URL 또는 Data URL을 다시 content.md 저장용 상대경로(assets/파일명)로 복원
 */
export function restoreAssetUrls(
  text: string,
  assets: Record<string, string> = {}
): string {
  if (!text) return '';
  const assetEntries = Object.entries(assets);
  if (assetEntries.length === 0) return text;

  let processed = text;

  for (const [filename, url] of assetEntries) {
    if (!filename || !url) continue;
    // URL 그대로 또는 URL 인코딩된 형태를 assets/파일명으로 복원
    processed = processed.replaceAll(url, `assets/${filename}`);
  }

  return processed;
}
