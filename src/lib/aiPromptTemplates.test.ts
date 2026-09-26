import { describe, it, expect } from 'vitest';
import { PLANWIKI_AI_PROMPT_TEMPLATE } from './aiPromptTemplates';

describe('aiPromptTemplates 단위 테스트', () => {
  it('프롬프트 템플릿에 HTML 프리뷰 요청이 완전히 제거되어 있어야 한다', () => {
    expect(PLANWIKI_AI_PROMPT_TEMPLATE).not.toContain('html:preview');
    expect(PLANWIKI_AI_PROMPT_TEMPLATE).not.toContain('인라인 대화형 HTML 프로토타입');
  });

  it('프롬프트 템플릿에 세부 단락(children) 계층 생성 유도 지침이 포함되어 있어야 한다', () => {
    expect(PLANWIKI_AI_PROMPT_TEMPLATE).toContain('children');
    expect(PLANWIKI_AI_PROMPT_TEMPLATE).toContain('세부 단락(children) 적극 분기');
    expect(PLANWIKI_AI_PROMPT_TEMPLATE).toContain('01-1. 사용자 페르소나 및 요구 분석');
  });

  it('프롬프트 템플릿에 모바일 최적화 세로형 표 작성 지침이 포함되어 있어야 한다', () => {
    expect(PLANWIKI_AI_PROMPT_TEMPLATE).toContain('모바일 최적화 세로형(행 중심) 표');
    expect(PLANWIKI_AI_PROMPT_TEMPLATE).toContain('열(컬럼)은 2~3개 이내');
  });
});
