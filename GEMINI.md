# Gemini & Antigravity Agent Guidelines

이 프로젝트의 상세 에이전트 지침은 [AGENTS.md](./AGENTS.md)에 정의되어 있습니다.

### 핵심 준수 사항
1. **한국어 작성 원칙**: 모든 계획서(`implementation_plan.md`), 보고서(`walkthrough.md`) 및 응답은 반드시 한국어로 작성합니다.
2. **Git Push 승인**: `git push` 명령어는 반드시 사용자의 명시적인 사전 허가를 받은 후에만 실행합니다.
3. **컴포넌트 중심 개발**: UI 표현과 상태/로직(Hook)을 분리하고, 컴포넌트 기반 설계를 준수합니다.
4. **기능 중심 응집도 & 300줄 권고**: 기계적 분리가 아닌, 2개 이상의 관심사가 혼재되어 300줄을 초과할 때 기능 단위 분리를 검토합니다. 단일 기능으로서 응집도가 높은 경우 300줄 초과 유지가 허용됩니다. (`// @cohesive-file`)
5. **3계층 구조 & 주석 의무화**: 코드 작성 시 파일 상단에 `@domain`, `@feature`, `@phase` (입력/판단/연산/API/저장소/출력), `@target`, `@trigger`, `@desc`, `@store` 주석을 작성하여 관리자 뷰(`http://localhost:5174/`)에 실시간 아키텍처가 동기화되도록 합니다. (`npm run lint:arch`로 자동 검증)
6. **계획서 파이프라인 표 작성 의무**: `implementation_plan.md` 작성 시 단순 파일 나열을 금지하고, 독립된 1개 기능(@feature) 단위로 `[입력 ⚡ ➡️ 판단 ⚖️ ➡️ 연산 ⚙️ ➡️ (API 🌐) ➡️ 저장소 💾 ➡️ 출력 🎨]`의 순서열 파이프라인 표를 작성합니다. (상세는 [docs/ARCHITECTURE_PIPELINE_GUIDE.md](./docs/ARCHITECTURE_PIPELINE_GUIDE.md) 참조)
7. **수동 검증 사용자 전담**: 실제 동작 및 디자인 체감 수동 검증은 사용자가 직접 수행합니다. 에이전트는 빌드, 린트 및 헤드리스 콘솔 에러 검증 등 기술적 무결성을 확인하고 사용자에게 검증을 인계합니다.
8. **전역 상태 라이브러리(Zustand 등) 선제 제안**: 복잡한 공유 상태나 심층 Props 드릴링이 필요한 기능 기획 시, 계획서(`implementation_plan.md`) 단계에서 가벼운 전역 상태 관리 라이브러리(예: `Zustand`)의 도입을 먼저 제안합니다.
9. **라우팅 표준화 (React Router)**: 멀티 페이지 필요 시 `src/pages/` 디렉토리에 페이지 컴포넌트를 분리하고, 라우트 진입점(`@phase 입력 (Trigger)`) 또는 페이지 뷰(`@phase 출력 (Render)`) 주석을 작성합니다.
10. **단위 테스트 (Vitest)**: 비즈니스 계산 및 상태 로직(연산/판단) 작성 시 `*.test.ts`를 작성하여 `npm run test:run`으로 사전 검증합니다.




