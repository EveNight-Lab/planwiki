/**
 * @domain 에셋 관리 & 뷰어
 * @feature 마크다운 이미지 렌더링
 * @phase 연산
 * @target assetHelper 단위 테스트
 * @trigger test:run 실행 시
 * @desc 특수문자, 괄호, 공백이 포함된 파일명 및 상대경로의 안전 치환 검증
 */
import { describe, it, expect } from 'vitest';
import { replaceAssetUrls, restoreAssetUrls, escapeRegExp } from './assetHelper';

describe('assetHelper', () => {
  it('정규식 특수문자를 올바르게 이스케이프한다', () => {
    expect(escapeRegExp('image (1)+[test].png')).toBe('image \\(1\\)\\+\\[test\\]\\.png');
  });

  it('괄호 및 공백이 들어간 파일명도 안전하게 치환한다', () => {
    const assets = {
      '스크린샷 (1).png': 'blob:http://localhost/uuid-1',
      'my image+test.png': 'blob:http://localhost/uuid-2',
    };

    const md = '![이미지](assets/스크린샷 (1).png) 및 ![이미지](./assets/my image+test.png)';
    const result = replaceAssetUrls(md, assets);

    expect(result).toBe('![이미지](blob:http://localhost/uuid-1) 및 ![이미지](blob:http://localhost/uuid-2)');
  });

  it('다양한 상대경로(./assets/, ../assets/, assets/)를 모두 Blob URL로 치환한다', () => {
    const assets = {
      'diagram.png': 'blob:http://localhost/diagram-blob',
    };

    const md1 = '![차트](./assets/diagram.png)';
    const md2 = '![차트](../assets/diagram.png)';
    const md3 = '![차트](assets/diagram.png)';

    expect(replaceAssetUrls(md1, assets)).toBe('![차트](blob:http://localhost/diagram-blob)');
    expect(replaceAssetUrls(md2, assets)).toBe('![차트](blob:http://localhost/diagram-blob)');
    expect(replaceAssetUrls(md3, assets)).toBe('![차트](blob:http://localhost/diagram-blob)');
  });

  it('assets/ 없이 단독 파일명으로 작성된 이미지도 매칭하여 치환한다', () => {
    const assets = {
      'hero.png': 'blob:http://localhost/hero-blob',
    };

    const md = '![메인](hero.png) 또는 <img src="hero.png" />';
    const result = replaceAssetUrls(md, assets);

    expect(result).toContain('![메인](blob:http://localhost/hero-blob)');
    expect(result).toContain('<img src="blob:http://localhost/hero-blob" />');
  });

  it('restoreAssetUrls는 Blob URL을 다시 assets/파일명 상대경로로 복원한다', () => {
    const assets = {
      '스크린샷 (1).png': 'blob:http://localhost/uuid-1',
    };

    const html = '<img src="blob:http://localhost/uuid-1" alt="test" />';
    const restored = restoreAssetUrls(html, assets);

    expect(restored).toBe('<img src="assets/스크린샷 (1).png" alt="test" />');
  });
});
