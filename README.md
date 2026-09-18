# 📚 PlanWiki (플랜위키)
> **로컬 파일 시스템 기반 단일 문서형 기획 워크스페이스 & AI 개발 핸드오프 도구**

PlanWiki는 기획자가 작성한 요구사항, 마크다운 본문, 단락 계층 구조, 그리고 브라우저 상에서 동작하는 인라인 HTML/JS 프로토타입을 로컬 파일 시스템과 1:1로 직접 동기화하며 관리하는 모던 기획 도구입니다.

---

## ✨ Key Features

1. **로컬 파일 시스템 직접 연동 (File System Access API)**
   - 브라우저 보안 샌드박스 내에서 로컬 폴더를 직접 선택하여 기획서(`content.md`, `node.json`, `preview.html`)를 실시간 저장 및 동기화합니다.
   - 서버나 클라우드 전송 없이 모든 데이터가 사용자의 로컬 디스크에 안전하게 보관됩니다.

2. **위키 스타일의 접이식 단락 & 동적 계층 구조**
   - 위키 백과사전 형태의 1.1, 1.2 아코디언 단락 구조를 제공합니다.
   - 단락 편집 모드에서 `[ ⇅ 위치/순서 ]` 드롭다운을 통해 순서 변경(위/아래) 및 계층 승격/들여쓰기(종속)를 간편하게 조작할 수 있습니다.

3. **라이브 샌드박스 프로토타이핑 (Inlined Sandbox)**
   - 기획서 본문 내에 HTML/CSS/JS 단일 파일 프로토타입을 인라인으로 작성하고, 실시간 반응형 뷰어로 인터랙션 및 로직을 직접 시뮬레이션할 수 있습니다.

4. **AI 코딩 에이전트 개발 핸드오프 (One-Click ZIP Export)**
   - 전체 기획서 트리, 프로토타입 코드, 요구사항 매트릭스를 AI 코딩 에이전트(Antigravity 등)가 즉시 개발에 착수할 수 있도록 최적화된 패키지(`.zip`)로 원클릭 번들링합니다.

5. **다양한 허브 보기 모드 & 다크/라이트 테마**
   - 프로젝트 허브에서 3열 그리드, 2열 와이드, 1열 컴팩트 리스트 뷰를 자유롭게 전환할 수 있습니다.
   - 시스템 설정 및 사용자 취향에 맞춘 선명한 라이트/다크 모드를 완벽 지원합니다.

---

## 🛠 Tech Stack

- **Core**: React 19, TypeScript, Vite 8, React Router v7
- **Styling**: Tailwind CSS v4, Lucide Icons, clsx
- **Markdown & Storage**: Marked, Turndown, JSZip, File System Access API, IndexedDB
- **Quality & Architecture**: Vitest, Architecture Annotation Lint (`npm run lint:arch`)

---

## ⚡ Quick Start

```bash
# 의존성 패키지 설치
npm install

# 서비스 앱 실행 (http://localhost:5173/)
npm run dev

# 서비스 앱과 아키텍처 인스펙터 동시 실행
npm run dev:all
```

---

## 📜 Available Commands

| 명령어 | 설명 |
| :--- | :--- |
| `npm run dev` | 플랜위키 웹앱 실행 (`http://localhost:5173/`) |
| `npm run dev:admin` | 아키텍처 & 파이프라인 인스펙터 대시보드 단독 실행 (`http://localhost:5174/`) |
| `npm run dev:all` | 플랜위키 앱 + 인스펙터 보드 동시 실행 |
| `npm run build` | TypeScript 타입 체크 및 프로덕션 번들 빌드 |
| `npm run lint` | 코드 린트 + 아키텍처 주석 검증 (`lint:arch`) 연쇄 실행 |
| `npm run lint:arch` | `@domain`, `@feature`, `@phase` 메타데이터 누락 기계적 검증 |
| `npm run test` | Vitest 단위 테스트 실행 |

---

## 📄 License
Private / EveNight-Lab
