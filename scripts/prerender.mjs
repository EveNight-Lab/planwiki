import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const templatePath = path.join(distDir, 'index.html');

if (!fs.existsSync(templatePath)) {
  console.error('❌ [Pre-render Error] dist/index.html 템플릿 파일이 존재하지 않습니다. 먼저 vite build를 실행해 주세요.');
  process.exit(1);
}

const baseTemplate = fs.readFileSync(templatePath, 'utf-8');

/**
 * 사전 베이킹할 라우트 목록 및 각 라우트별 메타데이터 / 시맨틱 프리렌더 HTML 정의
 */
const routes = [
  {
    path: '/',
    outputPath: path.join(distDir, 'index.html'),
    title: 'PlanWiki - 로컬 우선 기획 워크스페이스 & WBS 설계 도구',
    description: 'PlanWiki(플랜위키)는 내 컴퓨터의 로컬 마크다운 파일과 1:1 직접 동기화되는 로컬 우선 기획서 및 WBS 문서화 워크스페이스입니다. 실시간 목업 프리뷰와 AI 코딩 에이전트 연동 번들링을 제공합니다.',
    url: 'https://planwiki.web.app/',
    content: `
      <div id="prerender-shell" style="min-height: 100vh; background-color: #020617; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <header style="height: 56px; border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; max-width: 1152px; margin: 0 auto;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 12px; background: #0A0F1D; border: 1px solid #38BDF8; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; color: #38BDF8;">P</div>
            <strong style="font-size: 16px; letter-spacing: -0.02em; color: #38BDF8;">PlanWiki</strong>
            <span style="font-size: 12px; color: #64748b;">| 플랜위키 프로젝트 허브</span>
          </div>
        </header>
        <main style="max-width: 1152px; margin: 0 auto; padding: 32px 24px;">
          <section style="margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 800; color: #f8fafc; margin-bottom: 8px;">로컬 우선 기획 워크스페이스 & WBS 설계 도구</h1>
            <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; max-width: 800px;">
              내 컴퓨터의 로컬 마크다운 파일과 100% 실시간 동기화되며, 브라우저 보안 샌드박스를 통해 모든 기획 데이터가 로컬에 안전하게 보관됩니다.
              위키 스타일의 접이식 WBS 단락 계층, 라이브 HTML/JS 목업 시뮬레이터, AI 코딩 에이전트(Antigravity 등) 연동 번들링을 경험해보세요.
            </p>
          </section>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
            <article style="background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 20px;">
              <h2 style="font-size: 16px; font-weight: 700; color: #38bdf8; margin-bottom: 8px;">📁 로컬 파일 시스템 직접 연동</h2>
              <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">별도의 클라우드 가입 없이 내 컴퓨터의 폴더를 열고 마크다운 파일과 실시간 자동 저장</p>
            </article>
            <article style="background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 20px;">
              <h2 style="font-size: 16px; font-weight: 700; color: #38bdf8; margin-bottom: 8px;">📑 WBS 단락 계층 구조</h2>
              <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">1.0, 1.1, 1.2 위키 단락과 자유로운 계층 이동, 승격, 들여쓰기 조작</p>
            </article>
            <article style="background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 20px;">
              <h2 style="font-size: 16px; font-weight: 700; color: #38bdf8; margin-bottom: 8px;">⚡ 인라인 목업 샌드박스 & AI 번들러</h2>
              <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">기획서 내에서 인터랙티브 HTML/JS 목업을 실시간 시뮬레이션하고 AI 에이전트용 ZIP 패키지로 원클릭 내보내기</p>
            </article>
          </div>
        </main>
      </div>
    `,
  },
  {
    path: '/workspace',
    outputPath: path.join(distDir, 'workspace', 'index.html'),
    title: '기획 워크스페이스 | PlanWiki - 구조화된 기획서 에디터 & 목업 시뮬레이터',
    description: 'PlanWiki 기획 워크스페이스입니다. 로컬 마크다운 단락 편집, WBS 계층 트리 구조화, 인라인 인터랙티브 목업 샌드박스 시뮬레이션을 수행합니다.',
    url: 'https://planwiki.web.app/workspace',
    content: `
      <div id="prerender-shell" style="min-height: 100vh; background-color: #020617; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <header style="height: 64px; border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; max-width: 1152px; margin: 0 auto;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 12px; background: #0A0F1D; border: 1px solid #38BDF8; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; color: #38BDF8;">P</div>
            <strong style="font-size: 16px; letter-spacing: -0.02em; color: #38BDF8;">PlanWiki</strong>
            <span style="font-size: 12px; color: #64748b;">| 기획 워크스페이스</span>
          </div>
        </header>
        <main style="max-width: 1152px; margin: 0 auto; padding: 24px; display: grid; grid-template-columns: 260px 1fr; gap: 24px;">
          <aside style="background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 16px; height: calc(100vh - 120px);">
            <h2 style="font-size: 14px; font-weight: 700; color: #94a3b8; margin-bottom: 12px;">📑 목차 & WBS 트리</h2>
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: #64748b;">
              <div>1.0 프로젝트 개요</div>
              <div style="padding-left: 12px;">1.1 핵심 목표 및 기대 효과</div>
              <div style="padding-left: 12px;">1.2 세부 요구사항 매트릭스</div>
              <div>2.0 인라인 인터랙티브 프로토타입</div>
            </div>
          </aside>
          <section style="background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 24px;">
            <h1 style="font-size: 20px; font-weight: 800; color: #f8fafc; margin-bottom: 12px;">기획서 편집 및 실시간 시뮬레이션</h1>
            <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
              로컬 폴더의 기획 문서를 실시간으로 불러와 편집 중입니다. 마크다운 본문과 인터랙티브 목업 샌드박스를 자유롭게 오가며 AI 에이전트와 완벽히 호환되는 명세서를 완성하세요.
            </p>
          </section>
        </main>
      </div>
    `,
  },
  {
    path: '/404',
    outputPath: path.join(distDir, '404.html'),
    title: '페이지를 찾을 수 없습니다 | PlanWiki',
    description: '요청하신 페이지가 존재하지 않거나 경로가 변경되었습니다. PlanWiki 프로젝트 허브로 이동해주세요.',
    url: 'https://planwiki.web.app/404',
    content: `
      <div id="prerender-shell" style="min-height: 100vh; background-color: #020617; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px;">
        <div>
          <h1 style="font-size: 72px; font-weight: 900; color: #38bdf8; margin: 0 0 16px 0;">404</h1>
          <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc; margin-bottom: 8px;">페이지를 찾을 수 없습니다</h2>
          <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px;">요청하신 페이지 경로가 유효하지 않거나 삭제되었습니다.</p>
          <a href="/" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none;">홈으로 돌아가기</a>
        </div>
      </div>
    `,
  },
];

