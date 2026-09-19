<div align="center">

# 📚 PlanWiki (플랜위키)
**로컬 파일 시스템 기반의 구조화된 기획 워크스페이스 & AI 개발 핸드오프 도구**

<br />

```
   ┌──────────────────────────────────────────────────────────┐
   │  [P 루프 = 좌측 기둥 축 + 1.0 직각 단락 프레임]         │
   │  ├── 1.0 프로젝트 개요 (기획 명세서)                     │
   │  │   ├── 1.1 핵심 목표 및 기대 효과                      │
   │  │   └── 1.2 세부 요구사항 매트릭스 (WBS 분기선)         │
   │  └── 2.0 라이브 프로토타입 (인라인 HTML/JS 샌드박스)     │
   │                                                          │
   │  [Local-First] ⚡ [AI Agent Handoff] ⚡ [Prerender SSG]  │
   └──────────────────────────────────────────────────────────┘
```

<p align="center">
  <img src="public/favicon.svg" width="120" height="120" alt="PlanWiki Blueprint Logo" />
</p>

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-slate.svg)]()

</div>

---

## 📖 소개 (Introduction)

**PlanWiki**는 기획자가 작성한 요구사항, 마크다운 본문, WBS 단락 계층 구조, 그리고 브라우저 상에서 동작하는 인라인 인터랙티브 HTML/JS 프로토타입을 사용자의 **로컬 파일 시스템과 1:1로 직접 동기화**하며 관리하는 모던 기획 도구입니다.

클라우드 서버 가입이나 외부 데이터 유출 우려 없이 브라우저 보안 샌드박스(File System Access API)를 통해 내 컴퓨터 폴더에 모든 파일(`content.md`, `node.json`, `preview.html`)이 안전하게 보관되며, 원클릭으로 **AI 코딩 에이전트(Antigravity 등)**가 즉시 구현에 착수할 수 있는 통합 개발 패키지(`.zip`)를 생성합니다.

---

## ✨ 핵심 기능 (Key Features)

### 1. 📁 로컬 파일 시스템 직접 연동 (Local-First File System)
- 브라우저 보안 샌드박스 내에서 로컬 폴더를 직접 선택하여 기획서를 실시간 저장 및 동기화합니다.
- 서버나 클라우드 전송 없이 모든 데이터가 사용자의 로컬 디스크에 안전하게 100% 보관됩니다.
- 오프라인 환경에서도 인터넷 연결 여부와 상관없이 완벽하게 동작합니다.

### 2. 📑 WBS 자동 넘버링 & 위키 스타일 단락 계층 (Outliner Hierarchy)
- 위키 백과사전 형태의 `1.0`, `1.1`, `1.2` 아코디언 단락 구조를 자동으로 계산하여 매핑합니다.
- 단락 편집 모드에서 `[ ⇅ 위치/순서 ]` 컨트롤을 통해 순서 변경(위/아래) 및 계층 승격/들여쓰기(종속)를 간편하게 조작할 수 있습니다.
- 좌측 인터랙티브 TOC(목차) 사이드바로 방대한 기획서도 한눈에 탐색하고 빠르게 이동할 수 있습니다.

### 3. ⚡ 라이브 샌드박스 프로토타이핑 (Inlined Sandbox Simulator)
- 기획서 단락 본문 내에 HTML/CSS/JS 단일 파일 프로토타입을 인라인으로 작성할 수 있습니다.
- 격리된 iframe 샌드박스에서 실제 인터랙션 및 로직을 실시간으로 시뮬레이션할 수 있습니다.
- 데스크톱, 태블릿, 모바일 화면 크기 프리뷰 전환 기능을 기본 지원합니다.

### 4. 🤖 AI 코딩 에이전트 개발 핸드오프 (One-Click AI ZIP Bundle)
- 전체 기획서 트리, 프로토타입 코드, 요구사항 매트릭스를 AI 코딩 에이전트(Antigravity 등)가 즉시 개발에 착수할 수 있도록 최적화된 패키지(`.zip`)로 원클릭 번들링합니다.
- AI 에이전트가 단번에 기획 의도와 기술 스택, 시맨틱 구조를 파악할 수 있는 표준화된 패키지 메타데이터가 자동 생성됩니다.

### 5. 🌐 라우트별 사전 베이킹 (Pre-rendering / SSG) & SEO 완벽 지원
- Google, 네이버 검색엔진 봇과 카카오톡/슬랙/디스코드 등 SNS 크롤러가 사이트를 완벽히 감지할 수 있도록 빌드 시점에 각 라우트(`/`, `/workspace`, `/404`)를 정적 HTML로 사전 베이킹합니다.
- 백지 화면(White Flash) 없이 0초 만에 로고와 골격이 표시되며, OpenGraph 카드 미리보기를 완벽하게 지원합니다.

### 6. 💡 직관적인 사용법 가이드 팝업 (도움말 모달)
- 워크스페이스 및 프로젝트 허브 상단의 **물음표(?) 버튼**을 누르면 언제 어디서나 조작법과 유용한 팁을 확인할 수 있는 빠른 가이드 모달이 제공됩니다.

---

## 🚀 빠른 시작 (Quick Start)

### 요구사항
- Node.js 18.0 이상
- 최신 Chromium 기반 브라우저 권장 (Chrome, Edge 등 File System Access API 지원 브라우저)

