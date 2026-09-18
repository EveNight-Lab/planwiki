/**
 * @domain 화면 스타일 & 테마
 * @feature 다크/라이트 테마 전환
 * @phase 입력
 * @target 테마 전환 버튼
 * @trigger 해/달 아이콘 버튼 클릭
 * @desc 화면의 밝은 모드와 어두운 모드를 전환하도록 요청
 * @next src/hooks/useTheme.ts
 */
import { Sun, Moon } from 'lucide-react';
import { useGlobalTheme } from '../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useGlobalTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="라이트/다크 테마 전환"
      title={theme === 'dark' ? '밝은 라이트 모드로 전환' : '어두운 다크 모드로 전환'}
      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 cursor-pointer"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      )}
    </button>
  );
}
