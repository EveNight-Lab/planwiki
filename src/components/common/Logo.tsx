/**
 * @domain 공통 컴포넌트
 * @feature 브랜딩 및 로고 표시
 * @phase 출력
 * @target PlanWiki 브랜드 로고 및 3단계 청사진 폴딩 애니메이션 SVG 컴포넌트
 * @desc 호버/홀드 시 3단계 접힘, 클릭/터치 시 역순 3단계 탄성 펼침 기계식 인터랙션
 */
import React, { useState, useRef, useCallback } from 'react';

interface LogoProps {
  size?: number | string;
  className?: string;
  showText?: boolean;
  subTitle?: string;
  interactive?: boolean;
}

export const Logo: React.FC<LogoProps> & { _previewProps?: LogoProps } = ({
  size = 32,
  className = '',
  showText = false,
  subTitle,
  interactive = true,
}) => {
  const [isFolded, setIsFolded] = useState(false);
  const isTouchRef = useRef(false);

  // Desktop hover interactions
  const handleMouseEnter = useCallback(() => {
    if (!interactive || isTouchRef.current) return;
    setIsFolded(true);
  }, [interactive]);

  const handleMouseLeave = useCallback(() => {
    if (!interactive || isTouchRef.current) return;
    setIsFolded(false);
  }, [interactive]);

  // Click / Tap interactions (unfold or toggle)
  const handleClick = useCallback(() => {
    if (!interactive) return;
    setIsFolded((prev) => !prev);
  }, [interactive]);

  // Mobile hold to fold, release to unfold
  const handleTouchStart = useCallback(() => {
    if (!interactive) return;
    isTouchRef.current = true;
    setIsFolded(true);
  }, [interactive]);

  const handleTouchEnd = useCallback(() => {
    if (!interactive) return;
    // Brief retention before spring unfolding
    setTimeout(() => {
      setIsFolded(false);
      setTimeout(() => {
        isTouchRef.current = false;
      }, 350);
    }, 120);
  }, [interactive]);

  // Transition timings
  // Folding: Box(0ms) -> Branch(150ms) -> Stem(300ms)
  // Unfolding (reverse): Stem(0ms) -> Branch(150ms) -> Box(300ms)
  const stemTransition = isFolded
    ? 'transform 160ms cubic-bezier(0.4, 0, 0.2, 1) 300ms'
    : 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1) 0ms';

  const branchTransition = isFolded
    ? 'transform 160ms cubic-bezier(0.4, 0, 0.2, 1) 150ms'
    : 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1) 150ms';

  const boxTransition = isFolded
    ? 'transform 160ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, opacity 120ms ease-out 0ms'
    : 'transform 240ms cubic-bezier(0.34, 1.56, 0.64, 1) 300ms, opacity 180ms ease-in 300ms';

  return (
    <div
      className={`flex items-center gap-2.5 ${interactive ? 'cursor-pointer select-none' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      title={interactive ? 'PlanWiki 로고 (호버: 접힘 / 클릭: 펼침)' : 'PlanWiki'}
    >
      <div
        className="shrink-0 flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{ width: size, height: size }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 120 120"
          width="100%"
          height="100%"
          className="w-full h-full block overflow-visible"
        >
          {/* ======================================================== */}
          {/* [파츠 3: 최하위 레이어 - 가로 분기선 2개 & 하단 네모 박스 2개] */}
          {/* ======================================================== */}

          {/* 3-A. 상단 브랜치 (y=72축: 가로선 + 1.1 서브 모듈) */}
          <g
            style={{
              transformBox: 'view-box',
              transformOrigin: '32px 72px',
              transform: isFolded ? 'scaleX(0)' : 'scaleX(1)',
              transition: branchTransition,
            }}
          >
            {/* 가로선 (x=32 -> 46) */}
            <path
              d="M 32 72 H 46"
              stroke="#0284C7"
              strokeWidth="3"
              strokeLinecap="square"
            />

            {/* 1.1 서브 모듈 박스 (세로 높이 납작화) */}
            <g
              style={{
                transformBox: 'view-box',
                transformOrigin: '46px 72px',
                transform: isFolded ? 'scaleY(0)' : 'scaleY(1)',
                opacity: isFolded ? 0.3 : 1,
                transition: boxTransition,
              }}
            >
              <rect
                x="46"
                y="65"
                width="42"
                height="14"
                fill="none"
                stroke="#0284C7"
                strokeWidth="2"
              />
              <rect
                x="52"
                y="69"
                width="5"
                height="6"
                fill="#0284C7"
                style={{
                  opacity: isFolded ? 0 : 1,
                  transition: isFolded ? 'opacity 80ms ease 0ms' : 'opacity 160ms ease 320ms',
                }}
              />
              <rect
                x="62"
                y="70.5"
                width="18"
                height="3"
                fill="#64748B"
                style={{
                  opacity: isFolded ? 0 : 1,
                  transition: isFolded ? 'opacity 80ms ease 0ms' : 'opacity 160ms ease 320ms',
                }}
              />
            </g>
          </g>

          {/* 3-B. 하단 브랜치 (y=86축: 가로선 + 1.2 액티브 서브 모듈) */}
          <g
            style={{
              transformBox: 'view-box',
              transformOrigin: '32px 86px',
              transform: isFolded ? 'scaleX(0)' : 'scaleX(1)',
              transition: branchTransition,
            }}
          >
            {/* 가로선 (x=32 -> 46) */}
            <path
              d="M 32 86 H 46"
              stroke="#0284C7"
              strokeWidth="3"
              strokeLinecap="square"
            />

            {/* 1.2 서브 모듈 박스 (세로 높이 납작화) */}
            <g
              style={{
                transformBox: 'view-box',
                transformOrigin: '46px 86px',
                transform: isFolded ? 'scaleY(0)' : 'scaleY(1)',
                opacity: isFolded ? 0.3 : 1,
                transition: boxTransition,
              }}
            >
              <rect
                x="46"
                y="79"
                width="42"
                height="14"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2"
              />
              <rect
                x="52"
                y="83"
                width="5"
                height="6"
                fill="#38BDF8"
                style={{
                  opacity: isFolded ? 0 : 1,
                  transition: isFolded ? 'opacity 80ms ease 0ms' : 'opacity 160ms ease 320ms',
                }}
              />
              <rect
                x="62"
                y="84.5"
                width="18"
                height="3"
                fill="#38BDF8"
                style={{
                  opacity: isFolded ? 0 : 1,
                  transition: isFolded ? 'opacity 80ms ease 0ms' : 'opacity 160ms ease 320ms',
                }}
              />
            </g>
          </g>

          {/* ======================================================== */}
          {/* [파츠 2: 중간 레이어 - P 세로 기둥 축 (y: 56 -> 94)] */}
          {/* ======================================================== */}
          <g
            style={{
              transformBox: 'view-box',
              transformOrigin: '32px 56px',
              transform: isFolded ? 'scaleY(0)' : 'scaleY(1)',
              transition: stemTransition,
            }}
          >
            <path
              d="M 32 56 V 94"
              stroke="#38BDF8"
              strokeWidth="4"
              strokeLinecap="square"
            />
          </g>

          {/* ======================================================== */}
          {/* [파츠 1: 최상위 레이어 - P 상단 사각 헤드 루프 & 1.0 모듈] */}
          {/* ======================================================== */}
          {/* P 상단 사각 루프 프레임 */}
          <path
            d="M 32 56 V 26 H 88 V 56 H 32"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="4"
            strokeLinejoin="miter"
            strokeLinecap="square"
          />

          {/* 1.0 단락 추상 모듈 (인덱스 슬롯 + 메인 콘텐츠 바) */}
          <rect x="42" y="34" width="10" height="14" fill="#38BDF8" />
          <rect x="58" y="38" width="20" height="6" fill="#38BDF8" />

          {/* 설계 원점 앵커 포인트 */}
          <rect
            x="29"
            y="23"
            width="6"
            height="6"
            fill="#FFFFFF"
            stroke="#0284C7"
            strokeWidth="1"
          />
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

Logo._previewProps = {
  size: 48,
  showText: true,
  subTitle: '기계식 청사진 폴딩 로고',
  interactive: true,
};

