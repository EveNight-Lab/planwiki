import { describe, it, expect } from 'vitest';
import { extractJsonFromText, parseAiPlanToNodes } from './aiPlanParser';

describe('aiPlanParser 단위 테스트', () => {
  it('마크다운 코드블록(```json) 내의 JSON을 정확하게 추출한다', () => {
    const raw = '여기 기획서 결과입니다.\n```json\n[{"title":"테스트 항목"}]\n```\n이상입니다.';
    const extracted = extractJsonFromText(raw);
    expect(extracted).toBe('[{"title":"테스트 항목"}]');
  });

  it('코드블록 없이 텍스트 중간에 위치한 JSON 배열을 추출한다', () => {
    const raw = '앞부분 설명 [{"title":"A"}] 뒷부분 설명';
    const extracted = extractJsonFromText(raw);
    expect(extracted).toBe('[{"title":"A"}]');
  });

  it('빈 문자열이 입력되면 실패 결과를 반환한다', () => {
    const result = parseAiPlanToNodes('');
    expect(result.success).toBe(false);
    expect(result.error).toContain('입력된 내용이 없습니다');
  });

  it('올바른 JSON 배열을 DocNode 목록으로 완벽하게 파싱한다', () => {
    const sample = JSON.stringify([
      {
        title: '01. 로그인 UI',
        description: '소셜 로그인 화면',
        tags: ['인증', 'UI'],
        content: '### 로그인 정책\n- 카카오 및 구글 지원',
        children: [
          {
            title: '01-1. 카카오 연동 세부',
            content: 'REST API 키 설정',
          },
        ],
      },
    ]);

    const result = parseAiPlanToNodes(sample, 1);
    expect(result.success).toBe(true);
    expect(result.nodes.length).toBe(1);
    expect(result.totalNodeCount).toBe(2);

    const root = result.nodes[0];
    expect(root.meta.title).toBe('01. 로그인 UI');
    expect(root.meta.order).toBe(1);
    expect(root.meta.tags).toEqual(['인증', 'UI']);
    expect(root.content).toContain('카카오 및 구글 지원');
    expect(root.children.length).toBe(1);
    expect(root.children[0].meta.title).toBe('01-1. 카카오 연동 세부');
  });

  it('단일 객체 형태도 배열로 감싸서 성공적으로 파싱한다', () => {
    const single = JSON.stringify({
      title: '단일 기획 항목',
      content: '본문 내용',
    });

    const result = parseAiPlanToNodes(single, 3);
    expect(result.success).toBe(true);
    expect(result.nodes.length).toBe(1);
    expect(result.nodes[0].meta.order).toBe(3);
    expect(result.nodes[0].meta.title).toBe('단일 기획 항목');
  });

  it('문법이 잘못된 JSON 입력 시 친절한 오류를 반환한다', () => {
    const broken = '```json\n[{"title": "미완성"\n```';
    const result = parseAiPlanToNodes(broken);
    expect(result.success).toBe(false);
    expect(result.error).toContain('JSON 문법 오류');
  });
});
