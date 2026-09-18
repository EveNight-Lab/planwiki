/**
 * @domain 화면 스타일 & 테마
 * @feature 다크/라이트 테마 전역 공급
 * @phase 저장소
 * @target 전역 테마 상태 관리 프로바이더
 * @desc 앱 전체에서 단일 테마 상태를 공유하고 HTML 태그의 .dark 클래스를 즉각 조작
 * @next src/App.tsx
 */
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'light'; // Default to clean bright light mode
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useGlobalTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useGlobalTheme must be used within a ThemeProvider');
  }
  return ctx;
}
