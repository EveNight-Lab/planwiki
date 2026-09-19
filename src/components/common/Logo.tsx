/**
 * @domain 공통 컴포넌트
 * @feature 브랜딩 및 로고 표시
 * @phase 출력
 * @desc 청사진 및 WBS 계층 트리 모티브의 PlanWiki 브랜드 로고 SVG 컴포넌트
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
        className="shrink-0 overflow-hidden rounded-xl shadow-md shadow-blue-900/20 ring-1 ring-white/10"
        style={{ width: size, height: size }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 120 120"
          width="100%"
          height="100%"
          className="w-full h-full block"
        >
          {/* 베이스 배경 캔버스 (각진 직각 라운딩) */}
          <rect width="120" height="120" rx="20" fill="#0A0F1D" />

          {/* 배경 미세 설계 그리드선 */}
          <path
            d="M26 40 H94 M26 62 H94 M26 84 H94 M44 24 V96 M70 24 V96"
            stroke="#152033"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* [P 루프 = 좌측 기둥 축 + 1.0 직각 단락 프레임] */}
          <path
            d="M 32 94 V 26 H 88 V 56 H 32"
            fill="#101D33"
            stroke="#38BDF8"
            strokeWidth="4"
            strokeLinejoin="miter"
            strokeLinecap="square"
          />

          {/* 1.0 단락 추상 모듈 (인덱스 슬롯 + 메인 콘텐츠 바) */}
          <rect x="42" y="34" width="10" height="14" fill="#38BDF8" />
          <rect x="58" y="38" width="20" height="6" fill="#BAE6FD" />

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
            fill="#132035"
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
            fill="#132035"
            stroke="#38BDF8"
            strokeWidth="2"
          />
          <rect x="52" y="83" width="5" height="6" fill="#38BDF8" />
          <rect x="62" y="84.5" width="18" height="3" fill="#38BDF8" />

          {/* 설계 원점 앵커 포인트 */}
          <rect x="29" y="23" width="6" height="6" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              PlanWiki
            </span>
          </div>
          {subTitle && (
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
              {subTitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
