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
   - "content" (필수, 마크다운 문자열): 기획서 본문 마크다운 (개요, 정책, 세부 요구사항, 표, 체크리스트 등 포함)
   - "children" (권장, 하위 노드 배열): 계층적 하위 세부 단락 배열

4. 🌳 [핵심: 세부 단락(children) 적극 분기 - 계층적 WBS 구조화]
   - 기획 내용을 단층 목록으로 나열하지 말고, **대주제 단락 아래에 반드시 2~4개의 세부 단락(\`children\` 배열)을 적극적으로 생성**하여 체계적인 기획서 트리를 구성하세요.
   - 예시: "01. 회원 및 인증 시스템" (대단락) ➡️ children: [ "01-1. 소셜 로그인 연동 규격", "01-2. JWT 세션 만료 및 재발급 정책", "01-3. 회원 탈퇴 및 개인정보 처리" ]

5. 📱 [핵심: 모바일 최적화 세로형(행 중심) 표 작성 원칙]
   - 기획서 열람은 모바일 세로 화면 환경을 우선 고려해야 합니다.
   - 따라서 가로로 긴 표(열이 4개 이상인 넓은 표)는 글자가 찌그러지므로 **절대 지양**하세요.
   - **열(컬럼)은 2~3개 이내(예: \`구분 | 정책 및 명세\` 또는 \`항목 | 설정값 | 비고\`)로 컴팩트하게 제한**하세요.
   - 내용 분량이 많거나 상세한 정책은 가로 칸을 늘리지 말고 **행(Row)을 아래로 늘려 세로로 길게 기술**하세요.

6. 📝 [순수 마크다운 표준 유지]
   - 본문("content")은 순수 마크다운(소제목 \`###\`, 불릿 리스트, 체크리스트 \`- [ ]\`, 세로형 표, 볼드체 등)으로만 작성하세요. (별도의 HTML 태그나 코드블록 프리뷰는 일체 삽입하지 않습니다.)

## 📋 JSON 스키마 예시
\`\`\`json
[
  {
    "title": "01. 서비스 개요 및 타깃 정의",
    "description": "핵심 목표와 사용자 페르소나 정의",
    "tags": ["개요", "목표"],
    "content": "### 1. 프로젝트 배경\\n본 프로젝트는 모바일 사용자 경험을 극대화하기 위해 기획되었습니다.\\n\\n- **핵심 가치**: 복잡한 절차 단축 및 실시간 피드백\\n- **주요 대상**: 2030 직장인 및 모바일 실무자",
    "children": [
      {
        "title": "01-1. 사용자 페르소나 및 요구 분석",
        "description": "주요 타깃 세그먼트별 니즈 정리",
        "tags": ["페르소나", "요구사항"],
        "content": "### 페르소나 정의\\n\\n| 구분 | 상세 명세 |\\n| :--- | :--- |\\n| 직군 | 3~5년차 기획자 및 개발자 |\\n| 주요 불편점 | 좁은 모바일 화면에서 표가 잘려 읽기 어려움 |\\n| 요구사항 | 세로로 긴 표와 온전한 단락 제목 노출 |"
      }
    ]
  },
  {
    "title": "02. 결제 및 주문 시스템",
    "description": "원클릭 결제 플로우 및 예외 처리 정책",
    "tags": ["결제", "주문", "정책"],
    "content": "### 1. 결제 프로세스 개요\\n장바구니에서 주문서 작성 및 최종 결제 승인까지의 라이프사이클을 정의합니다.",
    "children": [
      {
        "title": "02-1. 결제 수단별 세부 정책",
        "description": "간편결제 및 일반 결제 수단 명세",
        "tags": ["결제수단", "PG"],
        "content": "### 결제 수단별 처리 기준 (모바일 세로형 표)\\n\\n| 결제 수단 | 운영 정책 및 수수료 |\\n| :--- | :--- |\\n| 신용카드 | 국내 전 카드사 지원, 5만원 이상 무이자 할부 |\\n| 카카오페이 | 앱 투 앱 즉시 결제 연동, 결제 취소 시 즉시 환불 |\\n| 네이버페이 | 네이버 포인트 복합 결제 허용 |\\n| 계좌이체 | 오픈뱅킹 실시간 계좌이체 (00:00~00:30 점검 제외) |"
      },
      {
        "title": "02-2. 결제 실패 시 예외 처리 기준",
        "description": "에러 코드별 사용자 대응 시나리오",
        "tags": ["예외처리", "에러코드"],
        "content": "### 예외 상황 대응표\\n\\n| 에러 상황 | 처리 기준 및 UI 안내 |\\n| :--- | :--- |\\n| 한도 초과 | 잔액 및 한도 확인 안내 모달 노출 |\\n| 통신 지연 | 최대 3회 자동 재시도 후 고객센터 연결 가이드 |\\n| 사용자 취소 | 주문서 작성 이전 화면으로 안전 복귀 |\\n\\n### 체크리스트\\n- [ ] 취소 시 재고 자동 복구 로직 검증\\n- [ ] 영수증 문자/알림톡 발송 큐 등록"
      }
    ]
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
