/**
 * @domain 공통 컴포넌트
 * @feature 브랜딩 및 로고 표시
 * @phase 출력
 * @desc 투명 배경 기반의 인디고 블루 & 바이올렛 듀얼 톤 PlanWiki 브랜드 로고 SVG 컴포넌트
 */
import React from 'react';

interface LogoProps {
  size?: number | string;
  className?: string;
  showText?: boolean;
  subTitle?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 32,
  className = '',
  showText = false,
  subTitle,
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="shrink-0 flex items-center justify-center transition-transform hover:scale-105"
        style={{ width: size, height: size }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 120 120"
          width="100%"
          height="100%"
          className="w-full h-full block"
        >
          {/* [P 루프 = 좌측 기둥 축 + 1.0 직각 단락 프레임] */}
          <path
            d="M 32 94 V 26 H 88 V 56 H 32"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="4"
            strokeLinejoin="miter"
            strokeLinecap="square"
          />

          {/* 1.0 단락 추상 모듈 (인덱스 슬롯 + 메인 콘텐츠 바) */}
          <rect x="42" y="34" width="10" height="14" fill="#38BDF8" />
          <rect x="58" y="38" width="20" height="6" fill="#38BDF8" />

          {/* 하위 단락 WBS 직각 분기선 */}
          <path
            d="M 32 72 H 46 M 32 86 H 46"
            stroke="#0284C7"
            strokeWidth="3"
            strokeLinecap="square"
          />

          {/* [1.1 서브 모듈 블록] */}
          <rect
            x="46"
            y="65"
            width="42"
            height="14"
            fill="none"
            stroke="#0284C7"
            strokeWidth="2"
          />
          <rect x="52" y="69" width="5" height="6" fill="#0284C7" />
          <rect x="62" y="70.5" width="18" height="3" fill="#64748B" />

          {/* [1.2 서브 모듈 블록 (액티브)] */}
          <rect
            x="46"
            y="79"
            width="42"
            height="14"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
          />
          <rect x="52" y="83" width="5" height="6" fill="#38BDF8" />
          <rect x="62" y="84.5" width="18" height="3" fill="#38BDF8" />

          {/* 설계 원점 앵커 포인트 */}
          <rect x="29" y="23" width="6" height="6" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 dark:from-indigo-400 dark:via-indigo-300 dark:to-violet-400 bg-clip-text text-transparent">
              PlanWiki
            </span>
          </div>
          {subTitle && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none mt-0.5">
              {subTitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