console.log('🚀 [Pre-render] 라우트별 사전 베이킹(Pre-rendering / SSG) 시작...');

for (const route of routes) {
  // 출력 디렉토리 확인 및 생성
  const targetDir = path.dirname(route.outputPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 템플릿 메타태그 치환
  let html = baseTemplate;

  // 1. Title 치환
  html = html.replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`);

  // 2. Meta Description 치환
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    `<meta name="description" content="${route.description}" />`
  );

  // 3. OpenGraph 메타태그 치환
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/,
    `<meta property="og:title" content="${route.title}" />`
  );
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/,
    `<meta property="og:description" content="${route.description}" />`
  );

  // 4. Twitter 메타태그 치환
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/,
    `<meta name="twitter:title" content="${route.title}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/,
    `<meta name="twitter:description" content="${route.description}" />`
  );

  // 5. Canonical 및 OG URL 추가 (기존에 없으면 head 닫는 태그 앞에 삽입)
  const canonicalTag = `<link rel="canonical" href="${route.url}" />\n    <meta property="og:url" content="${route.url}" />`;
  html = html.replace('</head>', `    ${canonicalTag}\n  </head>`);

  // 6. 시맨틱 프리렌더 콘텐츠를 <div id="root"> 안에 삽입
  html = html.replace('<div id="root"></div>', `<div id="root">${route.content.trim()}</div>`);

  fs.writeFileSync(route.outputPath, html, 'utf-8');
  console.log(`  ✓ 베이킹 완료: ${route.path} -> ${path.relative(distDir, route.outputPath)}`);
}

console.log('✨ [Pre-render] 모든 라우트 사전 베이킹이 성공적으로 완료되었습니다!');
