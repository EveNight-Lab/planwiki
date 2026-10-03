import { describe, it, expect } from 'vitest';
import { sanitizeMarkdownHtml } from './sanitizeHelper';

describe('sanitizeMarkdownHtml', () => {
  it('일반 마크다운에 유입된 <style> 태그를 안전하게 무력화한다', () => {
    const dangerousHtml = `
      <div>
        <p>기획 설명 텍스트</p>
        <style>
          html, body {
            overflow: hidden;
            touch-action: none;
          }
          * { touch-action: none; }
        </style>
        <p>다음 텍스트</p>
      </div>
    `;

    const result = sanitizeMarkdownHtml(dangerousHtml);
    expect(result).not.toContain('<style>');
    expect(result).not.toContain('touch-action: none');
    expect(result).toContain('PlanCraft 격리 보호');
  });

  it('일반 마크다운에 유입된 <script> 태그를 무력화한다', () => {
    const dangerousHtml = `<p>테스트</p><script>alert('hack');</script>`;
    const result = sanitizeMarkdownHtml(dangerousHtml);
    expect(result).not.toContain('<script>');
    expect(result).toContain('PlanCraft 격리 보호');
  });

  it('인라인 스타일에서 position: fixed와 touch-action: none을 안전하게 완화한다', () => {
    const dangerousHtml = `<div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; touch-action: none; background: rgba(0,0,0,0.5);">모달 오버레이</div>`;
    const result = sanitizeMarkdownHtml(dangerousHtml);
    expect(result).not.toContain('position: fixed');
    expect(result).not.toContain('touch-action: none');
    expect(result).toContain('position: relative;');
  });

  it('인라인 이벤트 핸들러를 제거한다', () => {
    const dangerousHtml = `<div ontouchstart="event.preventDefault()" onclick="console.log(1)">클릭</div>`;
    const result = sanitizeMarkdownHtml(dangerousHtml);
    expect(result).not.toContain('ontouchstart');
    expect(result).not.toContain('onclick');
  });
});
