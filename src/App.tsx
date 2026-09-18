/**
 * @domain 시스템 인프라 & UI
 * @feature 최상위 앱 셸
 * @phase 출력 (Render)
 * @target React 최상위 진입 조립체
 * @trigger 애플리케이션 시작
 * @desc ErrorBoundary, Sonner Toaster, AppRouter를 통합 구성하는 최상위 프로바이더 셸
 * @next src/router/AppRouter.tsx
 */
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary.tsx'
import { AppRouter } from '@/router/AppRouter.tsx'
import { ThemeProvider } from '@/context/ThemeContext.tsx'

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppRouter />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </ErrorBoundary>
  )
}
