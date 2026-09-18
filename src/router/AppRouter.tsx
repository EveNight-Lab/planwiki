/**
 * @domain 시스템 인프라 & 라우팅
 * @feature 라우터 셸
 * @phase 입력
 * @target 브라우저 주소 감지기
 * @trigger 브라우저 주소 변경 및 탐색 이벤트
 * @desc 브라우저 주소에 따라 프로젝트 선택 허브와 기획서 작업 공간 화면을 전환
 * @next src/pages/ProjectHubPage.tsx, src/pages/WorkspaceView.tsx
 */
import { BrowserRouter, Routes, Route } from 'react-router'
import { ProjectHubPage } from '@/pages/ProjectHubPage.tsx'
import { WorkspaceView } from '@/pages/WorkspaceView.tsx'
import { NotFoundPage } from '@/pages/NotFoundPage.tsx'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProjectHubPage />} />
        <Route path="/workspace" element={<WorkspaceView />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

