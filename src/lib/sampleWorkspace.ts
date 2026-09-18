// @cohesive-file
/**
 * @domain 기획 문서 작업
 * @feature 목차 탐색 & 접이식 본문
 * @phase 저장소
 * @store 기본 메모리 (SAMPLE_WORKSPACE)
 * @desc 폴더를 열기 전에도 기능을 바로 테스트해볼 수 있는 기본 기획서 샘플
 * @next src/components/doc/AccordionSection.tsx
 */
import type { DocNode } from '../types/workspace';

export const SAMPLE_WORKSPACE: DocNode = {
  id: '결제시스템-기획',
  name: '결제시스템-기획',
  path: '',
  meta: {
    title: '결제 시스템 구축 기획서',
    order: 0,
    tags: ['Core', 'Finance', 'v1.0'],
    description: '웹 서비스 결제 연동 및 정산 자동화를 위한 단일 문서형 개발 기획서',
  },
  content: `# 🛒 결제 시스템 구축 기획서

> **문서 상태**: \`기획 확정 (Draft Ready)\` | **작성일**: 2026-09-17 | **작성자**: PlanWiki Team

## 1. 프로젝트 목표 및 개요
본 문서는 커머스 플랫폼의 신규 결제 시스템 구축을 위한 개발 기획서입니다.
국내 PG사 연동 규격을 모듈화하고, 정산 수수료 로직의 정확한 검증과 빠른 런칭을 목표로 합니다.

### 핵심 요구사항 매트릭스
| 구분 | 기능 명세 | 우선순위 | 검증 상태 |
| :--- | :--- | :---: | :---: |
| **PG 연동** | 토스페이먼츠 결제위젯 단일 연동 | P0 | ✅ 프로토타입 완료 |
| **정산 로직** | 결제 수수료 및 부가세 자동 계산 공식 | P0 | ✅ 시뮬레이터 검증 |
| **예외 처리** | 네트워크 타임아웃 시 망취소(Net-Cancel) | P1 | 📝 기획 진행 중 |
| **대사 관리** | 일일 PG 정산 내역 배치 비교 | P2 | ⏳ 차기 스펙 |

---

### 시스템 데이터 흐름도
\`\`\`
[고객 클라이언트] ──(1. 결제요청)──> [토스페이먼츠 위젯] ──(2. 인증완료)──> [사내 결제 API]
                                                                        │
                                                                 (3. 정산 DB 저장)
                                                                        ▼
                                                                [정산 수수료 산출 엔진]
\`\`\`

아래 목차에서 각 단계별 세부 규격과 **실제 작동하는 HTML 프로토타입**을 바로 확인할 수 있습니다.
`,
  assets: {},
  children: [
    {
      id: '01_PG사-연동-규격',
      name: '01_PG사-연동-규격',
      path: '01_PG사-연동-규격',
      meta: {
        title: 'PG사 연동 규격 및 보안 정책',
        order: 1,
        tags: ['Security', 'API'],
      },
      content: `# PG사 연동 규격 및 보안 정책

## 기본 통신 원칙
1. **멱등성(Idempotency) 보장**: 모든 결제 승인 요청은 고유한 \`idempotency_key\` (UUIDv4)를 헤더에 포함합니다.
2. **시크릿 키 관리**: 결제 클라이언트 키는 프론트엔드에 노출 가능하나, 시크릿 키는 반드시 백엔드 환경 변수로 격리합니다.
3. **웹훅(Webhook) 서명 검증**: PG사로부터 수신되는 결제 완료 웹훅은 HMAC-SHA256 서명을 검증한 후 상태를 갱신합니다.

### 연동 파라미터 표준 규격
| 필드명 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :---: | :--- |
| \`orderId\` | String (64) | 필수 | 사내 주문 고유 식별자 |
| \`amount\` | Number | 필수 | 결제 최종 승인 금액 (원 단위) |
| \`orderName\` | String (100) | 필수 | 결제창에 표기될 대표 상품명 |
| \`customerEmail\`| String (50) | 선택 | 결제 완료 영수증 발송용 이메일 |
`,
      assets: {},
      children: [
        {
          id: '01_PG사-연동-규격/01_토스페이먼츠',
          name: '01_토스페이먼츠',
          path: '01_PG사-연동-규격/01_토스페이먼츠',
          meta: {
            title: '토스페이먼츠 위젯 연동 & 인터랙션 검증',
            order: 1,
            tags: ['UI/UX', 'Prototype'],
          },
          content: `# 토스페이먼츠 위젯 연동 & 인터랙션 검증

## 1. 사용자 경험(UX) 흐름
1. 결제 수단 선택 (신용카드, 토스페이, 네이버페이, 카카오페이, 가상계좌)
2. 결제 동의 체크박스 (전체 동의 클릭 시 필수 약관 일괄 체크)
3. \`결제하기\` 버튼 클릭 시 모달 팝업 및 가상 승인 이벤트 트리거

## 2. 인터랙션 검증용 프로토타입
아래 임베드된 샌드박스는 기획 검증을 위해 작성된 **단일 HTML 프로토타입**입니다.
상단 \`</>\` 버튼을 눌러 소스코드를 직접 수정하거나 콘솔 로그를 확인할 수 있습니다.
`,
          previewHtml: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>토스페이먼츠 위젯 시뮬레이터</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #f8fafc; padding: 20px; color: #1e293b; }
    .widget-card { max-width: 420px; margin: 0 auto; background: white; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .title { font-size: 18px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .badge { font-size: 11px; background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 20px; font-weight: 600; }
    .price-box { background: #f1f5f9; border-radius: 12px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .price-val { font-size: 20px; font-weight: 800; color: #0f172a; }
    .methods-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
    .method-btn { border: 2px solid #e2e8f0; border-radius: 10px; padding: 12px; font-size: 13px; font-weight: 600; cursor: pointer; background: white; text-align: center; transition: all 0.2s; }
    .method-btn:hover { border-color: #94a3b8; }
    .method-btn.active { border-color: #3182f6; background: #eff6ff; color: #1d4ed8; }
    .agreement { font-size: 12px; color: #64748b; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
    .agreement input { cursor: pointer; width: 16px; height: 16px; }
    .pay-btn { width: 100%; background: #3182f6; color: white; border: none; border-radius: 12px; padding: 14px; font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.2s; box-shadow: 0 4px 12px rgba(49, 130, 246, 0.3); }
    .pay-btn:hover { background: #1b64da; }
    .pay-btn:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; }
    .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; }
    .modal-content { background: white; border-radius: 16px; padding: 24px; text-align: center; max-width: 300px; animation: pop 0.2s ease-out; }
    @keyframes pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  </style>
</head>
<body>
  <div class="widget-card">
    <div class="title">
      <span>결제 수단</span>
      <span class="badge">테스트 모드</span>
    </div>
    <div class="price-box">
      <span style="font-size: 13px; color: #64748b;">주문 금액</span>
      <span class="price-val">49,900 원</span>
    </div>

    <div class="methods-grid" id="methodGrid">
      <button class="method-btn active" onclick="selectMethod(this, '카드결제')">💳 신용·체크카드</button>
      <button class="method-btn" onclick="selectMethod(this, '토스페이')">🔵 토스페이</button>
      <button class="method-btn" onclick="selectMethod(this, '네이버페이')">🟢 네이버페이</button>
      <button class="method-btn" onclick="selectMethod(this, '카카오페이')">🟡 카카오페이</button>
    </div>

    <label class="agreement">
      <input type="checkbox" id="agreeChk" onchange="togglePayBtn()" checked>
      <span>결제 진행 필수 약관에 모두 동의합니다.</span>
    </label>

    <button class="pay-btn" id="payBtn" onclick="requestPayment()">49,900원 결제하기</button>
  </div>

  <div class="modal" id="successModal">
    <div class="modal-content">
      <div style="font-size: 40px; margin-bottom: 10px;">🎉</div>
      <h3 style="font-size: 16px; margin-bottom: 8px;">결제 승인 완료!</h3>
      <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;" id="modalDesc">신용카드로 결제되었습니다.</p>
      <button onclick="closeModal()" style="background: #3182f6; color: white; border: none; padding: 8px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;">확인</button>
    </div>
  </div>

  <script>
    let currentMethod = '카드결제';

    function selectMethod(btn, method) {
      document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMethod = method;
      console.log('[TossWidget] 결제 수단 변경됨:', method);
    }

    function togglePayBtn() {
      const chk = document.getElementById('agreeChk').checked;
      document.getElementById('payBtn').disabled = !chk;
    }

    function requestPayment() {
      console.log('[TossWidget] 결제 요청 시작 -> 수단:', currentMethod, '금액: 49,900원');
      const modal = document.getElementById('successModal');
      document.getElementById('modalDesc').innerText = currentMethod + '(으)로 49,900원이 정상 승인되었습니다.';
      modal.style.display = 'flex';
    }

    function closeModal() {
      document.getElementById('successModal').style.display = 'none';
      console.log('[TossWidget] 결제 모달 닫힘');
    }
  </script>
</body>
</html>`,
          assets: {},
          children: [],
        },
      ],
    },
    {
      id: '02_정산-계산-로직',
      name: '02_정산-계산-로직',
      path: '02_정산-계산-로직',
      meta: {
        title: '정산 및 수수료 계산 공식',
        order: 2,
        tags: ['Math', 'Logic'],
      },
      content: `# 정산 및 수수료 계산 공식

## 수수료 정산 산출 기준
- **PG 결제 수수료**: 결제금액의 \`3.3%\` (VAT 포함)
- **플랫폼 중개 수수료**: 판매금액의 \`5.0%\`
- **정산 대상 공급가액**: \`판매금액 - (PG수수료 + 플랫폼수수료)\`

### 수수료 공제 시나리오 예시
| 결제금액 | PG 수수료 (3.3%) | 플랫폼 수수료 (5.0%) | 최종 정산 지급액 |
| :---: | :---: | :---: | :---: |
| 10,000원 | 330원 | 500원 | **9,170원** |
| 50,000원 | 1,650원 | 2,500원 | **45,850원** |
| 100,000원 | 3,300원 | 5,000원 | **91,700원** |

아래의 인터랙티브 계산기 샌드박스를 통해 임의 금액의 수수료와 정산금을 실시간으로 시뮬레이션할 수 있습니다.
`,
      previewHtml: `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>정산 계산기 샌드박스</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, sans-serif; }
    body { background: #0f172a; color: #f8fafc; padding: 24px; }
    .card { max-width: 480px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 24px; border: 1px solid #334155; }
    h2 { font-size: 18px; margin-bottom: 16px; color: #38bdf8; }
    .input-group { margin-bottom: 20px; }
    label { display: block; font-size: 13px; color: #94a3b8; margin-bottom: 8px; }
    input[type="number"] { width: 100%; background: #0f172a; border: 1px solid #475569; border-radius: 8px; padding: 12px; color: white; font-size: 18px; font-weight: 700; outline: none; }
    input[type="number"]:focus { border-color: #38bdf8; }
    .result-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #334155; font-size: 14px; }
    .result-row.total { border-bottom: none; margin-top: 10px; font-size: 18px; font-weight: 800; color: #4ade80; }
    .bar-wrap { height: 10px; background: #334155; border-radius: 6px; overflow: hidden; display: flex; margin-top: 16px; }
    .bar-pg { background: #f87171; }
    .bar-platform { background: #fbbf24; }
    .bar-payout { background: #4ade80; }
  </style>
</head>
<body>
  <div class="card">
    <h2>📊 정산 및 수수료 실시간 시뮬레이터</h2>
    <div class="input-group">
      <label>결제 판매 금액 (원)</label>
      <input type="number" id="amountInput" value="50000" step="1000" oninput="calculate()">
    </div>
    
    <div class="result-row">
      <span style="color:#f87171;">● PG 수수료 (3.3%)</span>
      <span id="pgFeeText">- 1,650 원</span>
    </div>
    <div class="result-row">
      <span style="color:#fbbf24;">● 플랫폼 수수료 (5.0%)</span>
      <span id="platformFeeText">- 2,500 원</span>
    </div>
    <div class="result-row total">
      <span>최종 정산 입금액</span>
      <span id="payoutText">45,850 원</span>
    </div>

    <div class="bar-wrap">
      <div id="barPg" class="bar-pg" style="width: 3.3%;"></div>
      <div id="barPlatform" class="bar-platform" style="width: 5%;"></div>
      <div id="barPayout" class="bar-payout" style="width: 91.7%;"></div>
    </div>
  </div>

  <script>
    function calculate() {
      const amount = Math.max(0, Number(document.getElementById('amountInput').value) || 0);
      const pgFee = Math.round(amount * 0.033);
      const platformFee = Math.round(amount * 0.05);
      const payout = amount - pgFee - platformFee;

      document.getElementById('pgFeeText').innerText = '- ' + pgFee.toLocaleString() + ' 원';
      document.getElementById('platformFeeText').innerText = '- ' + platformFee.toLocaleString() + ' 원';
      document.getElementById('payoutText').innerText = payout.toLocaleString() + ' 원';

      console.log('[Calculator] 계산 완료 -> 원금:', amount, '정산금:', payout);
    }
  </script>
</body>
</html>`,
      assets: {},
      children: [],
    },
    {
      id: '03_예외-및-환불-처리',
      name: '03_예외-및-환불-처리',
      path: '03_예외-및-환불-처리',
      meta: {
        title: '예외 및 환불 처리 시나리오',
        order: 3,
        tags: ['EdgeCase', 'Refund'],
      },
      content: `# 예외 및 환불 처리 시나리오

## 1. 망취소(Net-Cancel) 발생 시 대응
- **상황**: 고객 승인은 PG사에서 완료되었으나 네트워크 단절로 우리 서버가 결과를 받지 못한 경우
- **대응 정책**: PG사의 자동 망취소 프로토콜을 트리거하여 결제를 즉시 무효화하고 고객에게 재시도 안내 노출

## 2. 환불 상태 전이 체크리스트
- [x] 전액 취소 요청 시 PG 즉시 취소 API 호출
- [x] 부분 취소 요청 시 누적 취소 금액 검증 (총 결제액 초과 방지)
- [ ] 가상계좌 환불 시 고객 환불 계좌 실명 조회 인증
- [ ] 휴대폰 결제 당월 결제 취소 건 자동 상계
`,
      assets: {},
      children: [],
    },
  ],
};
