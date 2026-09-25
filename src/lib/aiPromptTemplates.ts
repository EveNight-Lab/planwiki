/**
 * @domain 외부 AI 연동
 * @feature AI 양식 프롬프트 클립보드 복사
 * @phase 연산 (Compute)
 * @target PlanWiki 양식 프롬프트 생성기
 * @desc 외부 AI(ChatGPT, Claude, Gemini)에게 요청할 기획서 작성 및 대화 정리용 표준 JSON 양식 지시문 조립
 * @next src/components/layout/Header.tsx
 */

/**
 * PlanWiki 표준 기획서 양식 지시문 템플릿
 */
export const PLANWIKI_AI_PROMPT_TEMPLATE = `당신은 시니어 IT 서비스 기획자이자 테크니컬 라이터입니다.
아래의 [요구사항/기획 대화 내용]을 분석하여, PlanWiki 기획 도구에서 즉시 임포트할 수 있는 구조화된 JSON 데이터로 작성해 주세요.

## 📌 출력 형식 규칙 (반드시 준수)
1. 결과물은 반드시 아래 예시와 동일한 단일 JSON 배열(\`[ { ... }, { ... } ]\`) 형식으로, 마크다운 코드블록(\`\`\`json ... \`\`\`) 안에 담아 출력하세요.
2. 불필요한 서론이나 인사말은 생략하고, JSON 코드블록만 깔끔하게 출력해 주세요.
3. 각 기획 단락(Node)은 다음 속성을 가집니다:
   - "title" (필수, 문자열): 단락 제목 (예: "01. 결제 모달 레이아웃 및 UX")
   - "description" (선택, 문자열): 한 줄 핵심 설명
   - "tags" (선택, 문자열 배열): 관련 태그 (예: ["결제", "모달", "UI/UX"])
   - "content" (필수, 마크다운 문자열): 기획서 본문 마크다운. (개요, 정책, 세부 요구사항, 표, 체크리스트 등 포함)
   - "children" (선택, 하위 노드 배열): 계층적 하위 세부 단락이 있는 경우 포함

4. 💡 [중요: 본문 내 인라인 대화형 HTML 프로토타입 작성]
   - 기획 본문("content") 중간에 인터랙티브 프로토타입 화면이 필요한 경우, 아래와 같이 \`\`\`html:preview 코드 블록으로 인라인 HTML을 삽입할 수 있습니다:
   \`\`\`html:preview
   <div style="padding: 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
     <h4>간편 결제 선택</h4>
     <button style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;" onclick="alert('결제창 호출')">카카오페이로 결제</button>
   </div>
   \`\`\`
   - 인라인 HTML 블록 아래에 이어서 추가 설명, 예외 처리 정책, 표 등을 계속해서 작성할 수 있습니다.

## 📋 JSON 스키마 예시
\`\`\`json
[
  {
    "title": "01. 서비스 개요 및 핵심 가치",
    "description": "핵심 목표와 타깃 사용자 정의",
    "tags": ["개요", "목표"],
    "content": "### 1. 프로젝트 배경\\n본 프로젝트는 사용자 경험을 극대화하기 위해 기획되었습니다.\\n\\n- **타깃 사용자**: 2030 직장인\\n- **핵심 목표**: 번거로운 절차 단축"
  },
  {
    "title": "02. 결제 플로우 인터랙션 명세",
    "description": "원클릭 결제 팝업 UI 및 시뮬레이터",
    "tags": ["결제", "UI", "프로토타입"],
    "content": "### 1. 결제 팝업 화면\\n사용자가 결제하기를 누르면 아래와 같은 팝업이 노출됩니다.\\n\\n\`\`\`html:preview\\n<div style=\\"padding: 20px; text-align: center; background: #f8fafc; border-radius: 8px;\\">\\n  <p style=\\"font-weight: bold;\\">총 결제금액: 29,000원</p>\\n  <button style=\\"background: #3b82f6; color: white; padding: 8px 16px; border: none; border-radius: 6px;\\" onclick=\\"alert('결제 완료')\\">승인 요청</button>\\n</div>\\n\`\`\`\\n\\n### 2. 결제 실패 시 예외 처리\\n- 한도 초과 시: 에러 코드 \`ERR_LIMIT_EXCEEDED\` 반환 및 잔액 확인 팝업 유도"
  }
]
\`\`\`

## 📝 기획서로 변환할 대상 내용:
[이곳에 지금까지 나눈 기획 대화 내용이나 새로 기획할 서비스 요구사항을 입력하세요]
`;

/**
 * 클립보드 API를 활용하여 양식 프롬프트를 복사하는 순수 함수
 */
export async function copyPlanWikiPromptToClipboard(customTopic?: string): Promise<boolean> {
  const prompt = customTopic
    ? PLANWIKI_AI_PROMPT_TEMPLATE.replace(
        '[이곳에 지금까지 나눈 기획 대화 내용이나 새로 기획할 서비스 요구사항을 입력하세요]',
        customTopic
      )
    : PLANWIKI_AI_PROMPT_TEMPLATE;

  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(prompt);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard via Clipboard API:', err);
    }
  }

  // Fallback for older browsers or non-secure contexts
  try {
    const textarea = document.createElement('textarea');
    textarea.value = prompt;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (fallbackErr) {
    console.error('Fallback clipboard copy failed:', fallbackErr);
    return false;
  }
}
