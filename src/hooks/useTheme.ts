/**
 * @domain 화면 스타일 & 테마
 * @feature 다크/라이트 테마 전환
 * @phase 저장소
 * @target 테마 상태 반전 및 저장
 * @store 브라우저 설정 기억 (theme)
 * @desc 현재 테마를 브라우저에 저장하고 화면 스타일을 즉시 반전
 * @next src/index.css
 */
import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme | null
      if (saved) return saved
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return { theme, toggleTheme, setTheme }
}