### 설치 및 로컬 실행
```bash
# 1. 패키지 설치
npm install

# 2. 로컬 개발 서버 실행 (http://localhost:5173/)
npm run dev

# 3. 개발 서버 + 아키텍처 인스펙터 동시 실행 (권장)
npm run dev:all
```

---

## 🧭 상세 사용 가이드 (How to Use)

### 1단계: 새 프로젝트 시작하기
1. 서비스 접속 후 대시보드에서 **`+ 새 프로젝트 생성`** 버튼을 클릭합니다.
2. 프로젝트 제목과 폴더명을 입력하고, 내 컴퓨터에서 저장할 상위 위치를 선택합니다.
3. 로컬 폴더가 즉시 생성되며 기획 워크스페이스로 이동합니다.
   *(폴더 선택이 번거로울 때는 **`샘플 워크스페이스 열기`**를 누르면 가상 환경에서 즉시 체험 가능합니다)*

### 2단계: WBS 단락 작성 및 계층 조작
1. **`+ 최상위 항목 추가`**를 눌러 대단원(예: 1.0 프로젝트 개요)을 생성합니다.
2. 단락 우측의 **`+ 하위 단락`** 버튼을 눌러 소단원(1.1, 1.2 등)을 추가합니다.
3. 단락 헤더의 **`[ ⇅ 위치/순서 ]`** 버튼을 클릭하여:
   - **위로 이동 / 아래로 이동**: 같은 레벨 내 순서 변경
   - **계층 한 단계 승격**: 상위 레벨로 올리기 (예: 1.1.1 ➔ 1.2)
   - **앞 항목의 하위로 종속**: 하위 레벨로 들여쓰기 (예: 1.2 ➔ 1.1.1)

### 3단계: 마크다운 편집 & 인라인 목업 작성
1. 단락 내 **편집(연필 아이콘)** 버튼을 누르면 마크다운 에디터가 열립니다.
2. [인라인 목업 탭]을 클릭하고 HTML/CSS/JS 코드를 작성하면 우측 프리뷰 탭에서 실시간으로 렌더링됩니다.
3. [저장]을 누르면 내 로컬 폴더의 파일에 실시간으로 기록됩니다.

### 4단계: AI 패키지 내보내기 & 핸드오프
1. 상단 헤더 우측의 **`AI 패키지`** 버튼을 클릭합니다.
2. 전체 기획서 트리와 인라인 프로토타입이 포함된 `.zip` 압축 파일이 다운로드됩니다.
3. 다운로드된 패키지를 AI 코딩 에이전트(Antigravity 등)에 전달하여 즉시 구현을 시작할 수 있습니다.

---

## 🛠️ 명령어 레퍼런스 (Available Commands)

| 명령어 | 기능 설명 |
| :--- | :--- |
| `npm run dev` | 플랜위키 웹앱 개발 서버 실행 (`http://localhost:5173/`) |
| `npm run dev:admin` | 아키텍처 & 파이프라인 인스펙터 단독 실행 (`http://localhost:5174/`) |
| `npm run dev:all` | 플랜위키 앱 + 인스펙터 보드 동시 실행 |
| `npm run build` | TypeScript 검사 + Vite 번들링 + **라우트별 정적 HTML 사전 베이킹(`prerender.mjs`)** |
| `npm run preview` | 프로덕션 빌드 결과물 로컬 미리보기 서빙 |
| `npm run lint` | Oxlint 검사 + 아키텍처 주석 무결성 검증 (`lint:arch`) |
| `npm run lint:arch` | `@domain`, `@feature`, `@phase` 메타데이터 누락 기계적 검증 |
| `npm run test` | Vitest 단위 테스트 실행 |
| `npm run test:run` | Vitest 단발성 전체 테스트 실행 |

---

## 🏗️ 시스템 아키텍처 (Architecture)

```
PlanCraft/
├── public/
│   ├── favicon.svg             # 블루프린트 P 프레임 & WBS 모티프 브랜드 파비콘
│   └── icons.svg
├── scripts/
│   ├── prerender.mjs           # 라우트별 사전 베이킹 SSG 빌드 스크립트
│   ├── check-architecture-annotations.mjs # 아키텍처 주석 검증 린터
│   └── headless-check.mjs
├── src/
│   ├── components/
│   │   ├── common/             # 공통 컴포넌트 (Logo.tsx 등)
│   │   ├── modal/              # 팝업 모달 (HelpGuideModal.tsx, CreateProjectModal.tsx)
│   │   ├── layout/             # 레이아웃 셸 (Header.tsx)
│   │   ├── doc/                # 기획서 단락 아코디언 및 에디터
│   │   └── toc/                # WBS 목차 트리 사이드바
│   ├── lib/
│   │   ├── fileSystem/         # File System Access API & IndexedDB 로컬 저장소
│   │   ├── exportZip.ts        # AI 에이전트 연동 ZIP 번들러
│   │   └── markdownConvert.ts
│   ├── pages/
│   │   ├── ProjectHubPage.tsx  # 프로젝트 대시보드 허브
│   │   ├── WorkspaceView.tsx   # 기획 워크스페이스 뷰
│   │   └── NotFoundPage.tsx
│   └── router/
│       └── AppRouter.tsx       # 브라우저 라우터 구성
└── index.html                  # SEO & OpenGraph 메타데이터 템플릿
```

---

## 📄 라이선스 (License)

Private / EveNight-Lab. All rights reserved.
